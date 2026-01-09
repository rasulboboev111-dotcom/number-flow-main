import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(process.cwd(), 'database.sqlite'),
  logging: false,
});

// For SQLite, we must enable foreign keys explicitly
sequelize.query('PRAGMA foreign_keys = ON;');

export default sequelize;
