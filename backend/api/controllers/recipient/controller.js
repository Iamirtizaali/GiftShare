const User = require('../../models/user');
const Admin = require('../../models/admin');
const Donor = require('../../models/donor');
const Recipient = require('../../models/recipient');
const Inventory = require('../../models/inventory');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const OrdersToReceive = require('../../models/ordersToReceive');

// API to add items to cart
const addToCart = async (req, res) => {
    try {
        const {  itemId } = req.body;
        const userId=req.user.id;
        // Check if the recipient exists
        const recipient = await Recipient.findOne({userId:userId});
        if (!recipient) {
            return res.status(404).json({ message: 'Recipient not found' });
        }

        // Check if the item exists and is available
        const item = await Inventory.findOne({_id:itemId});
        console.log('item is ',item);
        if (!item || item.availability === false || item.quantity === 0) {
            return res.status(400).json({ message: 'Item is unavailable or insufficient stock' });
        }

        // Check if the recipient already has this item in their cart
        const itemIndex = recipient.cart.findIndex(cartItem => cartItem.itemId.toString() === itemId.toString());

        if (itemIndex === -1) {
            // If the item is not in the cart, add it
            recipient.cart.push({ itemId, quantity:1 });
        } else {
            // If the item is already in the cart, update the quantity
            recipient.cart[itemIndex].quantity += 1;
        }
        item.quantity -= 1;
        await item.save();
        // Save the recipient's cart
        await recipient.save();
        res.status(200).json({ message: 'Item added to cart successfully', cart: recipient.cart });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// API to place an order (Recipient places an order)
const placeOrder = async (req, res) => {
    try {
        const userId=req.user.id;

        // Get the recipient and check their cart
        const recipient = await Recipient.findOne({userId}).populate('cart.itemId');
        if (!recipient || recipient.cart.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty' });
        }

        // Create the order
        const orderItems = recipient.cart.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity
        }));
        const newOrder = new OrdersToReceive({
            recipientId: recipient._id,
            items: orderItems,
        });

        await newOrder.save();

        // Empty the recipient's cart
        recipient.cart = [];

        await recipient.save();

        res.status(200).json({ message: 'Order placed successfully', order: newOrder });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// API to confirm order (Admin role)
const confirmOrder = async (req, res) => {
    try {
        const { orderId } = req.body;

        // Find the order and check its status
        const order = await OrdersToReceive.findById(orderId).populate('items');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Mark inventory items as unavailable and assign them to the recipient
        for (let item of order.items) {
            item.availability = false;
            await item.save();
        }

        // Update the order status to "Confirmed"
        order.deliveryStatus = 'Confirmed';
        order.deliveryDate = new Date();
        await order.save();

        res.status(200).json({ message: 'Order confirmed and items marked as unavailable' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// API to get cart items for a recipient
const getCartItems = async (req, res) => {
    try {
        const userId=req.user.id;

        // Get the recipient and their cart
        const recipient = await Recipient.findOne({userId}).populate('cart.itemId');
        if (!recipient) {
            return res.status(404).json({ message: 'Recipient not found' });
        }

        res.status(200).json({ cart: recipient.cart });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.body;
        const userId = req.user.id;

        // Get the recipient and their cart
        const recipient = await Recipient.findOne({ userId: userId });
        if (!recipient) {
            return res.status(404).json({ message: 'Recipient not found' });
        }

        // Find the item in the cart
        const itemIndex = recipient.cart.findIndex(cartItem => cartItem.itemId.toString() === itemId.toString());
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        // Decrease the quantity by 1
        recipient.cart[itemIndex].quantity -= 1;

        // If the quantity becomes 0, remove the item from the cart
        if (recipient.cart[itemIndex].quantity === 0) {
            recipient.cart.splice(itemIndex, 1);
        }

        await recipient.save();
        const item= await Inventory.findOne({_id:itemId});
        item.quantity += 1;
        await item.save();
        res.status(200).json({ message: 'Item quantity updated successfully', cart: recipient.cart });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getRecipientDashboardData = async (req, res) => {
    try {
        console.log(('recipeint dashboard page'));
      const recipientId = req.user._id; // `req.user` is populated by the middleware
  
      // Fetch recipient data
      const recipient = await Recipient.findOne({ userId: recipientId }).populate('userId', 'name');
  
      if (!recipient) {
        return res.status(404).json({ message: 'Recipient not found.' });
      }
  
      // Fetch total active requests
      const activeRequests = await OrdersToReceive.find({ recipientId, deliveryStatus: 'Pending' }).countDocuments();
  
      // Fetch completed requests
      const completedRequests = await OrdersToReceive.find({ recipientId, deliveryStatus: 'Received' }).countDocuments();
  
      // Fetch pending approval requests
      const pendingApproval = await OrdersToReceive.find({ recipientId, deliveryStatus: 'Confirmed' }).countDocuments();
  
      // Fetch recent activities (for example: request status updates)
      const recentActivity = await OrdersToReceive.find({ recipientId })
        .sort({ deliveryDate: -1 })
        .limit(5); // Fetch last 5 activities
  
      // Return the dashboard data
      res.status(200).json({
        accountHolderName: recipient.userId.name, // Name of the recipient
        activeRequests,
        completedRequests,
        pendingApproval,
        recentActivity: recentActivity.map(activity => ({
          item: activity.items.map(i => i.itemId.itemName).join(', '), // Join all item names
          status: activity.deliveryStatus,
          date: activity.deliveryDate,
        })),
      });
    } catch (error) {
      console.error('Error fetching recipient dashboard data:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  };



module.exports = {
    addToCart,
    placeOrder,
    confirmOrder,
    getCartItems,
    removeFromCart,
    getRecipientDashboardData
};