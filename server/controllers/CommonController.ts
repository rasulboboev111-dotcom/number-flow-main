import { Request, Response } from 'express';
import PhoneNumber from '../models/PhoneNumber.js';
import Operator from '../models/Operator.js';
import Subscriber from '../models/Subscriber.js';
import Category from '../models/Category.js';

export const getStats = async (req: Request, res: Response) => {
    try {
        const [
            totalNumbers,
            freeNumbers,
            activeNumbers,
            reservedNumbers,
            quarantineNumbers,
            totalSubscribers,
            operatorsCount
        ] = await Promise.all([
            PhoneNumber.count(),
            PhoneNumber.count({ where: { status: 'free' } }),
            PhoneNumber.count({ where: { status: 'active' } }),
            PhoneNumber.count({ where: { status: 'reserved' } }),
            PhoneNumber.count({ where: { status: 'quarantine' } }),
            Subscriber.count(),
            Operator.count()
        ]);

        res.json({
            totalNumbers,
            freeNumbers,
            activeNumbers,
            reservedNumbers,
            quarantineNumbers,
            totalSubscribers,
            operatorsCount
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
