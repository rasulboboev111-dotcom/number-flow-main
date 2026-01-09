import { DataTypes, Model } from 'sequelize';
import sequelize from '../database.js';
import PhoneNumber from './PhoneNumber.js';

class StatusHistory extends Model {
    declare id: string;
    declare phoneNumberId: string;
    declare oldStatus: string | null;
    declare newStatus: string;
    declare notes: string | null;
    declare createdAt: Date;
}

StatusHistory.init(
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
        oldStatus: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        newStatus: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'StatusHistory',
        tableName: 'StatusHistories',
        timestamps: true,
        updatedAt: false,
        indexes: [
            { fields: ['phoneNumberId'] },
        ]
    }
);

StatusHistory.belongsTo(PhoneNumber, { foreignKey: 'phoneNumberId', as: 'phoneNumber', onDelete: 'CASCADE' });
PhoneNumber.hasMany(StatusHistory, { foreignKey: 'phoneNumberId', as: 'history' });

export default StatusHistory;
