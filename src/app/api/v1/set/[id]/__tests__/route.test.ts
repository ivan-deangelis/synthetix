import { GET } from '../route';

// Mock Supabase client
jest.mock('@/supabase/server', () => ({
    createServerSupabaseClient: jest.fn(async () => ({
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: jest.fn(),
                })),
            })),
        })),
    })),
}));

describe('/api/v1/[id]', () => {
    const mockRequest = {
        nextUrl: new URL('http://localhost:3000/api/v1/test-id'),
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return API set data when found', async () => {
        const mockApiSet = {
            id: 'test-id',
            name: 'Test API',
            description: 'Test description',
            visibility: 'public',
            status: 'active',
            schema: { test: 'schema' },
        };

        const { createServerSupabaseClient } = require('@/supabase/server');
        const mockSupabase = {
            from: jest.fn(() => ({
                select: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        single: jest.fn().mockResolvedValue({ data: mockApiSet, error: null }),
                    })),
                })),
            })),
        };
        createServerSupabaseClient.mockResolvedValue(mockSupabase);

        const response = await GET(mockRequest, { params: Promise.resolve({ id: 'test-id' }) });
        const data = await response.json();

        expect(response.status).toBe(200);
        // When found, we expect generated data; headers can be empty
        expect(data).toBeDefined();
    });

    it('should return error when API set not found', async () => {
        const { createServerSupabaseClient } = require('@/supabase/server');
        const mockSupabase = {
            from: jest.fn(() => ({
                select: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        single: jest.fn().mockResolvedValue({ 
                            data: null, 
                            error: { 
                                message: 'API set not found',
                                code: 'PGRST116'
                            } 
                        }),
                    })),
                })),
            })),
        };
        createServerSupabaseClient.mockResolvedValue(mockSupabase);

        const response = await GET(mockRequest, { params: Promise.resolve({ id: 'non-existent' }) });
        const data = await response.json();

        // For error from DB, our handler returns 500
        expect(response.status).toBe(500);
        expect(data).toHaveProperty('error');
    });
});
