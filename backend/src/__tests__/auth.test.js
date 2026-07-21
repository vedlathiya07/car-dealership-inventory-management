import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import { User } from '../models/User.js';

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await User.deleteMany({});
});

describe('POST /api/auth/register', () => {
    it('should register a new user and return 201 with userId', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('userId');
    });
});

it('should return 400 if email is already registered', async () => {
    // Pre-create user
    await User.create({ email: 'duplicate@example.com', password: 'hashedpassword' });

    const res = await request(app)
        .post('/api/auth/register')
        .send({
            email: 'duplicate@example.com',
            password: 'password123'
        });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
});

it('should return 400 if password is missing or weak (less than 6 characters)', async () => {
    const res = await request(app)
        .post('/api/auth/register')
        .send({
            email: 'weak@example.com',
            password: '123' // too short
        });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
});

describe('POST /api/auth/login', () => {
    it('should return 200 and JWT token on correct credentials', async () => {
        // Register user first
        await request(app)
            .post('/api/auth/register')
            .send({ email: 'loginuser@example.com', password: 'password123' });

        // Attempt login
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'loginuser@example.com', password: 'password123' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should return 401 on wrong password or unknown user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nonexistent@example.com', password: 'password123' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error');
    });
});
