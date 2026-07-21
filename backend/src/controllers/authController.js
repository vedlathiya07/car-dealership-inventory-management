import bcrypt from 'bcrypt';
import { User } from '../models/User.js';

export const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hashedPassword });

        return res.status(201).json({ userId: user._id });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
