import sequelize from '../database.js';
import Operator from '../models/Operator.js';
import { Op } from 'sequelize';

const addTajikOperators = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Comprehensive list of Tajik operators based on common test prefixes
        const operators = [
            { name: 'Мегафон Таджикистан (90, 88, 55)', mnc: '02', contactPhone: '+992 900 000 000', contactEmail: 'support@megafon.tj' },
            { name: 'Tcell (93, 92, 77, 50)', mnc: '03', contactPhone: '+992 930 000 000', contactEmail: 'support@tcell.tj' },
            { name: 'Babilon-M (918, 98)', mnc: '04', contactPhone: '+992 918 000 000', contactEmail: 'support@babilon.tj' },
            { name: 'Zet-Mobile (911, 915)', mnc: '01', contactPhone: '+992 911 000 000', contactEmail: 'support@zet.tj' },
            { name: 'O Moda (909)', mnc: '05', contactPhone: '+992 909 000 000', contactEmail: 'info@omoda.tj' },
            { name: 'TK Mobile (908)', mnc: '06', contactPhone: '+992 908 000 000', contactEmail: 'support@tkmobile.tj' },
            { name: 'Somoncom (92)', mnc: '07', contactPhone: '+992 920 000 000', contactEmail: 'info@somoncom.tj' },
        ];

        for (const op of operators) {
            try {
                // Find by MNC or Name to avoid duplicates
                const existing = await Operator.findOne({
                    where: {
                        [Op.or]: [
                            { mnc: op.mnc },
                            { name: op.name }
                        ]
                    }
                });

                if (existing) {
                    console.log(`Operator ${op.name} already exists. Updating...`);
                    await existing.update(op);
                } else {
                    await Operator.create(op);
                    console.log(`Operator ${op.name} added.`);
                }
            } catch (err: any) {
                console.error(`Error processing ${op.name}:`, err.message);
            }
        }

        console.log('Finished updating operators from test number data.');
        process.exit(0);
    } catch (error) {
        console.error('Failed to update operators:', error);
        process.exit(1);
    }
};

addTajikOperators();
