const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const {
    getAllDonors,
    getAllRecipients,
    getAllUsers,
    getAllPendingDonationRequests,
    getAllPendingRecipientRequests,
    getAllInventoryItems,
    signup,
    getAdminDashboardData,
    updateUser,
    updateInventoryItem,
    getAllOrdersToReceive,
    getAllOrdersToDeliver,
    approveRejectOrder,
    approveRejectDeliveryOrder,
    settings,
    logout,
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
router.put('/inventory/:itemId', authenticateToken, updateInventoryItem);

// API routes
router.get('/orders/receive', authenticateToken, getAllOrdersToReceive);
router.get('/orders/deliver', authenticateToken, getAllOrdersToDeliver);
  // API routes
  router.put('/orders/receive/approve-reject', authenticateToken, approveRejectOrder);
  router.put('/orders/deliver/approve-reject', authenticateToken, approveRejectDeliveryOrder);

router.put('/settings', authenticateToken, settings);
router.post('/logout', authenticateToken, logout);
router.post('/contact-us', async (req, res) => {
  try {
      const { name, email, message } = req.body;

      // Validate input
      if (!name || !email || !message) {
          return res.status(400).json({ message: 'All fields are required.' });
      }

      
      // Optional: Send an email notification to the admin
      const transporter = nodemailer.createTransport({
          service: 'gmail', // Replace with your email provider
          auth: {
              user: "aliirtiza859@gmail.com", // Admin email
              pass: "pbqj xrqo lyyd dshc", // Admin email password
          },
      });

      const mailOptions = {
          from: email,
          to: "aliirtiza859@gmail.com",
          subject: `New Contact Us Message from ${name}`,
          text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.error('Error sending email:', error);
          } else {
              console.log('Email sent:', info.response);
          }
      });

      res.status(200).json({ message: 'Your message has been received. Thank you!' });
  } catch (error) {
      console.error('Error submitting contact form:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;