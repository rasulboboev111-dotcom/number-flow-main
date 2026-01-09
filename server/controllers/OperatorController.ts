import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Operator from '../models/Operator.js';
import PhoneNumber from '../models/PhoneNumber.js';
import sequelize from '../database.js';

export const getOperators = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        const whereClause: any = {};

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { mnc: { [Op.like]: `%${search}%` } }
            ];
        }

        const operators = await Operator.findAll({
            where: whereClause,
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM PhoneNumbers AS pn
                            WHERE pn.operatorId = Operator.id
                        )`),
                        'numbersCount'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM PhoneNumbers AS pn
                            WHERE pn.operatorId = Operator.id AND pn.status = 'free'
                        )`),
                        'freeNumbersCount'
                    ]
                ]
            },
            order: [['name', 'ASC']]
        });
        res.json(operators);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createOperator = async (req: Request, res: Response) => {
    try {
        const operator = await Operator.create(req.body);
        res.status(201).json(operator);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteOperator = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await Operator.destroy({ where: { id }, individualHooks: true });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateOperator = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const [updated] = await Operator.update(req.body, { where: { id } });
        if (updated) {
            const updatedOperator = await Operator.findByPk(id);
            res.status(200).json(updatedOperator);
        } else {
            res.status(404).json({ message: 'Оператор не найден' });
        }
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
