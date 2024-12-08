const express = require('express');
const router = express.Router();
const authController = require('./controller');

// User Signup
router.post('/signup', authController.userSignup);
// User Login
router.post('/login', authController.userLogin);


module.exports = router;
