const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const OrdersToReceiveSchema = new mongoose.Schema({
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipient', required: true },
    items: [{
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
    quantity: { type: Number, required: true }
}],
    deliveryStatus: { type: String, enum: ['Pending','Confirmed','Rejected', 'Received'], default: 'Pending' },
    deliveryDate: { type: Date },
  });
  
  module.exports = mongoose.model('OrdersToReceive', OrdersToReceiveSchema);
  