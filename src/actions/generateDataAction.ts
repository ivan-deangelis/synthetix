'use server'

import { createClient } from '@/utils/supabase/server';
import { generateHybridData } from '@/actions/generateHybridData';
import { SchemaField, ApiSchema } from '@/types/schema';

// Helper to detect if schema has new AI-instructed fields
function hasNewAiFields(oldSchema: SchemaField[], newSchema: SchemaField[]): boolean {
  const oldFieldNames = new Set(oldSchema.map(f => f.name));
  
  // Check if any new field has AI instructions
  return newSchema.some(field => {
    const isNewField = !oldFieldNames.has(field.name);
    return isNewField && field.aiInstruction;
  });
}

interface GenerateDataParams {
  apiId: string;
  schema: ApiSchema;
  generationCount?: number;
  aiContext?: string;
  isSchemaUpdate?: boolean;
  oldSchema?: SchemaField[];
}

export async function generateDataAction(params: GenerateDataParams) {
  try {
    const { apiId, schema, generationCount, aiContext, isSchemaUpdate, oldSchema } = params;
    
    console.log('[generateDataAction] Starting background generation...', { 
      apiId, 
      isSchemaUpdate, 
      hasOldSchema: !!oldSchema,
      schemaFieldCount: schema?.fields?.length || 0,
      generationCount 
    });
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('[generateDataAction] Unauthorized: No user');
      throw new Error('Unauthorized');
    }

    if (!apiId || !schema) {
      console.error('[generateDataAction] Missing required fields');
      throw new Error('Missing required fields');
    }

    // Verify API belongs to user
    const { data: api, error: fetchError } = await supabase
      .from('apis')
      .select('*')
      .eq('id', apiId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !api) {
      console.error('[generateDataAction] API not found:', fetchError);
      throw new Error('API not found');
    }

    // If this is a schema update, check if we need to regenerate
    if (isSchemaUpdate && oldSchema) {
      const needsRegeneration = hasNewAiFields(oldSchema, schema.fields);
      console.log('[generateDataAction] Schema update check:', { needsRegeneration });
      
      if (!needsRegeneration) {
        console.log('[generateDataAction] No new AI fields, setting status to active');
        await supabase
          .from('apis')
          .update({ status: 'active' })
          .eq('id', apiId);
        return { success: true, status: 'active' as const, skipped: true };
      }
    }

    // Update status to generating
    console.log('[generateDataAction] Setting status to generating');
    await supabase
      .from('apis')
      .update({ status: 'generating' })
      .eq('id', apiId);

    // Generate hybrid data (AI for fields with instructions, Faker for others)
    try {
      console.log('[generateDataAction] Starting hybrid data generation...');
      const mockData = await generateHybridData(schema, generationCount || 10, aiContext || '');
      console.log('[generateDataAction] Generated', mockData.length, 'items');
      
      // Merge with existing data if this is an update
      let finalData = mockData;
      if (isSchemaUpdate && api.mock_data && Array.isArray(api.mock_data) && api.mock_data.length > 0) {
        console.log('[generateDataAction] Merging with existing data');
        // Merge: take existing data and add new fields from generated data
        finalData = api.mock_data.map((existingItem: any, index: number) => {
          const newItem = mockData[index] || {};
          return { ...existingItem, ...newItem };
        });
        
        // If we generated more items than existing, append them
        if (mockData.length > api.mock_data.length) {
          finalData = [...finalData, ...mockData.slice(api.mock_data.length)];
        }
      }
      
      // Update with generated data and set status to active
      console.log('[generateDataAction] Updating database with final data');
      await supabase
        .from('apis')
        .update({ 
          mock_data: finalData,
          status: 'active'
        })
        .eq('id', apiId);

      console.log('[generateDataAction] Success! Status set to active');
      return { success: true, status: 'active' as const };
    } catch (error) {
      console.error('[generateDataAction] AI generation error:', error);
      
      // Update status to failed
      await supabase
        .from('apis')
        .update({ status: 'failed' })
        .eq('id', apiId);

      throw new Error(`AI generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  } catch (error) {
    console.error('[generateDataAction] Background generation error:', error);
    throw error;
  }
}
