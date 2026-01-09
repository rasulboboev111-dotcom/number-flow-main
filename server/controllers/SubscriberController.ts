import { Request, Response } from 'express';
import Subscriber from '../models/Subscriber.js';

export const createSubscriber = async (req: Request, res: Response) => {
    try {
        const subscriber = await Subscriber.create(req.body);
        res.status(201).json(subscriber);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getSubscribers = async (req: Request, res: Response) => {
    try {
        const subscribers = await Subscriber.findAll({ order: [['name', 'ASC']] });
        res.json(subscribers);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSubscriber = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await Subscriber.update(req.body, { where: { id } });
        const updated = await Subscriber.findByPk(id);
        res.json(updated);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteSubscriber = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await Subscriber.destroy({ where: { id } });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
