const User = require('../../models/user');
const Admin = require('../../models/admin');
const Donor = require('../../models/donor');
const Recipient = require('../../models/recipient');
const Inventory = require('../../models/inventory');
const OrdersToReceive = require('../../models/ordersToReceive');
const ordersToDeliver = require('../../models/ordersToDeliver');

// Get all donors
const getAllDonors = async (req, res) => {
    try {
        const donors = await Donor.find();
        res.status(200).json(donors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all recipients
const getAllRecipients = async (req, res) => {
    try {
        const recipients = await Recipient.find();
        res.status(200).json(recipients);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all pending donation requests
const getAllPendingDonationRequests = async (req, res) => {
    try {
        const pendingDonations = await DonationOrder.find({ status: 'Pending' });
        res.status(200).json(pendingDonations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all pending recipient requests
const getAllPendingRecipientRequests = async (req, res) => {
    try {
        const pendingRecipients = await OrdersToReceive.find({ deliveryStatus: 'Pending' });
        res.status(200).json(pendingRecipients);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all inventory items
const getAllInventoryItems = async (req, res) => {
    try {
        const inventoryItems = await Inventory.find();
        res.status(200).json(inventoryItems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const signup = async (req, res) => {
   try {
    const { name, email, password, phone, role, address } = req.body;
    if (!name || !email || !password || !phone || !role || !address) {
        return res.status(400).json({ 
            status: 'error',	// success
            message: 'All fields are required.' 
        });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists.' });
    }
    
    const newUser = new User({
        name,
        email,
        password,
        phone,
        role,
        address,
    });
    await newUser.save();
    if (role === 'Donor') {
        const newDonor = new Donor({ userId: newUser._id });
        await newDonor.save();
    } else if (role === 'Recipient') {
        const newRecipient = new Recipient({ userId: newUser._id });
        await newRecipient.save();
    } else if (role === 'Admin') {
        const newAdmin = new Admin({ userId: newUser._id });
        await newAdmin.save();
    }
    res.status(201).json({ message: 'User registered successfully.', newUser });
}
catch (err) {
    res.status(500).json({ message: err.message });
}
};

const getAdminDashboardData = async (req, res) => {
    try {
        console.log('Fetching admin dashboard data...');
      // Fetch the total number of registered users
      const registeredUsers = await User.countDocuments({});
  
      // Fetch the total number of pending requests (requests that have not been delivered or confirmed)
      const pendingRequests = await OrdersToReceive.countDocuments({ deliveryStatus: 'Pending' });
      //also add ordersToDeliver
      const pendingDonations = await ordersToDeliver.countDocuments({ deliveryStatus: 'Pending' });
      // Fetch the total number of items donated (donated items)
      const itemsDonated = await Inventory.countDocuments({ availability: true });
  console.log('pending donations:',pendingDonations);
    
      // Return the data to the frontend
      res.status(200).json({
        registeredUsers,
        pendingRequests,
        itemsDonated,
        reportsGenerated: 0,
        pendingDonations
      });
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  };


//update data
const updateUser = async (req, res) => {
    try {
      const { userId } = req.params;
      const { name, email, phone, address } = req.body;
  
      // Find the user by ID and update the information
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { name, email, phone, address },
        { new: true } // Return the updated user
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found." });
      }
  
      res.status(200).json(updatedUser); // Return the updated user
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  };

// Update inventory item details
const updateInventoryItem = async (req, res) => {
    try {
      const { itemId } = req.params;
      const { itemName, categoryId, quantity, condition, description, availability } = req.body;
  
      // Update the inventory item
      const updatedItem = await Inventory.findByIdAndUpdate(
        itemId,
        { itemName, categoryId, quantity, condition, description, availability },
        { new: true } // Return the updated item
      );
  
      if (!updatedItem) {
        return res.status(404).json({ message: 'Item not found.' });
      }
  
      res.status(200).json(updatedItem);
    } catch (error) {
      console.error('Error updating inventory item:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  };
  
  // Assuming we have models for OrdersToReceive, OrdersToDeliver, and Inventory

// Get all Orders to Receive
const getAllOrdersToReceive = async (req, res) => {
  try {
    const orders = await OrdersToReceive.find().populate('recipientId').populate('items.itemId');

    console.log('orders to receive:',orders);
    res.status(200).json(orders);
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all Orders to Deliver
const getAllOrdersToDeliver = async (req, res) => {
  try {
    const orders = await ordersToDeliver.find()
      .populate({
        path: 'donorId',
        model: 'User',
      });
    console.log('orders to deliver:',orders);
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve or Reject Orders
const approveRejectOrder = async (req, res) => {
    const { orderId, status } = req.body; // status can be 'Confirmed' or 'Rejected'
    try {
      const order = await OrdersToReceive.findById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      order.deliveryStatus = status;
      await order.save();
  
      if (status === 'Confirmed') {
        // For OrdersToReceive, we just update the status
        res.status(200).json({ message: 'Order confirmed' });
      } else if (status === 'Rejected') {
        // Handle rejection logic if needed
        res.status(200).json({ message: 'Order rejected' });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  // Approve or Reject Orders to Deliver and Add Items to Inventory
  const approveRejectDeliveryOrder = async (req, res) => {
    console.log('entered in approveRejectDeliveryOrder');
    const { orderId, status } = req.body; // status can be 'Delivered' or 'Rejected'
    try {
      const order = await ordersToDeliver.findById(orderId);
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      order.deliveryStatus = status;
      await order.save();
  
      if (status === 'Confirmed') {
        // Add items to inventory
        const inventoryItems = order.cart.map(item => ({
          itemName: item.itemName,
          category: item.category,
          quantity: item.quantity,
          condition: item.condition,
          description: item.description,
          addedBy: order.donorId,
          availability: true, // Make it available for request
            images: item.images,
        }));
  
        await Inventory.insertMany(inventoryItems);
        res.status(200).json({ message: 'Items added to inventory and order delivered' });
      } else if (status === 'Rejected') {
        res.status(200).json({ message: 'Order rejected' });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  

// Update admin user profile
const settings= async (req, res) => {
  const { username, email, password } = req.body;
  const adminId = req.user._id; // Get admin's userId from the authentication token

  try {
    const user = await User.findById(adminId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user information
    user.name = username || user.name;
    user.email = email || user.email;
    if (password) {
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Logout endpoint to clear the authentication token
const logout=async (req, res) => {
  // Clear the cookie or token
  res.clearCookie('token'); // or use res.send() if you're using session-based login
  res.status(200).json({ message: 'Logged out successfully' });
};





module.exports = {
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
  
};