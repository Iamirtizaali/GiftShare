const express = require('express');
const router = express.Router();
const { addToCart, placeOrder, confirmOrder, getCartItems, removeFromCart, updateCartItemQuantity,getRecipientDashboardData } = require('./controller');
const isAdmin = require('../../middlewares/isAdmin');
const authorizUser = require('../../middlewares/middleware');

const authenticateToken = require('../../middlewares/authToken');


// Add item to cart
router.post('/cart/add', authenticateToken, addToCart);

// Place an order
router.post('/order/place', authenticateToken, placeOrder);

// Confirm an order (Admin role)
router.put('/order/confirm', isAdmin, confirmOrder);

// Get cart items for a recipient
router.get('/cart', authenticateToken, getCartItems);

// Remove an item from the cart
router.delete('/cart/remove', authenticateToken, removeFromCart);

router.get('/recipient-dashboard', authenticateToken, getRecipientDashboardData);



module.exports = router;