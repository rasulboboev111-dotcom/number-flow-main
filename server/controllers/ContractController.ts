import { Request, Response } from 'express';
import Contract from '../models/Contract.js';
import PhoneNumber from '../models/PhoneNumber.js';
import Subscriber from '../models/Subscriber.js';
import sequelize from '../database.js';

export const getContracts = async (req: Request, res: Response) => {
    try {
        const contracts = await Contract.findAll({
            include: [
                { model: PhoneNumber, as: 'phoneNumber' },
                { model: Subscriber, as: 'subscriber' },
            ],
            order: [['startDate', 'DESC']],
        });
        res.json(contracts);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createContract = async (req: Request, res: Response) => {
    const transaction = await sequelize.transaction();
    try {
        const { phoneNumberId, subscriberId, startDate } = req.body;

        // Create contract
        const contract = await Contract.create({
            phoneNumberId,
            subscriberId,
            startDate,
            status: 'active'
        }, { transaction });

        // Update phone number status
        await PhoneNumber.update({
            status: 'active',
            subscriberId: subscriberId
        }, {
            where: { id: phoneNumberId },
            transaction
        });

        await transaction.commit();

        const createdContract = await Contract.findByPk(contract.id, {
            include: [
                { model: PhoneNumber, as: 'phoneNumber' },
                { model: Subscriber, as: 'subscriber' },
            ],
        });

        res.status(201).json(createdContract);
    } catch (error: any) {
        await transaction.rollback();
        res.status(400).json({ message: error.message });
    }
};

export const terminateContract = async (req: Request, res: Response) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const contract = await Contract.findByPk(id);

        if (!contract) {
            return res.status(404).json({ message: 'Contract not found' });
        }

        // Update contract status
        await contract.update({ status: 'terminated' }, { transaction });

        // Update phone number status back to quarantine
        await PhoneNumber.update({
            status: 'quarantine',
            subscriberId: null
        }, {
            where: { id: contract.phoneNumberId },
            transaction
        });

        await transaction.commit();
        res.status(200).json({ message: 'Contract terminated successfully' });
    } catch (error: any) {
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};
export const deleteContract = async (req: Request, res: Response) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const contract = await Contract.findByPk(id);

        if (!contract) {
            return res.status(404).json({ message: 'Contract not found' });
        }

        const phoneNumberId = contract.phoneNumberId;

        // Delete contract
        await contract.destroy({ transaction });

        // Update phone number status back to free
        await PhoneNumber.update({
            status: 'free',
            subscriberId: null
        }, {
            where: { id: phoneNumberId },
            transaction
        });

        await transaction.commit();
        res.status(204).send();
    } catch (error: any) {
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};
