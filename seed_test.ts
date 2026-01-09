import PhoneNumber from './server/models/PhoneNumber.js';
import Operator from './server/models/Operator.js';
import Category from './server/models/Category.js';
import './server/database.js';

async function seedMissing() {
    try {
        const op = await Operator.findOne({ where: { name: 'Zet-Mobile' } }) || await Operator.findOne();
        const cat = await Category.findOne({ where: { code: 'platinum' } }) || await Category.findOne();

        if (!op || !cat) {
            console.error('No operator or category found to associate numbers with.');
            process.exit(1);
        }

        const numbersToAdd = [
            '+992 98 707 11 06',
            '+992 98 700 00 00',
            '+992 901 555 555'
        ];

        for (const num of numbersToAdd) {
            try {
                await PhoneNumber.create({
                    number: num,
                    operatorId: op.get('id'),
                    categoryId: cat.get('id'),
                    status: 'free'
                });
                console.log(`Added number: ${num}`);
            } catch (e) {
                console.log(`Number ${num} already exists or failed to add.`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedMissing();
