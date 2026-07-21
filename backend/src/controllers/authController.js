import bcrypt from 'bcrypt';
import { User } from '../models/User.js';

export const register = async (req, res) => {
    try {
        const { email, password } = req.body;

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
        const user = await User.create({ email, password: hashedPassword });

        return res.status(201).json({ userId: user._id });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Email is already registered' });
        }
        return res.status(500).json({ error: error.message });
    }
};
