import { generateMockData } from '../dataGeneration';
import { SchemaField } from '@/types/schema';

describe('generateMockData', () => {
  it('should generate data matching the schema structure', () => {
    const fields: SchemaField[] = [
      { id: '1', name: 'name', type: 'string', required: true },
      { id: '2', name: 'age', type: 'number', required: true },
      { id: '3', name: 'isActive', type: 'boolean', required: true }
    ];

    const data = generateMockData(fields, 2);
    
    expect(data).toHaveLength(2);
    expect(typeof data[0].name).toBe('string');
    expect(typeof data[0].age).toBe('number');
    expect(typeof data[0].isActive).toBe('boolean');
  });

  it('should handle nested objects', () => {
    const fields: SchemaField[] = [
      { 
        id: '1', 
        name: 'address', 
        type: 'object', 
        required: true,
        children: [
          { id: '1.1', name: 'city', type: 'string', required: true },
          { id: '1.2', name: 'zip', type: 'string', required: true }
        ]
      }
    ];

    const data = generateMockData(fields, 1);
    
    expect(typeof data[0].address).toBe('object');
    expect(typeof data[0].address.city).toBe('string');
    expect(typeof data[0].address.zip).toBe('string');
  });

  it('should handle arrays of primitives', () => {
    const fields: SchemaField[] = [
      { 
        id: '1', 
        name: 'tags', 
        type: 'array', 
        required: true,
        arrayItemType: 'string'
      }
    ];

    const data = generateMockData(fields, 1);
    
    expect(Array.isArray(data[0].tags)).toBe(true);
    expect(data[0].tags.length).toBeGreaterThan(0);
    expect(typeof data[0].tags[0]).toBe('string');
  });

  it('should respect fakerType when provided', () => {
    const fields: SchemaField[] = [
      { 
        id: '1', 
        name: 'customEmail', 
        type: 'string', 
        required: true,
        fakerType: 'internet.email'
      },
      {
        id: '2',
        name: 'customCity',
        type: 'string',
        required: true,
        fakerType: 'location.city'
      }
    ];

    const data = generateMockData(fields, 5);
    
    data.forEach(item => {
      expect(item.customEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(typeof item.customCity).toBe('string');
      expect(item.customCity.length).toBeGreaterThan(0);
    });
  });
});
