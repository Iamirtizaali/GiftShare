const User = require('../../models/user');
const Admin= require('../../models/admin');
const Donor = require('../../models/donor');
const Recipient = require('../../models/recipient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// JWT Secret
const JWT_SECRET = process.env.SECRET_KEY;

// User Signup
exports.userSignup = async (req, res) => {
  try {
    const { name, email, password, phone, role, address } = req.body;
    // res.status(200).json({ message: 'User registered successfully.', status: 'success' });
    // return;
    // Validate input
    if (!name || !email || !password || !phone || !role || !address) {
      return res.status(400).json({ 
        status: 'error',	// success
        message: 'All fields are required.' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'User already exists with this email.' });
    }

    // Create new user
    const newUser = new User({ name, email, password, phone, role, address });
    await newUser.save();
    if (newUser.role === 'Donor') {
        const newDonor = new Donor({ userId: newUser._id });
        await newDonor.save();
    } else if (newUser.role === 'Recipient') {
        const newRecipient = new Recipient({ userId: newUser._id });
        await newRecipient.save();
    } else if (newUser.role === 'Admin') {
        const newAdmin = new Admin({ userId: newUser._id });
        await newAdmin.save();
    }
    // Generate token
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, {
      expiresIn: '120h',
    });

    res.status(201).json({ message: 'User registered successfully.', token,newUser });
  } catch (error) {
    console.error('Error during user signup:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// User Login
exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: '120h',
    });

    res.status(200).json({ message: 'Login successful.', token ,user});
  } catch (error) {
    console.error('Error during user login:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};


