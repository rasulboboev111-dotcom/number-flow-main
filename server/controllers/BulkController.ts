import { Request, Response } from 'express';
import PhoneNumber from '../models/PhoneNumber.js';

export const bulkCreateNumbers = async (req: Request, res: Response) => {
    try {
        const { numbers, operatorId, categoryId } = req.body;

        if (!Array.isArray(numbers)) {
            return res.status(400).json({ message: 'Numbers must be an array' });
        }

        const data = numbers.map(num => ({
            number: num,
            operatorId,
            categoryId,
            status: 'free'
        }));

        await PhoneNumber.bulkCreate(data, { ignoreDuplicates: true });

        res.status(201).json({ message: `Successfully imported ${numbers.length} numbers` });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
