const express = require('express');
const router = express.Router();
const {
    getAllDonors,
    getAllRecipients,
    getAllUsers,
    getAllPendingDonationRequests,
    getAllPendingRecipientRequests,
    getAllInventoryItems,
    signup,
    getAdminDashboardData,
    updateUser
} = require('./controller');
const isAdmin = require('../../middlewares/isAdmin');
const authenticateToken = require('../../middlewares/authToken');
// Admin routes
router.get('/donors', authenticateToken, getAllDonors);
router.get('/recipients', authenticateToken,getAllRecipients);
router.get('/users', authenticateToken, getAllUsers);
router.get('/pending-donations', authenticateToken, getAllPendingDonationRequests);
router.get('/pending-recipients', authenticateToken, getAllPendingRecipientRequests);
router.get('/inventory', authenticateToken, getAllInventoryItems);
router.post('/signup', signup);
router.get('/admin-dashboard',authenticateToken, getAdminDashboardData);

router.put('/update-user/:userId',authenticateToken, updateUser);
module.exports = router;