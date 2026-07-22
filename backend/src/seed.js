import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Vehicle } from './models/Vehicle.js';

dotenv.config();

const sampleVehicles = [
    { make: 'Toyota', model: 'Camry', category: 'Sedan', price: 26000, quantity: 8 },
    { make: 'Toyota', model: 'RAV4', category: 'SUV', price: 31000, quantity: 5 },
    { make: 'Honda', model: 'Civic', category: 'Sedan', price: 23000, quantity: 12 },
    { make: 'Ford', model: 'Mustang', category: 'Coupe', price: 42000, quantity: 3 },
    { make: 'Tesla', model: 'Model 3', category: 'Sedan', price: 39000, quantity: 0 } // out of stock
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB for seeding...');
        await Vehicle.deleteMany({});
        await Vehicle.insertMany(sampleVehicles);
        console.log('Database seeded successfully! 🎉');
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
