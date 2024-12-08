const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const OrdersToDeliverSchema = new mongoose.Schema({
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
    deliveryStatus: { type: String, enum: ['Pending','Confirmed','Rejected', 'Delivered'], default: 'Pending' },
    deliveryDate: { type: Date },
    cart: [
        {
          itemName: { type: String, required: true },
          categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
          quantity: { type: Number, required: true },
          condition: { type: String, enum: ['New', 'Used'], required: true },
          description: { type: String, required: true},
        },
      ],
      pickupDate: { type: String },
      address: { type: String, required: true },
  });
  
  module.exports = mongoose.model('OrdersToDeliver', OrdersToDeliverSchema);
  