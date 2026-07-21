import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import { Vehicle } from '../models/Vehicle.js';

let mongoServer;
let userToken;

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    userToken = jwt.sign({ userId: 'user123', role: 'USER' }, JWT_SECRET);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await Vehicle.deleteMany({});
});

describe('Vehicle Endpoints - Create & List', () => {
    describe('POST /api/vehicles', () => {
        it('should return 401 if unauthenticated', async () => {
            const res = await request(app)
                .post('/api/vehicles')
                .send({ make: 'Toyota', model: 'Camry', category: 'Sedan', price: 25000, quantity: 5 });

            expect(res.statusCode).toBe(401);
        });

        it('should return 400 if required fields are missing', async () => {
            const res = await request(app)
                .post('/api/vehicles')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ make: 'Toyota' });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error');
        });

        it('should create a vehicle and return 201 when authenticated', async () => {
            const vehicleData = {
                make: 'Toyota',
                model: 'Camry',
                category: 'Sedan',
                price: 25000,
                quantity: 5
            };

            const res = await request(app)
                .post('/api/vehicles')
                .set('Authorization', `Bearer ${userToken}`)
                .send(vehicleData);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.make).toBe('Toyota');
        });
    });

    describe('GET /api/vehicles', () => {
        it('should return 200 and a list of vehicles', async () => {
            await Vehicle.create({
                make: 'Honda',
                model: 'Civic',
                category: 'Sedan',
                price: 22000,
                quantity: 3
            });

            const res = await request(app)
                .get('/api/vehicles')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(1);
            expect(res.body[0].make).toBe('Honda');
        });
    });
});
