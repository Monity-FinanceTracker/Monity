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
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
    })),
}));

const { createClient } = require('@supabase/supabase-js');
const supabaseMock = createClient();

describe('API Endpoints', () => {
    beforeAll((done) => {
        app = createServer(supabaseMock);
        server = app.listen(3002, done); 
    });

    afterAll((done) => {
        server.close(done);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/v1/auth/register', () => {
        it('should create a new user and return 201', async () => {
            const mockUser = { id: '123', email: 'test@example.com' };
            const mockSession = { access_token: 'fake-token' };
            supabaseMock.auth.signUp.mockResolvedValue({ data: { user: mockUser, session: mockSession }, error: null });
            supabaseMock.from('categories').insert.mockResolvedValue({ error: null });

            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({ email: 'test@example.com', password: 'password123', name: 'Test User' });

            expect(response.status).toBe(201);
            expect(response.body.user).toEqual(mockUser);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should log in a user and return a session', async () => {
            const mockUser = { id: '123', email: 'test@example.com' };
            const mockSession = { access_token: 'fake-token' };
            supabaseMock.auth.signInWithPassword.mockResolvedValue({ data: { user: mockUser, session: mockSession }, error: null });

            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(response.status).toBe(200);
            expect(response.body.session).toEqual(mockSession);
        });
    });

    describe('GET /api/v1/transactions', () => {
        it('should return 401 if no token is provided', async () => {
            const response = await request(app).get('/api/v1/transactions');
            expect(response.status).toBe(401);
        });

        it('should return transactions for an authenticated user', async () => {
            const mockUser = { id: '123', user_metadata: { role: 'user' } };
            supabaseMock.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
            
            const mockTransactions = [{ id: 1, description: 'Test', amount: 100 }];
            supabaseMock.from('transactions').select().eq.mockResolvedValue({ data: mockTransactions, error: null });

            const response = await request(app)
                .get('/api/v1/transactions')
                .set('Authorization', 'Bearer fake-token');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockTransactions);
        });
    });
});