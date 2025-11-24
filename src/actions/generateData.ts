'use server'

import { openai } from '@/lib/openai';
import { ApiSchema } from '@/types/schema';
import { z } from 'zod';

export async function generateDataWithAi(schema: ApiSchema, count: number = 1, context?: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API Key is missing');
  }

  // Construct a simplified schema representation for the prompt
  const schemaStructure = JSON.stringify(schema.fields.map(f => ({
    name: f.name,
    type: f.type,
    description: f.description,
    aiInstruction: f.aiInstruction, // Include the specific instruction
    children: f.children ? '...' : undefined
  })), null, 2);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano-2025-08-07",
      messages: [
        {
          role: "system",
          content: `You are a data generation engine. Generate ${count} items of realistic, coherent, and context-aware mock data based on the provided API schema.
          
          Rules:
          1. The data must strictly follow the schema structure.
          2. The data should be realistic (e.g., if there is a 'price' and 'discount', the discount should be logical).
          3. Text fields should have coherent content (e.g., a product description should match the product name).
          4. Return a JSON object with a 'data' property containing the array of items.
          5. **CRITICAL**: If a field has an 'aiInstruction', you MUST follow it strictly for that specific field.
          6. **CRITICAL**: Ensure strict cross-field consistency. (e.g., if 'gender' is 'Female', 'biography' must use 'she/her' pronouns; if 'country' is 'Japan', 'city' must be a Japanese city).
          ${context ? `7. IMPORTANT: Generate data specifically for the following context: "${context}". Ensure all fields relate to this context.` : ''}
          `
        },
        { 
          role: "user", 
          content: `Schema: ${schemaStructure}\n\nGenerate ${count} items.${context ? `\nContext: ${context}` : ''}` 
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
    console.error('AI Data Generation Error:', error);
    throw new Error('Failed to generate data with AI');
  }
}
