const express = require('express');
const router = express.Router();
const donorController = require('./controller');
const isAdmin = require('../../middlewares/isAdmin');
const authorizUser= require('../../middlewares/middleware');
const authenticateToken = require('../../middlewares/authToken');

const {upload, uploadDocuments} = require('../../middlewares/multer');


// // app.js
// const multer = require('multer');
// const app = express();
// // Create a storage strategy for multer
// const storage = multer.diskStorage({
//  destination: function (req, file, cb) {
//  // Specify the upload directory
//  cb(null, 'uploads/');
//  },
//  filename: function (req, file, cb) {
//  // Define the file name format
//  cb(null, file.originalname);
//  }
// });
// // Create a multer instance with the storage strategy
// const upload = multer({ storage: storage });
// // Route to handle single file upload
// app.post('/uploadSingle', upload.single('singleFile'), (req, res) => {
//  // The uploaded file is available in req.file
//  res.json({ message: 'Single file uploaded successfully!' });
// });
// // Route to handle multiple file uploads from a single field
// app.post('/uploadMultipleSingleField', upload.array('multipleFiles', 5), (req, res) => {
//  // The uploaded files are available in req.files
//  res.json({ message: 'Multiple files from a single field uploaded successfully!' });
// });
// // Route to handle multiple file uploads from multiple fields
// app.post('/uploadMultipleFields', upload.fields([
//  { name: 'field1Files', maxCount: 5 },
//  { name: 'field2Files', maxCount: 5 }
// ]), (req, res) => {
//  // The uploaded files are available in req.files
//  // Use req.files['field1Files'] for files from the first field
//  // Use req.files['field2Files'] for files from the second field
//  res.json({ message: 'Multiple files from multiple fields uploaded successfully!' });
// });





router.post('/create-order', authenticateToken,upload.any(), donorController.createDonationOrder);


// Donor creates a donation order
//router.post('/create-order',authenticateToken, donorController.createDonationOrder);

// Admin approves/rejects an order
router.put('/order-status/:orderId',isAdmin, donorController.updateOrderStatus);

// Update delivery status of an order
router.put('/delivery-status/:orderId',isAdmin, donorController.updateDeliveryStatus);

router.get('/dashboard', authenticateToken, donorController.getDonorDashboardData);

router.get("/donor-history", authenticateToken, donorController.getDonorHistory);


//settings apis
router.get("/settings", authenticateToken, donorController.getSettings);


// Update donor details
router.put('/update-details', authenticateToken, donorController.updateDonorDetails);

// Update password
router.put('/update-password', authenticateToken, donorController.updatePassword);

// Delete account
router.delete('/delete-account', authenticateToken, donorController.deleteAccount);


router.get('/get-user-data', authenticateToken, donorController.getUserData);


module.exports = router;