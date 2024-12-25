const OrdersToDeliver = require('../../models/ordersToDeliver');
const Inventory = require('../../models/inventory');
const User = require('../../models/user');
const Admin= require('../../models/admin');
const Donor = require('../../models/donor');
const Recipient = require('../../models/recipient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { IMAGE_TYPES } = require("../../../utils/constants");
const mongoose= require("mongoose");
const path = require("path"); // Profile picture upload function
const dir = "image/";
const { UPLOAD_S3_IMAGE } = require("../../../utils/uploadImage");
// Donor creates a donation order
const cloudinary = require('cloudinary').v2;

const multer = require('multer');

exports.createDonationOrder = async (req, res) => {
  try {
    console.log("req.files is ",req.files);
    console.log("req.body is ",req.body);
    const donorId = req.user._id;
    const donor = await Donor.findOne({ userId: donorId });

    if (!donor) {
      return res.status(404).json({ message: 'Donor not found.' });
    }

    const { address, pickupDate } = req.body;
    //make an array of all images path
    let images = [];
    if (req.files) {
      images = req.files.map((file) => file.path);
    }
    let cart= {};
      //create cart
      cart.itemName=req.body.itemName;
      cart.category=req.body.category;
      cart.quantity=req.body.quantity;
      cart.condition=req.body.condition;
      cart.description=req.body.description;
      cart.images=images;

    const newOrder = new OrdersToDeliver({
      donorId,
      cart,
      address,
      pickupDate // Store image filenames in the order
    });

    await newOrder.save();
    res.status(201).json({ message: 'Donation order created successfully.', order: newOrder });
  }
  catch (error) {
    console.error('Error creating donation order:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
// Admin approves/rejects an order
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!['Confirmed', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const updatedOrder = await OrdersToDeliver.findByIdAndUpdate(
      orderId,
      { deliveryStatus: status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.status(200).json({
      message: `Order ${status.toLowerCase()} successfully.`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update delivery status of an order and add items to inventory if delivered
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;


    const order = await OrdersToDeliver.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.deliveryStatus === 'Delivered') {
      return res.status(400).json({ message: 'Order is already delivered.' });
    }

    order.deliveryStatus = "Delivered";
    order.deliveryDate = new Date();
    await order.save();

    // Add items to inventory
    const inventoryPromises = order.cart.map((item) => {
      return Inventory.create({
        itemName: item.itemName,
        categoryId: item.categoryId,
        quantity: item.quantity,
        condition: item.condition,
        addedBy: order.donorId,
        description: item.description,
      });
    });

    await Promise.all(inventoryPromises);

    res.status(200).json({
      message: 'Delivery status updated and items added to inventory.',
      order,
    });
  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



exports.getDonorDashboardData = async (req, res) => {
  try {
    console.log(req.user);
    console.log("hello");
      const donorId = req.user._id; // `req.user` is populated by the middleware
      const donor = await Donor.findOne({ userId: donorId });

      if (!donor) {
          return res.status(404).json({ message: 'Donor not found.' });
      }

      const totalDonations = await OrdersToDeliver.find({ donorId }).countDocuments();
      const pendingPickups = await OrdersToDeliver.find({ donorId, deliveryStatus: 'Pending' }).countDocuments();
      const familiesHelped = await OrdersToDeliver.find({ donorId, deliveryStatus: 'Delivered' }).countDocuments();
      const upcomingPickups = await OrdersToDeliver.find({ donorId }).select('cart pickupDate deliveryStatus');

      res.status(200).json({
          accountHolderName: donor.name,
          totalDonations,
          pendingPickups,
          familiesHelped,
          upcomingPickups: upcomingPickups.map(order => ({
              item: order.cart.map(c => c.itemName).join(', '),
              date: order.pickupDate,
              status: order.deliveryStatus,
          })),
      });
  } catch (error) {
      console.error('Error fetching donor dashboard data:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
};




exports.getDonorHistory = async (req, res) => {
  try {
    const donorId = req.user._id; // Retrieved from authenticated middleware
    console.log("hello , " + donorId);
      const donor = await Donor.findOne({ userId: donorId });

      if (!donor) {
          return res.status(404).json({ message: "Donor not found." });
      }
      const user=await  User.findOne({ _id: donorId });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
    }

      const totalDonations = await OrdersToDeliver.find({ donorId }).countDocuments();
      const pendingPickups = await OrdersToDeliver.find({ donorId, deliveryStatus: "Pending" }).countDocuments();
      const familiesHelped = await OrdersToDeliver.find({ donorId, deliveryStatus: "Delivered" }).countDocuments();
      const upcomingPickups = await OrdersToDeliver.find({ donorId }).select("cart pickupDate deliveryStatus");

      res.status(200).json({
          accountHolderName: user.name,
          totalDonations,
          pendingPickups,
          familiesHelped,
          upcomingPickups: upcomingPickups.map((order) => ({
              item: order.cart.map((c) => c.itemName).join(", "),
              date: order.pickupDate,
              status: order.deliveryStatus,
          })),
      });
  } catch (error) {
      console.error("Error fetching donor history:", error);
      res.status(500).json({ message: "Internal server error." });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    console.log("req.files is ",req.files);
    const { image } = req.files;
    console.log("image is ",image);
    const uploadResult = await UPLOAD_S3_IMAGE(image.originalname, 'donation_items/', image.buffer);
    if (!uploadResult.status) {
      throw new Error(uploadResult.error);
    }
    res.status(200).json({
      message: "Image uploaded successfully",
      image_url: uploadResult.image_file_name,
    });
  }
  catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: "Internal server error" });
  }
} 

exports.getSettings = async (req, res) => {
  try {
    const donorId = req.user._id;
    const donor = await Donor.findOne({ userId: donorId });
    if (!donor) {
      return res.status(404).json({ message: "Donor not found." });
    }
    const user=await  User.findOne({ _id: donorId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      state: user.state,
      zip: user.zip,
      country: user.country,
      image: user.image,
    });
  }
  catch (error) {
    console.error("Error fetching donor settings:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}




// API to update donor details
exports.updateDonorDetails = async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        const donor = await User.findByIdAndUpdate(
            req.user.id,
            { name, email, phone, address },
            { new: true } // Return the updated user
        );
        if (!donor) {
            return res.status(404).json({ message: "Donor not found" });
        }
        res.status(200).json({ message: "Donor details updated successfully", donor });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};



// API to update password
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        
        // Check if new and confirm passwords match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "New password and confirmation do not match" });
        }

        // Find user by ID
        const donor = await User.findById(req.user.id);
        if (!donor) {
            return res.status(404).json({ message: "Donor not found" });
        }

        // Compare current password with the stored password
        const isMatch = await bcrypt.compare(currentPassword, donor.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        // Hash new password and update it
        const salt = await bcrypt.genSalt(10);
        donor.password = await bcrypt.hash(newPassword, salt);
        await donor.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


// donorController.js
// API to delete donor account
exports.deleteAccount = async (req, res) => {
  try {
      const donor = await User.findByIdAndDelete(req.user.id);
      if (!donor) {
          return res.status(404).json({ message: "Donor not found" });
      }
      res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
  }
};

// API to get user data
exports.getUserData = async (req, res) => {
  try {
      // Get the user from the database using the user ID from the JWT
      const user = await User.findById(req.user.id);
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ user });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
  }
};