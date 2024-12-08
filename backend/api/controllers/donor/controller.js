const OrdersToDeliver = require('../../models/ordersToDeliver');
const Inventory = require('../../models/inventory');
const User = require('../../models/user');
const Admin= require('../../models/admin');
const Donor = require('../../models/donor');
const Recipient = require('../../models/recipient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// Donor creates a donation order
exports.createDonationOrder = async (req, res) => {
  try {
    console.log(req.user);
    const { cart,address,pickupDate } = req.body;
    const userId=req.user.id;
    const donor=await Donor.findOne({ userId: userId });
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found.' });
    }
    const donorId = donor._id;
    if (!cart || cart.length === 0) {
      return res.status(400).json({ message: 'Cart cannot be empty.' });
    }

    const newOrder = new OrdersToDeliver({
      donorId,
      cart,
      address,
      pickupDate,
    });

    await newOrder.save();
    donor.

    res.status(201).json({
      message: 'Donation order created successfully',
      order: newOrder,
    });
  } catch (error) {
    console.error('Error creating donation order:', error);
    res.status(500).json({ message: 'Internal server error' });
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
