import { generateHybridData } from '../generateHybridData';
import { ApiSchema } from '@/types/schema';

// Mock dependencies
jest.mock('@/lib/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  },
}));

jest.mock('@/utils/dataGeneration', () => ({
  generateMockData: jest.fn(),
}));

describe('generateHybridData', () => {
  const mockSchema: ApiSchema = {
    name: 'Test API',
    description: 'Test Description',
    endpointSlug: 'test-api',
    fields: [
      { id: '1', name: 'aiField', type: 'string', required: true, aiInstruction: 'Generate a cool name' },
      { id: '2', name: 'fakerField', type: 'string', required: true, fakerType: 'person.firstName' }
    ]
  };

  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should fallback to Faker when OPENAI_API_KEY is missing', async () => {
    delete process.env.OPENAI_API_KEY;
    const { generateMockData } = require('@/utils/dataGeneration');
    generateMockData.mockReturnValue([{ aiField: 'faker', fakerField: 'faker' }]);

    const result = await generateHybridData(mockSchema);

    expect(generateMockData).toHaveBeenCalled();
    expect(result).toEqual([{ aiField: 'faker', fakerField: 'faker' }]);
  });

  it('should use Faker directly if no fields have AI instructions', async () => {
    const noAiSchema: ApiSchema = {
      ...mockSchema,
      fields: [{ id: '1', name: 'fakerField', type: 'string', required: true, fakerType: 'person.firstName' }]
    };
    
    const { generateMockData } = require('@/utils/dataGeneration');
    generateMockData.mockReturnValue([{ fakerField: 'faker' }]);

    const result = await generateHybridData(noAiSchema);

    expect(generateMockData).toHaveBeenCalled();
    expect(result).toEqual([{ fakerField: 'faker' }]);
  });

  it('should use OpenAI when key is present and instructions exist', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    const { openai } = require('@/lib/openai');
    
    openai.chat.completions.create.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({ data: [{ aiField: 'AI Generated', fakerField: null }] })
          }
        }
      ]
    });

    const result = await generateHybridData(mockSchema);

    expect(openai.chat.completions.create).toHaveBeenCalled();
    expect(result).toEqual([{ aiField: 'AI Generated', fakerField: null }]);
  });
});
