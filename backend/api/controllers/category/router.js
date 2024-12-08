const express = require('express');
const router = express.Router();
const categoryController = require('./controller');

// Add a new category
router.post('/add', categoryController.addCategory);

// Get all categories
router.get('/all', categoryController.getAllCategories);

module.exports = router;
