const request = require('supertest');
const express = require('express');
const { apiLimiter, authLimiter } = require('../middleware/rateLimiter');
const helmet = require('helmet');

const app = express();
app.use(express.json());

describe('Security Middleware', () => {
    test('should apply security headers', (done) => {
        const testApp = express();
        testApp.use(helmet());
        testApp.get('/test-headers', (req, res) => res.json({ status: 'ok' }));

        request(testApp)
            .get('/test-headers')
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-content-type-options']).toBe('nosniff');
                expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
            })
            .end(done);
    });

    describe('Rate Limiting', () => {
        test('should allow requests within limits', (done) => {
            const testApp = express();
            testApp.use('/api', apiLimiter);
            testApp.get('/api/test', (req, res) => res.json({ status: 'ok' }));

            request(testApp)
                .get('/api/test')
                .expect(200)
                .expect((res) => {
                    expect(res.headers['ratelimit-remaining']).toBeDefined();
                })
                .end(done);
        });
    });
}); 