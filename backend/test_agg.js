const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Order = require('./models/Order');
const Seller = require('./models/Seller');

const testAggregation = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Find a seller with some orders
        const sampleOrder = await Order.findOne({}).lean();
        if (!sampleOrder) {
            console.log('No orders found in database.');
            return;
        }

        const sellerId = sampleOrder.seller_id;
        console.log(`Testing with Seller ID from Order: ${sellerId}`);

        let sellerQuery = { id: sellerId };
        if (mongoose.isValidObjectId(sellerId)) {
            sellerQuery = { $or: [{ _id: sellerId }, { id: sellerId }] };
        }
        
        const seller = await Seller.findOne(sellerQuery).lean();
        if (!seller) {
            console.log('Seller not found for this order.');
            // Fallback: search by seller_id directly
             const orders = await Order.find({ seller_id: sellerId }).limit(5).lean();
             console.log(`Found ${orders.length} orders for raw seller_id ${sellerId}`);
             return;
        }

        const sellerIdFilter = [
            seller._id,
            seller.id,
            String(seller._id),
            String(seller.id)
        ].filter(v => v !== undefined && v !== null);

        console.log('Seller ID Filter:', sellerIdFilter);

        // Test the new aggregation logic
        const salesResult = await Order.aggregate([
            {
                $match: {
                    seller_id: { $in: sellerIdFilter },
                    status: { $regex: 'pending|processing|delivered|shipped|completed', $options: 'i' }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: { $toDouble: { $ifNull: ["$order_total", 0] } } },
                    orders: { $sum: 1 }
                }
            }
        ]);

        console.log('Aggregation Result:', JSON.stringify(salesResult, null, 2));

        // Test if $toDouble fails on empty string
        try {
            const emptyStringTest = await Order.aggregate([
                 { $limit: 1 },
                 { $project: { test: { $toDouble: "" } } }
            ]);
            console.log('Empty string $toDouble result:', emptyStringTest);
        } catch (err) {
            console.log('Expected failure on $toDouble(""):', err.message);
        }

    } catch (err) {
        console.error('Error during test:', err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

testAggregation();
