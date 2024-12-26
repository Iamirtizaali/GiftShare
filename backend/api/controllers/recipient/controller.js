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
      const userId = req.user._id; // `req.user` is populated by the middleware
      const recipient = await Recipient.findOne({ userId: userId }).populate('userId', 'name');
      if (!recipient) {
        return res.status(404).json({ message: 'Recipient not found.' });
      }

      const recipientId = recipient._id;
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
      const recentActivity = await OrdersToReceive.find({ recipientId }).populate({ path: 'items.itemId', model: 'Inventory' })
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
          status: activity.deliveryStatus
        })),
      });
    } catch (error) {
      console.error('Error fetching recipient dashboard data:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  };




const displayItems= async (req, res) => {
    const { category } = req.params;
  
    try {
      const items = await Inventory.find({ category, availability: true });
      console.log('items are ',items);
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // Place order and update item quantity in inventory
  const createOrder= async (req, res) => {
    const {  cartItems } = req.body;
    const userId=req.user._id;
    const recipientId=await Recipient.findOne({userId:userId});
    console.log('recipient id is ',recipientId);
    console.log('cart items are ',cartItems);

  
    try {
      const newOrder = new OrdersToReceive({
        recipientId,
        items: cartItems,
      });
      //check if item.quantity is greater than available quantity
        for (let i = 0; i < cartItems.length; i++) {
            const item = await Inventory.findById(cartItems[i].itemId);
            console.log('item is ',item);
            if (item.quantity < cartItems[i].quantity) {
                return res.status(400).json({ message: 'Insufficient stock for ' + item.itemName });
            }
        }
      // Loop through cart items and update inventory
      cartItems.forEach(async (item) => {
        const inventoryItem = await Inventory.findById(item.itemId);
        inventoryItem.quantity -= item.quantity;
        if (inventoryItem.quantity <= 0) {
          inventoryItem.availability = false;
        }
        await inventoryItem.save();
      });
  
      await newOrder.save();
      res.status(200).json({ message: 'Order placed successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


// Add items to the recipient's cart
const cart= async (req, res) => {
  const { recipientId, itemId, quantity } = req.body;

  try {
    let recipient = await Recipient.findOne({ userId: recipientId });

    if (!recipient) {
      recipient = new Recipient({ userId: recipientId, cart: [] });
    }

    const existingItem = recipient.cart.find(item => item.itemId.toString() === itemId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      recipient.cart.push({ itemId, quantity });
    }

    await recipient.save();
    res.status(200).json({ message: 'Item added to cart' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET /api/recipient/account
const getRecipientAccount = async (req, res) => {
    try {
      const recipient = await Recipient.findOne({ userId: req.user._id }).populate('userId');
      if (!recipient) return res.status(404).json({ message: "Recipient not found" });
  
      res.status(200).json({ user: recipient.userId });
    } catch (error) {
      res.status(500).json({ message: "Error fetching account details" });
    }
  };

  
  // PUT /api/recipient/update-account
const updateRecipientAccount = async (req, res) => {
    const { name, email, phone, address } = req.body;
  
    try {
      const recipient = await Recipient.findOne({ userId: req.user._id }).populate('userId');
      if (!recipient) return res.status(404).json({ message: "Recipient not found" });
  
      recipient.userId.name = name || recipient.userId.name;
      recipient.userId.email = email || recipient.userId.email;
      recipient.userId.phone = phone || recipient.userId.phone;
      recipient.userId.address = address || recipient.userId.address;
  
      await recipient.userId.save();
      await recipient.save();
  
      res.status(200).json({ message: "Account details updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error updating account details" });
    }
  };

  

  // PUT /api/recipient/update-password
const updateRecipientPassword = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
  
    try {
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
  
      const recipient = await Recipient.findOne({ userId: req.user._id }).populate('userId');
      if (!recipient) return res.status(404).json({ message: "Recipient not found" });
  
      const isMatch = await bcrypt.compare(currentPassword, recipient.userId.password);
      if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      recipient.userId.password = hashedPassword;
      await recipient.userId.save();
  
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error updating password" });
    }
  };
  
// DELETE /api/recipient/delete-account
const deleteRecipientAccount = async (req, res) => {
    try {
      const recipient = await Recipient.findOne({ userId: req.user._id }).populate('userId');
      if (!recipient) return res.status(404).json({ message: "Recipient not found" });
  
      await recipient.userId.remove(); // Remove user record
      await recipient.remove(); // Remove recipient record
  
      res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting account" });
    }
  };
  


module.exports = {
    addToCart,
    placeOrder,
    confirmOrder,
    getCartItems,
    removeFromCart,
    getRecipientDashboardData,
    displayItems,
    createOrder,
    cart,
    getRecipientAccount,
    updateRecipientAccount,
    updateRecipientPassword,
    deleteRecipientAccount,
  
};