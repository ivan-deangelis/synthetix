import { GET, POST } from '../route';

// Mock Next.js Request
const createMockRequest = (body: string, headers: Record<string, string> = {}) => {
    return {
        json: async () => {
            try {
                return JSON.parse(body);
            } catch {
                throw new Error('Invalid JSON');
            }
        },
        headers: new Map(Object.entries(headers)),
        nextUrl: new URL('http://localhost:3000/api/v1'),
    } as any;
};

describe('/api/v1', () => {
    describe('GET', () => {
        it('should return a successful response with correct data', async () => {
            const mockRequest = createMockRequest('');
            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toHaveProperty('message', 'Hello from API v1!');
            expect(data).toHaveProperty('version', '1.0.0');
            expect(data).toHaveProperty('status', 'success');
            expect(data).toHaveProperty('timestamp');
            expect(new Date(data.timestamp)).toBeInstanceOf(Date);
        });
    });

    describe('POST', () => {
        it('should return received data when valid JSON is sent', async () => {
            const testData = { name: 'Test User', email: 'test@example.com' };
            const request = createMockRequest(JSON.stringify(testData), {
                'Content-Type': 'application/json',
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toHaveProperty('message', 'Data received successfully');
            expect(data).toHaveProperty('receivedData', testData);
            expect(data).toHaveProperty('status', 'success');
            expect(data).toHaveProperty('timestamp');
        });

        it('should return error when invalid JSON is sent', async () => {
            const request = createMockRequest('invalid json', {
                'Content-Type': 'application/json',
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toHaveProperty('error', 'Invalid JSON data');
            expect(data).toHaveProperty('status', 'error');
        });
    });
});
