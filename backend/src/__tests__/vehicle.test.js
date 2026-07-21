import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import { Vehicle } from '../models/Vehicle.js';

let mongoServer;
let userToken;
let adminToken;

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    userToken = jwt.sign({ userId: 'user123', role: 'USER' }, JWT_SECRET);
    adminToken = jwt.sign({ userId: 'admin123', role: 'ADMIN' }, JWT_SECRET);
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

describe('PUT /api/vehicles/:id', () => {
    it('should return 401 if unauthenticated', async () => {
        const vehicle = await Vehicle.create({
            make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 18000, quantity: 2
        });

        const res = await request(app)
            .put(`/api/vehicles/${vehicle._id}`)
            .send({ price: 19000 });

        expect(res.statusCode).toBe(401);
    });

    it('should update a vehicle and return 200 when authenticated', async () => {
        const vehicle = await Vehicle.create({
            make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 18000, quantity: 2
        });

        const res = await request(app)
            .put(`/api/vehicles/${vehicle._id}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ price: 19000, quantity: 4 });

        expect(res.statusCode).toBe(200);
        expect(res.body.price).toBe(19000);
        expect(res.body.quantity).toBe(4);
    });

    it('should return 404 for unknown vehicle ID', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .put(`/api/vehicles/${fakeId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ price: 19000 });

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error');
    });
});

describe('DELETE /api/vehicles/:id', () => {
    it('should return 403 for non-admin user', async () => {
        const vehicle = await Vehicle.create({
            make: 'Nissan', model: 'Altima', category: 'Sedan', price: 21000, quantity: 1
        });

        const res = await request(app)
            .delete(`/api/vehicles/${vehicle._id}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(403);
    });

    it('should delete vehicle and return 200 for ADMIN user', async () => {
        const vehicle = await Vehicle.create({
            make: 'Nissan', model: 'Altima', category: 'Sedan', price: 21000, quantity: 1
        });

        const res = await request(app)
            .delete(`/api/vehicles/${vehicle._id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message');
    });

    it('should return 404 for unknown vehicle ID on delete', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .delete(`/api/vehicles/${fakeId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error');
    });
});

describe('POST /api/vehicles/:id/purchase', () => {
    it('should decrement vehicle quantity by 1 and return 200', async () => {
        const vehicle = await Vehicle.create({
            make: 'Mazda', model: 'CX-5', category: 'SUV', price: 28000, quantity: 3
        });

        const res = await request(app)
            .post(`/api/vehicles/${vehicle._id}/purchase`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.quantity).toBe(2);
    });

    it('should return 400 if vehicle quantity is already 0', async () => {
        const vehicle = await Vehicle.create({
            make: 'Mazda', model: 'CX-5', category: 'SUV', price: 28000, quantity: 0
        });

        const res = await request(app)
            .post(`/api/vehicles/${vehicle._id}/purchase`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('should return 404 for unknown vehicle ID on purchase', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .post(`/api/vehicles/${fakeId}/purchase`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error');
    });
});

describe('POST /api/vehicles/:id/restock', () => {
    it('should return 403 for non-admin user on restock', async () => {
        const vehicle = await Vehicle.create({
            make: 'Tesla', model: 'Model 3', category: 'Sedan', price: 35000, quantity: 1
        });

        const res = await request(app)
            .post(`/api/vehicles/${vehicle._id}/restock`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ quantity: 5 });

        expect(res.statusCode).toBe(403);
    });

    it('should increment vehicle quantity and return 200 for ADMIN user', async () => {
        const vehicle = await Vehicle.create({
            make: 'Tesla', model: 'Model 3', category: 'Sedan', price: 35000, quantity: 1
        });

        const res = await request(app)
            .post(`/api/vehicles/${vehicle._id}/restock`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ quantity: 5 });

        expect(res.statusCode).toBe(200);
        expect(res.body.quantity).toBe(6);
    });
});
