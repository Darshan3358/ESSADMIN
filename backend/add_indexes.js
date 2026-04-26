const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'backend/.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const addIndexes = async () => {
    await connectDB();

    try {
        const Product = require('./backend/models/Product');
        const SellerProduct = require('./backend/models/SellerProduct');
        const Order = require('./backend/models/Order');

        console.log('Adding indexes to Product collection...');
        await Product.collection.createIndex({ name: 'text', category: 'text', description: 'text' });
        await Product.collection.createIndex({ isDeleted: 1 });
        await Product.collection.createIndex({ isFeatured: 1 });
        await Product.collection.createIndex({ category: 1 });
        await Product.collection.createIndex({ createdAt: -1 });

        console.log('Adding indexes to SellerProduct collection...');
        await SellerProduct.collection.createIndex({ seller_id: 1 });
        await SellerProduct.collection.createIndex({ product_id: 1 });

        console.log('Adding indexes to Order collection...');
        await Order.collection.createIndex({ seller_id: 1 });
        await Order.collection.createIndex({ status: 1 });
        await Order.collection.createIndex({ createdAt: -1 });

        console.log('✅ All indexes added successfully');
        process.exit(0);
    } catch (error) {
        console.error(`❌ Error adding indexes: ${error.message}`);
        process.exit(1);
    }
};

addIndexes();
