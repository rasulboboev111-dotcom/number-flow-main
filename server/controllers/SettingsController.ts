import { Request, Response } from 'express';
import Setting from '../models/Setting.js';

export const getSettings = async (req: Request, res: Response) => {
    try {
        const settings = await Setting.findAll();
        // Convert array to object { key: value }
        const settingsMap = settings.reduce((acc: any, setting: any) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {});
        res.json(settingsMap);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSettings = async (req: Request, res: Response) => {
    try {
        const updates = req.body; // Expect { key: value, key2: value2 }

        const promises = Object.keys(updates).map(async (key) => {
            const value = String(updates[key]);
            const [setting, created] = await Setting.findOrCreate({
                where: { key },
                defaults: { value }
            });

            if (!created && setting.value !== value) {
                setting.value = value;
                await setting.save();
            }
        });

        await Promise.all(promises);

        // Return updated settings
        const settings = await Setting.findAll();
        const settingsMap = settings.reduce((acc: any, setting: any) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {});

        res.json(settingsMap);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
