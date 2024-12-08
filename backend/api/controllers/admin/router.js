const express = require('express');
const router = express.Router();
const {
    getAllDonors,
    getAllRecipients,
    getAllUsers,
    getAllPendingDonationRequests,
    getAllPendingRecipientRequests,
    getAllInventoryItems,
} = require('./controller');
const isAdmin = require('../../middlewares/isAdmin');

// Admin routes
router.get('/donors', isAdmin, getAllDonors);
router.get('/recipients', isAdmin, getAllRecipients);
router.get('/users', isAdmin, getAllUsers);
router.get('/pending-donations', isAdmin, getAllPendingDonationRequests);
router.get('/pending-recipients', isAdmin, getAllPendingRecipientRequests);
router.get('/inventory', isAdmin, getAllInventoryItems);

module.exports = router;