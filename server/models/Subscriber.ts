import { DataTypes, Model } from 'sequelize';
import sequelize from '../database.js';

class Subscriber extends Model {
    declare id: string;
    declare type: 'individual' | 'legal_entity';
    declare name: string;
    declare passportSeries: string | null;
    declare passportNumber: string | null;
    declare passportIssuedBy: string | null;
    declare inn: string | null;
    declare contactPhone: string;
    declare address: string;
}

Subscriber.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        type: {
            type: DataTypes.ENUM('individual', 'legal_entity'),
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        passportSeries: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        passportNumber: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        passportIssuedBy: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        inn: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        contactPhone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'Subscriber',
        indexes: [
            { fields: ['name'] },
            { fields: ['contactPhone'] },
            { fields: ['inn'] },
            { fields: ['type'] }
        ]
    }
);

export default Subscriber;
