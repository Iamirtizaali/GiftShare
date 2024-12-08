const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const PaymentsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['Credit Card', 'PayPal'], required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  });
  
  module.exports = mongoose.model('Payments', PaymentsSchema);
  