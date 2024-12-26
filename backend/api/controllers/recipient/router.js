const express = require('express');
const router = express.Router();
const { addToCart, placeOrder, confirmOrder, getCartItems, removeFromCart, updateCartItemQuantity,getRecipientDashboardData ,displayItems,
    createOrder,
    cart,
    getRecipientAccount,
    updateRecipientAccount,
    updateRecipientPassword,
    deleteRecipientAccount,
    recipientHistory
} = require('./controller');
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

router.get('/items/:category', authenticateToken, displayItems);

router.post('/order', authenticateToken, createOrder);

router.put('/cart', authenticateToken, cart);


router.get('/account', authenticateToken, getRecipientAccount);
router.put('/account', authenticateToken, updateRecipientAccount);
router.put('/account/password', authenticateToken, updateRecipientPassword);
router.delete('/account', authenticateToken, deleteRecipientAccount);

router.get('/history', authenticateToken, recipientHistory);

//logout the user
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({
        message: 'Logged out successfully'
    });
});
module.exports = router;