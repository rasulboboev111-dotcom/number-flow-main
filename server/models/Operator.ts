import { DataTypes, Model } from 'sequelize';
import sequelize from '../database.js';

class Operator extends Model {
    declare id: string;
    declare name: string;
    declare mnc: string;
    declare logo: string | null;
    declare contactPhone: string | null;
    declare contactEmail: string | null;
}

Operator.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        mnc: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        logo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        contactPhone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        contactEmail: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'Operator',
        indexes: [
            { fields: ['mnc'], unique: true },
            { fields: ['name'] }
        ]
    }
);

Operator.addHook('beforeDestroy', async (operator: any, options: any) => {
    const PhoneNumber = sequelize.models.PhoneNumber;
    if (PhoneNumber) {
        await PhoneNumber.destroy({
            where: { operatorId: operator.id },
            transaction: options.transaction,
            individualHooks: true // Trigger PhoneNumber's own hooks
        });
    }
});

export default Operator;
