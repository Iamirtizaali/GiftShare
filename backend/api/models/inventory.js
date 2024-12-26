const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const InventorySchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
    condition: { type: String, enum: ['New', 'Used'], required: true },
    description: { type: String, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
    availability: { type: Boolean, default: true }, // Indicates if the item is available for request.
    images: [{ type: String }], // Store image file paths
  });
  
  module.exports = mongoose.model('Inventory', InventorySchema);
  