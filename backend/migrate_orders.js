const mongoose = require('mongoose');
const Order = require('./models/Order');
require('dotenv').config({ path: './.env' });

async function migrate() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        console.log('Running bulk migration for Orders...');
        await Order.collection.updateMany(
            { order_total: { $type: 'string' } },
            [{ $set: { order_total: { $convert: { input: "$order_total", to: "double", onError: 0, onNull: 0 } } } }]
        );

        console.log('Running bulk migration for Recharges...');
        const Recharge = require('./models/Recharge');
        const rResult = await Recharge.collection.updateMany(
            { amount: { $type: 'string' } },
            [{ $set: { amount: { $convert: { input: "$amount", to: "double", onError: 0, onNull: 0 } } } }]
        );
        console.log(`Migration complete. Recharges modified: ${rResult.modifiedCount}`);
    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        process.exit(0);
    }
}

migrate();
