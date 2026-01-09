import { Request, Response } from 'express';
import PhoneNumber from '../models/PhoneNumber.js';
import Operator from '../models/Operator.js';
import Category from '../models/Category.js';
import Subscriber from '../models/Subscriber.js';
import { Op } from 'sequelize';

export const getNumbers = async (req: Request, res: Response) => {
    try {
        const { search, operatorId, categoryId, status, page = 1, limit = 20 } = req.query;
        const where: any = {};
        const offset = (Number(page) - 1) * Number(limit);

        if (search) {
            const searchStr = (search as string).trim();
            const digitsOnly = searchStr.replace(/\D/g, '');

            const searchConditions: any[] = [
                { number: { [Op.like]: `%${searchStr}%` } },
            ];

            if (digitsOnly && digitsOnly.length > 2) {
                // Fuzzy digit search only if enough digits provided
                const fuzzyDigits = digitsOnly.split('').join('%');
                searchConditions.push({ number: { [Op.like]: `%${fuzzyDigits}%` } });
            }

            // JOIN searches
            searchConditions.push({ '$operator.name$': { [Op.like]: `%${searchStr}%` } });
            searchConditions.push({ '$subscriber.name$': { [Op.like]: `%${searchStr}%` } });

            where[Op.or] = searchConditions;
        }

        if (operatorId) where.operatorId = operatorId;
        if (categoryId) where.categoryId = categoryId;
        if (status) where.status = status;

        const { count, rows: numbers } = await PhoneNumber.findAndCountAll({
            where,
            include: [
                { model: Operator, as: 'operator', attributes: ['id', 'name'] },
                { model: Category, as: 'category', attributes: ['id', 'name', 'code'] },
                { model: Subscriber, as: 'subscriber', required: false, attributes: ['id', 'name'] },
            ],
            order: [['createdAt', 'DESC']],
            limit: Number(limit),
            offset: offset,
            distinct: true,
            // Optimization: skip unnecessary attributes if needed
        });

        res.json({
            numbers,
            total: count,
            page: Number(page),
            totalPages: Math.ceil(count / Number(limit))
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createNumber = async (req: Request, res: Response) => {
    try {
        const number = await PhoneNumber.create(req.body);
        const createdNumber = await PhoneNumber.findByPk(number.id, {
            include: [
                { model: Operator, as: 'operator' },
                { model: Category, as: 'category' },
            ],
        });
        res.status(201).json(createdNumber);
    } catch (error: any) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Такой номер уже существует' });
        }
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: 'Ошибка валидации данных. Проверьте правильность заполнения полей.' });
        }
        res.status(400).json({ message: error.message });
    }
};

export const updateNumber = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await PhoneNumber.update(req.body, { where: { id } });
        const updatedNumber = await PhoneNumber.findByPk(id, {
            include: [
                { model: Operator, as: 'operator' },
                { model: Category, as: 'category' },
                { model: Subscriber, as: 'subscriber' },
            ],
        });
        res.json(updatedNumber);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteNumber = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await PhoneNumber.destroy({ where: { id }, individualHooks: true });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getNumberHistory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const StatusHistory = (PhoneNumber.sequelize?.models as any).StatusHistory;
        if (!StatusHistory) {
            return res.status(500).json({ message: 'StatusHistory model not found' });
        }
        const history = await StatusHistory.findAll({
            where: { phoneNumberId: id },
            order: [['createdAt', 'DESC']]
        });
        res.json(history);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
