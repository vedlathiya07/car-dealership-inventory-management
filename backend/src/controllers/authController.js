import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const register = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || password.length < 6) {
            return res.status(400).json({
                error: 'Email and a password of at least 6 characters are required'
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // Automatically make user an ADMIN if email contains 'admin'
        const assignedRole = role || (email.toLowerCase().includes('admin') ? 'ADMIN' : 'USER');
        const user = await User.create({ email, password: hashedPassword, role: assignedRole });

        return res.status(201).json({ userId: user._id });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Email is already registered' });
        }
        return res.status(500).json({ error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const jwtSecret = process.env.JWT_SECRET || 'secret';
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            jwtSecret,
            { expiresIn: '1d' }
        );

        return res.status(200).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
