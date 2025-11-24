import { ApiSchema, SchemaField } from '@/types/schema';
import { z } from 'zod';

export const fieldNameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;

const schemaFieldSchema: z.ZodType<SchemaField> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string()
      .min(1, 'Field name is required')
      .regex(fieldNameRegex, 'Field name must start with a letter and contain only letters, numbers, and underscores'),
    type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
    required: z.boolean(),
    description: z.string().optional(),
    children: z.array(schemaFieldSchema).optional(),
    arrayItemType: z.enum(['string', 'number', 'boolean', 'array', 'object']).optional(),
  })
);

export const apiSchemaValidation = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  endpointSlug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  fields: z.array(schemaFieldSchema).min(1, 'At least one field is required'),
});

export function validateSchema(schema: ApiSchema): { success: boolean; error?: string } {
  const result = apiSchemaValidation.safeParse(schema);
  
  if (!result.success) {
    // Format the first error message
    const firstError = result.error.issues[0];
    const path = firstError.path.join('.');
    return { success: false, error: `${path}: ${firstError.message}` };
  }

  // Check for duplicate field names at the same level
  const checkDuplicates = (fields: SchemaField[]): string | null => {
    const names = new Set<string>();
    for (const field of fields) {
      if (names.has(field.name)) {
        return `Duplicate field name found: "${field.name}"`;
      }
      names.add(field.name);
      
      if (field.children && field.children.length > 0) {
        const childError = checkDuplicates(field.children);
        if (childError) return childError;
      }
    }
    return null;
  };

  const duplicateError = checkDuplicates(schema.fields);
  if (duplicateError) {
    return { success: false, error: duplicateError };
  }

  return { success: true };
}
