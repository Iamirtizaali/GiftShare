const User = require('../../models/user');
const Admin = require('../../models/admin');
const Donor = require('../../models/donor');
const Recipient = require('../../models/recipient');
const Inventory = require('../../models/inventory');
const OrdersToReceive = require('../../models/ordersToReceive');

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

module.exports = {
    getAllDonors,
    getAllRecipients,
    getAllUsers,
    getAllPendingDonationRequests,
    getAllPendingRecipientRequests,
    getAllInventoryItems,
};