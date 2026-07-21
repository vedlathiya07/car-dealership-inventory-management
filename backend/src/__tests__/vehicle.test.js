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

describe('GET /api/vehicles/search', () => {
    beforeEach(async () => {
        await Vehicle.insertMany([
            { make: 'Toyota', model: 'Camry', category: 'Sedan', price: 25000, quantity: 5 },
            { make: 'Toyota', model: 'RAV4', category: 'SUV', price: 30000, quantity: 2 },
            { make: 'Honda', model: 'Civic', category: 'Sedan', price: 20000, quantity: 4 },
            { make: 'Ford', model: 'Mustang', category: 'Coupe', price: 40000, quantity: 1 }
        ]);
    });

    it('should filter vehicles by make alone', async () => {
        const res = await request(app)
            .get('/api/vehicles/search?make=Toyota')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body.every(v => v.make === 'Toyota')).toBe(true);
    });

    it('should filter vehicles by model alone', async () => {
        const res = await request(app)
            .get('/api/vehicles/search?model=Civic')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].model).toBe('Civic');
    });

    it('should filter vehicles by category alone', async () => {
        const res = await request(app)
            .get('/api/vehicles/search?category=Sedan')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
    });

    it('should filter vehicles by price range (minPrice and maxPrice)', async () => {
        const res = await request(app)
            .get('/api/vehicles/search?minPrice=22000&maxPrice=32000')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
    });

    it('should combine multiple filters', async () => {
        const res = await request(app)
            .get('/api/vehicles/search?make=Toyota&category=SUV')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].model).toBe('RAV4');
    });
});
