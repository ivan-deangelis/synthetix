import { faker } from '@faker-js/faker';
import { SchemaField } from '@/types/schema';

export function generateMockData(fields: SchemaField[], count: number = 1): any[] {
  return Array.from({ length: count }).map(() => {
    const item: any = {};
    
    fields.forEach(field => {
      item[field.name] = generateValueForField(field);
    });

    return item;
  });
}

function generateValueForField(field: SchemaField): any {
  if (field.type === 'array') {
    const count = faker.number.int({ min: 1, max: 5 });
    if (field.children && field.children.length > 0) {
      // Array of objects
      return Array.from({ length: count }).map(() => {
        const item: any = {};
        field.children!.forEach(child => {
          item[child.name] = generateValueForField(child);
        });
        return item;
      });
    } else {
      // Array of primitives
      return Array.from({ length: count }).map(() => generatePrimitiveValue(field.arrayItemType || 'string', field.name, field.fakerType));
    }
  } else if (field.type === 'object') {
    const item: any = {};
    if (field.children) {
      field.children.forEach(child => {
        item[child.name] = generateValueForField(child);
      });
    }
    return item;
  } else {
    return generatePrimitiveValue(field.type, field.name, field.fakerType);
  }
}

function generatePrimitiveValue(type: string, fieldName: string, fakerType?: string): any {
  // If a specific faker type is selected, use it
  if (fakerType) {
    try {
      switch (fakerType) {
        case 'person.firstName': return faker.person.firstName();
        case 'person.lastName': return faker.person.lastName();
        case 'person.fullName': return faker.person.fullName();
        case 'internet.email': return faker.internet.email();
        case 'phone.number': return faker.phone.number();
        case 'location.streetAddress': return faker.location.streetAddress();
        case 'location.city': return faker.location.city();
        case 'location.country': return faker.location.country();
        case 'location.zipCode': return faker.location.zipCode();
        case 'company.name': return faker.company.name();
        case 'person.jobTitle': return faker.person.jobTitle();
        case 'commerce.productName': return faker.commerce.productName();
        case 'commerce.productDescription': return faker.commerce.productDescription();
        case 'lorem.paragraph': return faker.lorem.paragraph();
        case 'lorem.sentence': return faker.lorem.sentence();
        case 'lorem.word': return faker.lorem.word();
        case 'string.uuid': return faker.string.uuid();
        case 'image.url': return faker.image.url();
        case 'image.avatar': return faker.image.avatar();
        case 'internet.url': return faker.internet.url();
        
        case 'number.int': return faker.number.int({ min: 0, max: 1000 });
        case 'commerce.price': return parseFloat(faker.commerce.price());
        case 'person.age': return faker.number.int({ min: 18, max: 90 });
        case 'date.pastYear': return faker.date.past().getFullYear();
        case 'location.latitude': return faker.location.latitude();
        case 'location.longitude': return faker.location.longitude();
        
        case 'datatype.boolean': return faker.datatype.boolean();
      }
    } catch (e) {
      console.warn(`Failed to generate faker value for type ${fakerType}, falling back to auto-detect`);
    }
  }

  // Fallback to auto-detect based on name
  const name = fieldName.toLowerCase();

  switch (type) {
    case 'number':
      if (name.includes('price') || name.includes('cost')) return parseFloat(faker.commerce.price());
      if (name.includes('age')) return faker.number.int({ min: 18, max: 90 });
      if (name.includes('year')) return faker.date.past().getFullYear();
      if (name.includes('count') || name.includes('quantity')) return faker.number.int({ min: 0, max: 100 });
      return faker.number.int({ min: 0, max: 1000 });
    
    case 'boolean':
      return faker.datatype.boolean();
    
    case 'string':
      if (name.includes('email')) return faker.internet.email();
      if (name.includes('name')) {
        if (name.includes('first')) return faker.person.firstName();
        if (name.includes('last')) return faker.person.lastName();
        return faker.person.fullName();
      }
      if (name.includes('phone')) return faker.phone.number();
      if (name.includes('address')) return faker.location.streetAddress();
      if (name.includes('city')) return faker.location.city();
      if (name.includes('country')) return faker.location.country();
      if (name.includes('date') || name.includes('at')) return faker.date.recent().toISOString();
      if (name.includes('image') || name.includes('avatar')) return faker.image.avatar();
      if (name.includes('url') || name.includes('website')) return faker.internet.url();
      if (name.includes('description')) return faker.lorem.sentence();
      if (name.includes('id')) return faker.string.uuid();
      return faker.lorem.word();
      
    default:
      return faker.lorem.word();
  }
}
