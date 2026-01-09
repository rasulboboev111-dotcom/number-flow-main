import PhoneNumber from './server/models/PhoneNumber.js';
import Operator from './server/models/Operator.js';
import Category from './server/models/Category.js';
import Subscriber from './server/models/Subscriber.js';
import './server/database.js'; // Ensure DB is connected

async function diagnose() {
    try {
        const totalNumbers = await PhoneNumber.count();
        const totalOperators = await Operator.count();
        const totalCategories = await Category.count();
        const totalSubscribers = await Subscriber.count();

        console.log('--- DB DIAGNOSIS ---');
        console.log(`Total Numbers: ${totalNumbers}`);
        console.log(`Total Operators: ${totalOperators}`);
        console.log(`Total Categories: ${totalCategories}`);
        console.log(`Total Subscribers: ${totalSubscribers}`);
        console.log('--------------------');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

diagnose();
