const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const DonorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  });
  
  module.exports = mongoose.model('Donor', DonorSchema);
  