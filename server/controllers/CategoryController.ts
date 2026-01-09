import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Category from '../models/Category.js';
import PhoneNumber from '../models/PhoneNumber.js';
import sequelize from '../database.js';

export const getCategories = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        const whereClause: any = {};

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { code: { [Op.like]: `%${search}%` } }
            ];
        }

        const categories = await Category.findAll({
            where: whereClause,
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM PhoneNumbers AS pn
                            WHERE pn.categoryId = Category.id
                        )`),
                        'numbersCount'
                    ]
                ]
            },
            order: [['name', 'ASC']]
        });
        res.json(categories);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json(category);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await Category.destroy({ where: { id }, individualHooks: true });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const [updated] = await Category.update(req.body, { where: { id } });
        if (updated) {
            const updatedCategory = await Category.findByPk(id);
            res.status(200).json(updatedCategory);
        } else {
            res.status(404).json({ message: 'Категория не найдена' });
        }
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
