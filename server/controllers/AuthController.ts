import { Request, Response } from 'express';
import Manager from '../models/Manager.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_here';

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const manager = await Manager.findOne({ where: { username } });

        if (!manager) {
            console.log(`Login failed: user ${username} not found`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await manager.comparePassword(password);
        if (!isMatch) {
            console.log(`Login failed: password mismatch for user ${username}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: manager.id, username: manager.username }, JWT_SECRET, {
            expiresIn: '24h',
        });

        // Set token in HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.json({
            token, // Keep for client compatibility during transition
            user: {
                id: manager.id,
                username: manager.username,
                name: manager.name,
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
