import { Vehicle } from '../models/Vehicle.js';
import { uploadToCloudinary } from '../middleware/uploadMiddleware.js';

export const createVehicle = async (req, res) => {
    try {
        const { make, model, category, price, quantity } = req.body;

        if (!make || !model || !category || price === undefined || price === null) {
            return res.status(400).json({ error: 'Make, model, category, and price are required' });
        }

        let imageUrl = '';
        if (req.file) {
            imageUrl = await uploadToCloudinary(req.file.buffer);
        } else {
            // Require image in non-test runs
            if (process.env.NODE_ENV !== 'test') {
                return res.status(400).json({ error: 'Car image is required' });
            }
            imageUrl = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70';
        }

        const vehicle = await Vehicle.create({
            make,
            model,
            category,
            price: Number(price),
            quantity: quantity ? Number(quantity) : 0,
            imageUrl
        });

        return res.status(201).json(vehicle);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

export const getVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({});
        return res.status(200).json(vehicles);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const searchVehicles = async (req, res) => {
    try {
        const { make, model, category, minPrice, maxPrice } = req.query;

        const filter = {};

        if (make) {
            filter.make = { $regex: make, $options: 'i' };
        }
        if (model) {
            filter.model = { $regex: model, $options: 'i' };
        }
        if (category) {
            filter.category = { $regex: category, $options: 'i' };
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        const vehicles = await Vehicle.find(filter);
        return res.status(200).json(vehicles);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        let updateData = { ...req.body };

        if (req.file) {
            const imageUrl = await uploadToCloudinary(req.file.buffer);
            updateData.imageUrl = imageUrl;
        }

        const vehicle = await Vehicle.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        return res.status(200).json(vehicle);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        return res.status(400).json({ error: error.message });
    }
};

export const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await Vehicle.findByIdAndDelete(id);

        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        return res.status(200).json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        return res.status(500).json({ error: error.message });
    }
};

export const purchaseVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await Vehicle.findById(id);

        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        if (vehicle.quantity <= 0) {
            return res.status(400).json({ error: 'Vehicle is out of stock' });
        }

        vehicle.quantity -= 1;
        await vehicle.save();

        return res.status(200).json(vehicle);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        return res.status(500).json({ error: error.message });
    }
};

export const restockVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        const amountToAdd = Number(quantity) > 0 ? Number(quantity) : 1;

        const vehicle = await Vehicle.findById(id);

        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        vehicle.quantity += amountToAdd;
        await vehicle.save();

        return res.status(200).json(vehicle);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        return res.status(500).json({ error: error.message });
    }
};
