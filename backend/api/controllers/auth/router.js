const express = require('express');
const router = express.Router();
const authController = require('./controller');

// User Signup
router.post('/signup', authController.userSignup);
// User Login
router.post('/login', authController.userLogin);

// User Logout
router.post('/logout', authController.logoutUser);


router.post('/forgot-password', authController.forgotPassword);

// Reset password route
router.post('/reset-password/:token', authController.resetPassword);
router.get('/reset-password/:token', authController.resetPage);
module.exports = router;
