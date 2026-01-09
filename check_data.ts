import PhoneNumber from './server/models/PhoneNumber.js';
import './server/database.js';

async function checkNumbers() {
    try {
        const numbers = await PhoneNumber.findAll({
            attributes: ['number', 'status'],
            limit: 20
        });
        console.log('--- CURRENT NUMBERS IN DB ---');
        numbers.forEach(n => console.log(`${n.get('number')} - ${n.get('status')}`));
        console.log('----------------------------');

        const freeCount = await PhoneNumber.count({ where: { status: 'free' } });
        console.log(`Total FREE numbers: ${freeCount}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkNumbers();
