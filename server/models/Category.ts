import { DataTypes, Model } from 'sequelize';
import sequelize from '../database.js';

class Category extends Model {
    declare id: string;
    declare name: string;
    declare code: string;
    declare surcharge: number;
    declare surchargeType: 'fixed' | 'percent';
}

Category.init(
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
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        surcharge: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
        },
        surchargeType: {
            type: DataTypes.ENUM('fixed', 'percent'),
            defaultValue: 'fixed',
        },
    },
    {
        sequelize,
        modelName: 'Category',
        indexes: [
            { fields: ['code'], unique: true },
            { fields: ['name'] }
        ]
    }
);

Category.addHook('beforeDestroy', async (category: any, options: any) => {
    const PhoneNumber = sequelize.models.PhoneNumber;
    if (PhoneNumber) {
        await PhoneNumber.destroy({
            where: { categoryId: category.id },
            transaction: options.transaction,
            individualHooks: true
        });
    }
});

export default Category;
