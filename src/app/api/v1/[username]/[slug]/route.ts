import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { NextRequest } from 'next/server';
import { generateMockData } from '@/utils/dataGeneration';
import { SchemaField } from '@/types/schema';

// Helper to fill null fields with Faker-generated data
function fillNullFields(data: any[], schema: SchemaField[]): any[] {
  return data.map(item => {
    const filledItem = { ...item };
    
    schema.forEach(field => {
      // If field is null/undefined AND it has a fakerType, generate Faker data
      if ((filledItem[field.name] === null || filledItem[field.name] === undefined) && field.fakerType) {
        // Generate a single value for this field
        const generated = generateMockData([field], 1);
        if (generated.length > 0) {
          filledItem[field.name] = generated[0][field.name];
        }
      }
      
      // Handle nested objects
      if (field.type === 'object' && field.children && filledItem[field.name]) {
        filledItem[field.name] = fillNullFields([filledItem[field.name]], field.children)[0];
      }
      
      // Handle arrays of objects
      if (field.type === 'array' && field.arrayItemType === 'object' && field.children && Array.isArray(filledItem[field.name])) {
        filledItem[field.name] = fillNullFields(filledItem[field.name], field.children);
      }
    });
    
    return filledItem;
  });
}

import { createAdminClient } from '@/utils/supabase/admin';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string; slug: string }> }
) {
  const { username, slug } = await params;
  const { searchParams } = new URL(req.url);

  const supabase = await createClient();

  // 1. Get user_id from username using RPC
  const { data: userId, error: userError } = await supabase
    .rpc('get_user_id_by_username', { username });

  if (userError || !userId) {
    console.error('User lookup error:', userError);
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // 2. Fetch API definition using user_id and slug
  const { data: api, error } = await supabase
    .from('apis')
    .select('*')
    .eq('user_id', userId)
    .eq('endpoint_slug', slug)
    .single();

  if (error || !api) {
    return NextResponse.json({ error: 'API not found' }, { status: 404 });
  }

  try {
    const requestedLimit = searchParams.get('limit');
    const limit = requestedLimit ? Math.min(parseInt(requestedLimit), 100) : 1;

    // Check if we have stored mock data
    if (api.mock_data && Array.isArray(api.mock_data) && api.mock_data.length > 0) {
      const slicedData = api.mock_data.slice(0, limit);
      
      // Fill any null fields with Faker data at runtime
      const filledData = fillNullFields(slicedData, api.schema_definition as SchemaField[]);
      
      const response = NextResponse.json(filledData);
      
      // Apply custom headers
      if (api.headers) {
        Object.entries(api.headers).forEach(([key, value]) => {
          response.headers.set(key, value as string);
        });
      }
      
      return response;
    }

    // Fallback to on-the-fly generation
    const data = generateMockData(api.schema_definition, limit);

    const response = NextResponse.json(data);

    // Apply custom headers
    if (api.headers) {
      Object.entries(api.headers).forEach(([key, value]) => {
        response.headers.set(key, value as string);
      });
    }

    return response;
  } catch (err) {
    console.error('Data generation error:', err);
    return NextResponse.json({ error: 'Failed to generate data' }, { status: 500 });
  }
}
