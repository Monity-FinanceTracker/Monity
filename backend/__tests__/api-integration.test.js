const request = require('supertest');
const { createServer } = require('../server');

let server;
let app;

// Mock the logger to prevent issues with morgan
jest.mock('../utils/logger', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    },
    morganMiddleware: (req, res, next) => next(),
}));

// Mocking dependencies
jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({
        auth: {
            signUp: jest.fn(),
            signInWithPassword: jest.fn(),
            getUser: jest.fn(),
        },
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
    })),
}));

const { createClient } = require('@supabase/supabase-js');
const supabaseMock = createClient();

describe('API Integration Tests', () => {
    beforeAll((done) => {
        app = createServer(supabaseMock);
        server = app.listen(3003, done);
    });

    afterAll((done) => {
        server.close(done);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock a successful authentication for all protected routes
        supabaseMock.auth.getUser.mockResolvedValue({
            data: { user: { id: 'test-user-id', user_metadata: { role: 'user' } } },
            error: null
        });
    });

    describe('Transaction API', () => {
        it('should create a transaction with valid data', async () => {
            const validTransaction = {
                description: 'Test grocery shopping',
                amount: 45.67,
                category: 'Food',
                date: '2024-01-15',
                typeId: 1
            };
            supabaseMock.from('transactions').insert().select().single.mockResolvedValue({ data: { id: 'new-id', ...validTransaction }, error: null });

            const response = await request(server)
                .post('/api/v1/transactions')
                .set('Authorization', 'Bearer fake-token')
                .send(validTransaction)
                .expect(201);

            expect(response.body.description).toBe(validTransaction.description);
        });
    });

    describe('Security Middleware', () => {
        it('should include security headers in responses', async () => {
            supabaseMock.from('transactions').select().eq.mockResolvedValue({ data: [], error: null });
            const response = await request(server)
                .get('/api/v1/transactions')
                .set('Authorization', 'Bearer fake-token')
                .expect(200);

            expect(response.headers['x-content-type-options']).toBe('nosniff');
            expect(response.headers['x-frame-options']).toBe('DENY');
            expect(response.headers['strict-transport-security']).toBeDefined();
        });
    });
}); 