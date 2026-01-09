import { DataTypes, Model } from 'sequelize';
import sequelize from '../database.js';
import PhoneNumber from './PhoneNumber.js';
import Subscriber from './Subscriber.js';

class Contract extends Model {
    declare id: string;
    declare phoneNumberId: string;
    declare subscriberId: string;
    declare startDate: Date;
    declare endDate: Date | null;
    declare documentUrl: string | null;
    declare status: 'active' | 'terminated';
}

Contract.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        phoneNumberId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        subscriberId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        documentUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('active', 'terminated'),
            defaultValue: 'active',
        },
    },
    {
        sequelize,
        modelName: 'Contract',
        indexes: [
            { fields: ['phoneNumberId'] },
            { fields: ['subscriberId'] },
            { fields: ['status'] },
            { fields: ['startDate'] },
        ]
    }
);

Contract.belongsTo(PhoneNumber, { foreignKey: 'phoneNumberId', as: 'phoneNumber', onDelete: 'CASCADE' });
Contract.belongsTo(Subscriber, { foreignKey: 'subscriberId', as: 'subscriber', onDelete: 'CASCADE' });

export default Contract;
