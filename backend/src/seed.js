import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import { v2 as cloudinary } from 'cloudinary';
import { Vehicle } from './models/Vehicle.js';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const sampleVehicles = [
    {
        make: 'Tesla',
        model: 'Model Y',
        category: 'SUV',
        price: 45000,
        quantity: 10,
        tempUrl: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=800'
    },
    {
        make: 'BMW',
        model: 'M4 Coupe',
        category: 'Coupe',
        price: 78000,
        quantity: 4,
        tempUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=800'
    },
    {
        make: 'Porsche',
        model: '911 GT3',
        category: 'Coupe',
        price: 169700,
        quantity: 2,
        tempUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=800'
    },
    {
        make: 'Ford',
        model: 'F-150 Raptor',
        category: 'Truck',
        price: 72500,
        quantity: 6,
        tempUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800'
    },
    {
        make: 'Audi',
        model: 'e-tron GT',
        category: 'Sedan',
        price: 104900,
        quantity: 5,
        tempUrl: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?q=80&w=800'
    },
    {
        make: 'Mercedes-Benz',
        model: 'G-Class',
        category: 'SUV',
        price: 139900,
        quantity: 3,
        tempUrl: 'https://images.unsplash.com/photo-1520050206274-a1ae446cb3cc?q=80&w=800'
    },
    {
        make: 'Chevrolet',
        model: 'Corvette Z06',
        category: 'Convertible',
        price: 112000,
        quantity: 0,
        tempUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800'
    },
    {
        make: 'Honda',
        model: 'Civic Type R',
        category: 'Hatchback',
        price: 43790,
        quantity: 8,
        tempUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=800'
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB for seeding...');

        console.log('Clearing existing vehicles...');
        await Vehicle.deleteMany({});

        const seededVehicles = [];

        for (const car of sampleVehicles) {
            console.log(`Uploading image for ${car.make} ${car.model} to Cloudinary...`);
            try {
                const uploadResult = await cloudinary.uploader.upload(car.tempUrl, {
                    folder: 'car-dealership',
                    resource_type: 'auto'
                });
                
                seededVehicles.push({
                    make: car.make,
                    model: car.model,
                    category: car.category,
                    price: car.price,
                    quantity: car.quantity,
                    imageUrl: uploadResult.secure_url
                });
                console.log(`Uploaded image successfully: ${uploadResult.secure_url}`);
            } catch (err) {
                console.error(`Failed to upload image for ${car.make} ${car.model}: ${err.message}`);
                // Fallback to Unsplash URL directly if upload fails
                seededVehicles.push({
                    make: car.make,
                    model: car.model,
                    category: car.category,
                    price: car.price,
                    quantity: car.quantity,
                    imageUrl: car.tempUrl
                });
            }
        }

        console.log('Inserting vehicles into DB...');
        await Vehicle.insertMany(seededVehicles);
        console.log('Database seeded successfully with Cloudinary-hosted images! 🎉');
    } catch (err) {
        console.error('Seeding process encountered an error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
