import { DataTypes, Model } from 'sequelize';
import sequelize from '../database.js';

class Setting extends Model {
    declare key: string;
    declare value: string;
    declare description: string | null;
}

Setting.init(
    {
        key: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'Setting',
        timestamps: true,
    }
);

export default Setting;
