export type FieldType = 'string' | 'number' | 'boolean' | 'array' | 'object';

export interface SchemaField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  description?: string;
  // For nested objects
  children?: SchemaField[];
  // For arrays
  arrayItemType?: FieldType;
  // For specific data generation
  // For specific data generation
  fakerType?: string;
  aiInstruction?: string;
}

export interface ApiSchema {
  id?: string;
  name: string;
  description: string;
  endpointSlug: string;
  fields: SchemaField[];
  is_public?: boolean;
  mock_data?: any[];
  headers?: Record<string, string>;
}
