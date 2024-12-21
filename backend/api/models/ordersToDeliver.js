const mongoose = require('mongoose');

const OrdersToDeliverSchema = new mongoose.Schema({
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
    deliveryStatus: { type: String, enum: ['Pending', 'Confirmed', 'Rejected', 'Delivered'], default: 'Pending' },
    deliveryDate: { type: Date },
    cart: [
        {
            itemName: { type: String, required: true },
            category: { type: String, required: true },
            quantity: { type: Number, required: true },
            condition: { type: String, enum: ['New', 'Used'], required: true },
            description: { type: String, required: true },
            images: [{ type: String }], // Store image file paths
        },
    ],
    pickupDate: { type: String },
    address: { type: String, required: true },
});

module.exports = mongoose.model('OrdersToDeliver', OrdersToDeliverSchema);
