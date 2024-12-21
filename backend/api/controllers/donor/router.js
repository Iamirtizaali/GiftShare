const express = require('express');
const router = express.Router();
const donorController = require('./controller');
const isAdmin = require('../../middlewares/isAdmin');
const authorizUser= require('../../middlewares/middleware');
const authenticateToken = require('../../middlewares/authToken');

const upload=require('../../middlewares/multer');
router.post('/create-order', authenticateToken, upload.array(), donorController.createDonationOrder);


// Donor creates a donation order
//router.post('/create-order',authenticateToken, donorController.createDonationOrder);

// Admin approves/rejects an order
router.put('/order-status/:orderId',isAdmin, donorController.updateOrderStatus);

// Update delivery status of an order
router.put('/delivery-status/:orderId',isAdmin, donorController.updateDeliveryStatus);

router.get('/dashboard', authenticateToken, donorController.getDonorDashboardData);

router.get("/donor-history", authenticateToken, donorController.getDonorHistory);


module.exports = router;
