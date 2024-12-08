const express = require('express');
const router = express.Router();
const donorController = require('./controller');
const isAdmin = require('../../middlewares/isAdmin');
const authorizUser= require('../../middlewares/middleware');

// Donor creates a donation order
router.post('/create-order',authorizUser, donorController.createDonationOrder);

// Admin approves/rejects an order
router.put('/order-status/:orderId',isAdmin, donorController.updateOrderStatus);

// Update delivery status of an order
router.put('/delivery-status/:orderId',isAdmin, donorController.updateDeliveryStatus);

module.exports = router;
