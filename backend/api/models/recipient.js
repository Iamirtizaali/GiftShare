const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const RecipientSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cart: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
        quantity: { type: Number, required: true },
      },
    ],
  });
  
  module.exports = mongoose.model('Recipient', RecipientSchema);
  