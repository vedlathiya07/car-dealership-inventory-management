import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const app = express();
app.use(express.json());

// Test routes
app.get('/test-auth', requireAuth, (req, res) => {
    res.json({ message: 'authenticated', user: req.user });
});

app.get('/test-admin', requireAuth, requireAdmin, (req, res) => {
    res.json({ message: 'admin access granted' });
});

describe('Auth & Admin Middleware', () => {
    describe('requireAuth', () => {
        it('should return 401 if no Authorization header is provided', async () => {
            const res = await request(app).get('/test-auth');
            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error');
        });

        it('should return 401 if token is invalid or malformed', async () => {
            const res = await request(app)
                .get('/test-auth')
                .set('Authorization', 'Bearer invalidtoken123');
            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error');
        });

        it('should pass and attach user payload when valid token is provided', async () => {
            const token = jwt.sign({ userId: 'user123', role: 'USER' }, JWT_SECRET);
            const res = await request(app)
                .get('/test-auth')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.user).toHaveProperty('userId', 'user123');
        });
    });

    describe('requireAdmin', () => {
        it('should return 403 if user role is not ADMIN', async () => {
            const token = jwt.sign({ userId: 'user123', role: 'USER' }, JWT_SECRET);
            const res = await request(app)
                .get('/test-admin')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(403);
            expect(res.body).toHaveProperty('error');
        });

        it('should pass if user role is ADMIN', async () => {
            const token = jwt.sign({ userId: 'admin123', role: 'ADMIN' }, JWT_SECRET);
            const res = await request(app)
                .get('/test-admin')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
        });
    });
});
