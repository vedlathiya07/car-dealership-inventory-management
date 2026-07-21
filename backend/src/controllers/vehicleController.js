import { Vehicle } from '../models/Vehicle.js';

export const createVehicle = async (req, res) => {
    try {
        const { make, model, category, price, quantity } = req.body;

        if (!make || !model || !category || price === undefined || price === null) {
            return res.status(400).json({ error: 'Make, model, category, and price are required' });
        }

        const vehicle = await Vehicle.create({
            make,
            model,
            category,
            price,
            quantity: quantity ?? 0
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
