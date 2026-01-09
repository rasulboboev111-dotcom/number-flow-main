import { DataTypes, Model } from 'sequelize';
import sequelize from '../database.js';
import bcrypt from 'bcryptjs';

class Manager extends Model {
    declare id: string;
    declare username: string;
    declare password: string;
    declare name: string;

    public async comparePassword(password: string): Promise<boolean> {
        const hashedPassword = this.getDataValue('password');
        if (!hashedPassword) return false;
        return bcrypt.compare(password, hashedPassword);
    }
}

Manager.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'Manager',
        hooks: {
            beforeCreate: async (manager: Manager) => {
                const password = manager.getDataValue('password');
                if (password) {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    manager.setDataValue('password', hashedPassword);
                }
            },
            beforeUpdate: async (manager: Manager) => {
                if (manager.changed('password')) {
                    const password = manager.getDataValue('password');
                    if (password) {
                        const hashedPassword = await bcrypt.hash(password, 10);
                        manager.setDataValue('password', hashedPassword);
                    }
                }
            },
        },
    }
);

export default Manager;
