const express = require('express');
const router = express.Router();
const { addToCart, placeOrder, confirmOrder, getCartItems, removeFromCart, updateCartItemQuantity,getRecipientDashboardData } = require('./controller');
const isAdmin = require('../../middlewares/isAdmin');
const authorizUser = require('../../middlewares/middleware');

// Add item to cart
router.post('/cart/add', authorizUser, addToCart);

// Place an order
router.post('/order/place', authorizUser, placeOrder);

// Confirm an order (Admin role)
router.put('/order/confirm', isAdmin, confirmOrder);

// Get cart items for a recipient
router.get('/cart', authorizUser, getCartItems);

// Remove an item from the cart
router.delete('/cart/remove', authorizUser, removeFromCart);

router.get('/recipient-dashboard', authorizUser, getRecipientDashboardData);



module.exports = router;