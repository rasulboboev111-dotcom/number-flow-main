import sequelize from '../database.js';
import Manager from '../models/Manager.js';
import Operator from '../models/Operator.js';
import Category from '../models/Category.js';
import Subscriber from '../models/Subscriber.js';
import PhoneNumber from '../models/PhoneNumber.js';
import Contract from '../models/Contract.js';

const seed = async () => {
    try {
        await sequelize.sync({ force: true });
        console.log('Database synced for seeding.');

        // Seed Manager
        await Manager.create({
            username: 'admin',
            password: 'adminpassword',
            name: 'Администратор',
        });
        console.log('Manager seeded.');

        // Seed Operators
        const opsContent = [
            { name: 'Мегафон Таджикистан', mnc: '02', contactPhone: '+992 900 000 000', contactEmail: 'support@megafon.tj' },
            { name: 'Tcell', mnc: '03', contactPhone: '+992 930 000 000', contactEmail: 'support@tcell.tj' },
            { name: 'Babilon-M', mnc: '04', contactPhone: '+992 918 000 000', contactEmail: 'support@babilon.tj' },
            { name: 'Zet-Mobile', mnc: '01', contactPhone: '+992 911 000 000', contactEmail: 'support@zet.tj' },
            { name: 'O Moda', mnc: '05', contactPhone: '+992 909 000 000', contactEmail: 'info@omoda.tj' },
            { name: 'TK Mobile', mnc: '06', contactPhone: '+992 908 000 000', contactEmail: 'support@tkmobile.tj' },
            { name: 'Somoncom', mnc: '07', contactPhone: '+992 920 000 000', contactEmail: 'info@somoncom.tj' },
            { name: 'Indigo Tajikistan', mnc: '08', contactPhone: '+992 927 000 000', contactEmail: 'info@indigo.tj' },
        ];

        const ops = await Promise.all(opsContent.map(op => Operator.create(op)));
        console.log('Operators seeded.');

        // Seed Categories
        const cats = await Promise.all([
            Category.create({ name: 'Платиновый', code: 'platinum', surcharge: 5000, surchargeType: 'fixed' }),
            Category.create({ name: 'Золотой', code: 'gold', surcharge: 2000, surchargeType: 'fixed' }),
            Category.create({ name: 'Серебряный', code: 'silver', surcharge: 500, surchargeType: 'fixed' }),
            Category.create({ name: 'Обычный', code: 'regular', surcharge: 0, surchargeType: 'fixed' }),
            Category.create({ name: 'Эконом', code: 'economy', surcharge: 10, surchargeType: 'percent' }),
        ]);
        console.log('Categories seeded.');

        // Seed Subscribers
        const subs = await Promise.all([
            Subscriber.create({
                type: 'individual',
                name: 'Иванов Иван Иванович',
                passportSeries: 'А',
                passportNumber: '1234567',
                contactPhone: '+992 900 123 456',
                address: 'г. Душанбе, ул. Рудаки, д. 15',
            }),
            Subscriber.create({
                type: 'legal_entity',
                name: 'ООО "ТехноСервис"',
                inn: '1234567890',
                contactPhone: '+992 901 555 555',
                address: 'г. Душанбе, ул. Сомони, д. 50',
            }),
            Subscriber.create({
                type: 'individual',
                name: 'Рахимов Али Саидович',
                passportSeries: 'Б',
                passportNumber: '7654321',
                contactPhone: '+992 935 999 888',
                address: 'г. Худжанд, ул. Ленина, д. 5',
            }),
        ]);
        console.log('Subscribers seeded.');

        // Seed Phone Numbers
        const numbers = await PhoneNumber.bulkCreate([
            { number: '+992 900 777 777', operatorId: ops[0].get('id'), categoryId: cats[0].get('id'), status: 'free' },
            { number: '+992 900 123 456', operatorId: ops[0].get('id'), categoryId: cats[3].get('id'), status: 'active', subscriberId: subs[0].get('id') },
            { number: '+992 901 888 888', operatorId: ops[1].get('id'), categoryId: cats[0].get('id'), status: 'reserved' },
            { number: '+992 901 555 555', operatorId: ops[1].get('id'), categoryId: cats[1].get('id'), status: 'active', subscriberId: subs[1].get('id') },
            { number: '+992 918 111 222', operatorId: ops[2].get('id'), categoryId: cats[2].get('id'), status: 'free' },
            { number: '+992 911 000 111', operatorId: ops[3].get('id'), categoryId: cats[4].get('id'), status: 'blocked' },
        ]);
        console.log('Phone numbers seeded.');

        // Seed Contracts
        // Note: For 'active' numbers, we should have a contract
        await Contract.bulkCreate([
            {
                phoneNumberId: numbers[1].id,
                subscriberId: subs[0].get('id'),
                startDate: new Date('2023-01-01'),
                status: 'active'
            },
            {
                phoneNumberId: numbers[3].id,
                subscriberId: subs[1].get('id'),
                startDate: new Date('2023-05-15'),
                status: 'active'
            }
        ]);
        console.log('Contracts seeded.');

        // Create more subscribers
        const moreSubs = await Promise.all([
            Subscriber.create({
                type: 'individual',
                name: 'Ахмедов Саид Джамолович',
                passportSeries: 'C',
                passportNumber: '0011223',
                contactPhone: '+992 900 111 222',
                address: 'г. Куляб, ул. Борбад, д. 12',
            }),
            Subscriber.create({
                type: 'legal_entity',
                name: 'ЗАО "Тадж-Нет"',
                inn: '9876543210',
                contactPhone: '+992 901 333 444',
                address: 'г. Душанбе, пр-т А. Сино, 23',
            }),
        ]);

        // Seed more Phone Numbers
        await PhoneNumber.bulkCreate([
            { number: '+992 930 555 555', operatorId: ops[1].get('id'), categoryId: cats[1].get('id'), status: 'free' },
            { number: '+992 930 111 111', operatorId: ops[1].get('id'), categoryId: cats[0].get('id'), status: 'free' },
            { number: '+992 918 000 000', operatorId: ops[2].get('id'), categoryId: cats[0].get('id'), status: 'free' },
            { number: '+992 909 999 999', operatorId: ops[4].get('id'), categoryId: cats[0].get('id'), status: 'free' },
            { number: '+992 900 000 001', operatorId: ops[0].get('id'), categoryId: cats[3].get('id'), status: 'free' },
            { number: '+992 900 000 002', operatorId: ops[0].get('id'), categoryId: cats[3].get('id'), status: 'free' },
            { number: '+992 900 000 003', operatorId: ops[0].get('id'), categoryId: cats[3].get('id'), status: 'free' },
            { number: '+992 900 000 004', operatorId: ops[0].get('id'), categoryId: cats[3].get('id'), status: 'free' },
            { number: '+992 900 000 005', operatorId: ops[0].get('id'), categoryId: cats[3].get('id'), status: 'free' },
            { number: '+992 900 000 006', operatorId: ops[0].get('id'), categoryId: cats[3].get('id'), status: 'free' },
        ]);

        console.log('Additional test data seeded.');
        console.log('Seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seed();
