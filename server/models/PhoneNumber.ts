import { DataTypes, Model } from 'sequelize';
import sequelize from '../database.js';
import Operator from './Operator.js';
import Category from './Category.js';
import Subscriber from './Subscriber.js';

class PhoneNumber extends Model {
    declare id: string;
    declare number: string;
    declare operatorId: string;
    declare categoryId: string;
    declare status: 'free' | 'active' | 'reserved' | 'blocked' | 'quarantine';
    declare subscriberId: string | null;
}

PhoneNumber.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        operatorId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        categoryId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('free', 'active', 'reserved', 'blocked', 'quarantine'),
            defaultValue: 'free',
        },
        subscriberId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'PhoneNumber',
        indexes: [
            { fields: ['number'], unique: true },
            { fields: ['operatorId'] },
            { fields: ['categoryId'] },
            { fields: ['subscriberId'] },
            { fields: ['status'] },
        ]
    }
);

PhoneNumber.belongsTo(Operator, { foreignKey: 'operatorId', as: 'operator', onDelete: 'CASCADE' });
PhoneNumber.belongsTo(Category, { foreignKey: 'categoryId', as: 'category', onDelete: 'CASCADE' });
PhoneNumber.belongsTo(Subscriber, { foreignKey: 'subscriberId', as: 'subscriber', onDelete: 'SET NULL' });

PhoneNumber.addHook('afterUpdate', async (phoneNumber: any, options: any) => {
    if (phoneNumber.changed('status')) {
        const StatusHistory = sequelize.models.StatusHistory;
        if (StatusHistory) {
            await StatusHistory.create({
                phoneNumberId: phoneNumber.id,
                oldStatus: phoneNumber.previous('status'),
                newStatus: phoneNumber.status,
                notes: options.notes || 'Автоматическая смена статуса'
            }, { transaction: options.transaction });
        }
    }
});

PhoneNumber.addHook('afterCreate', async (phoneNumber: any, options: any) => {
    const StatusHistory = sequelize.models.StatusHistory;
    if (StatusHistory) {
        await StatusHistory.create({
            phoneNumberId: phoneNumber.id,
            oldStatus: null,
            newStatus: phoneNumber.status,
            notes: options.notes || 'Создание номера'
        }, { transaction: options.transaction });
    }
});

export default PhoneNumber;
