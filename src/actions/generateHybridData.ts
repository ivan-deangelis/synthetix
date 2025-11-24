'use server'

import { openai } from '@/lib/openai';
import { ApiSchema, SchemaField } from '@/types/schema';
import { generateMockData } from '@/utils/dataGeneration';

// Helper to check if a field or any of its children have AI instructions
function hasAiInstructions(field: SchemaField): boolean {
  if (field.aiInstruction) return true;
  if (field.children) {
    return field.children.some(child => hasAiInstructions(child));
  }
  return false;
}

// Helper to check if schema has any AI instructions
function schemaHasAiInstructions(schema: ApiSchema): boolean {
  return schema.fields.some(field => hasAiInstructions(field));
}

export async function generateHybridData(schema: ApiSchema, count: number = 10, context?: string) {
  // Check if any fields have AI instructions
  const needsAi = schemaHasAiInstructions(schema);

  if (!needsAi) {
    // If no AI instructions, just use Faker for everything
    return generateMockData(schema.fields, count);
  }

  // We have AI instructions, so we need to generate with AI
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OpenAI API Key missing, falling back to Faker for all fields');
    return generateMockData(schema.fields, count);
  }

  const schemaStructure = JSON.stringify(schema.fields.map(f => ({
    name: f.name,
    type: f.type,
    fakerType: f.fakerType,
    aiInstruction: f.aiInstruction,
    children: f.children ? '...' : undefined
  })), null, 2);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano-2025-08-07",
      messages: [
        {
          role: "system",
          content: `You are a hybrid data generation engine. Generate ${count} items of realistic mock data based ONLY on fields with AI instructions.

CRITICAL RULES:
1. ONLY generate data for fields that have an 'aiInstruction' property.
2. For fields WITHOUT 'aiInstruction' (those with only 'fakerType'): set them to null or omit them entirely.
3. For fields WITH 'aiInstruction': Generate data following those specific instructions precisely.
4. The data must strictly follow the schema structure.
5. Ensure cross-field consistency for AI-generated fields.
6. Return a JSON object with a 'data' property containing the array of items.
${context ? `7. CONTEXT: Generate AI-instructed fields for: "${context}".` : ''}

Example:
If schema has:
- username (aiInstruction: "italian usernames") → GENERATE
- description (fakerType: "lorem.sentence", NO aiInstruction) → SET TO NULL
- phone (fakerType: "phone.number", NO aiInstruction) → SET TO NULL
`
        },
        { 
          role: "user", 
          content: `Schema: ${schemaStructure}\n\nGenerate ${count} items. Remember: ONLY generate data for fields with 'aiInstruction'. Set all other fields to null.${context ? `\nContext: ${context}` : ''}` 
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content generated');
    }

    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed.data)) {
      throw new Error('Invalid response format: expected "data" array');
    }

    return parsed.data;

  } catch (error) {
    console.error('Hybrid Data Generation Error:', error);
    throw new Error('Failed to generate hybrid data');
  }
}
