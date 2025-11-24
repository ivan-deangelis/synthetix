import { validateSchema } from '../schemaValidation';
import { ApiSchema } from '@/types/schema';

describe('validateSchema', () => {
  it('should validate a correct schema', () => {
    const schema: ApiSchema = {
      name: 'Test API',
      description: 'A test API',
      endpointSlug: 'test-api',
      fields: [
        { id: '1', name: 'field1', type: 'string', required: true }
      ]
    };
    const result = validateSchema(schema);
    expect(result.success).toBe(true);
  });

  it('should fail if name is too short', () => {
    const schema: ApiSchema = {
      name: 'Te',
      description: 'A test API',
      endpointSlug: 'test-api',
      fields: [
        { id: '1', name: 'field1', type: 'string', required: true }
      ]
    };
    const result = validateSchema(schema);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Name must be at least 3 characters');
  });

  it('should fail if endpointSlug contains invalid characters', () => {
    const schema: ApiSchema = {
      name: 'Test API',
      description: 'A test API',
      endpointSlug: 'Test API',
      fields: [
        { id: '1', name: 'field1', type: 'string', required: true }
      ]
    };
    const result = validateSchema(schema);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Slug must contain only lowercase letters');
  });

  it('should fail if fields are empty', () => {
    const schema: ApiSchema = {
      name: 'Test API',
      description: 'A test API',
      endpointSlug: 'test-api',
      fields: []
    };
    const result = validateSchema(schema);
    expect(result.success).toBe(false);
    expect(result.error).toContain('At least one field is required');
  });

  it('should fail if field name is invalid', () => {
    const schema: ApiSchema = {
      name: 'Test API',
      description: 'A test API',
      endpointSlug: 'test-api',
      fields: [
        { id: '1', name: '123field', type: 'string', required: true }
      ]
    };
    const result = validateSchema(schema);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Field name must start with a letter');
  });

  it('should fail if duplicate field names exist', () => {
    const schema: ApiSchema = {
      name: 'Test API',
      description: 'A test API',
      endpointSlug: 'test-api',
      fields: [
        { id: '1', name: 'field1', type: 'string', required: true },
        { id: '2', name: 'field1', type: 'number', required: true }
      ]
    };
    const result = validateSchema(schema);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Duplicate field name found');
  });
});
