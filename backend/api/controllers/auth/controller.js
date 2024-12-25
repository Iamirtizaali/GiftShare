const User = require('../../models/user');
const Admin= require('../../models/admin');
const Donor = require('../../models/donor');
const Recipient = require('../../models/recipient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path');

// JWT Secret
const JWT_SECRET = process.env.SECRET_KEY;

// User Signup
exports.userSignup = async (req, res) => {
  try {
    const { name, email, password, phone, role, address } = req.body;
    // res.status(200).json({ message: 'User registered successfully.', status: 'success' });
    // return;
    // Validate input
    console.log(name, email, password, phone, role, address);
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
    console.log(newUser);
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
      console.log(email, password);
      // Validate input
      if (!email || !password) {
          return res.status(400).json({ message: 'Email and password are required.' });
      }

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(400).json({ message: 'Invalid credentials. User not found' });
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ message: 'Invalid credentials. Wrong password' });
      }

      // Generate token
      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
          expiresIn: '120h',
      });

      // Set cookie
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: false, // Set to true in production
        sameSite: 'lax', // Adjust based on frontend/backend domain setup
        maxAge: 120 * 60 * 60 * 1000, // 120 hours
    });

      // Send user and role-specific data
      if (user.role === 'Donor') {
          const donor = await Donor.findOne({ userId: user._id });
          res.status(200).json({ message: 'Login successful.', user: { role: user.role, ...donor._doc } });
      } else if (user.role === 'Recipient') {
          const recipient = await Recipient.findOne({ userId: user._id });
          res.status(200).json({ message: 'Login successful.', user: { role: user.role, ...recipient._doc } });
      } else if (user.role === 'Admin') {
          const admin = await Admin.findOne({ userId: user._id });
          res.status(200).json({ message: 'Login successful.', user: { role: user.role, ...admin._doc } });
      } else {
          res.status(200).json({ message: 'Login successful.', user });
      }
  } catch (error) {
      console.error('Error during user login:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
};



exports.logoutUser = (req, res) => {
  try {
      res.clearCookie("authToken", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // Match cookie settings
          sameSite: "lax", // Match cookie settings
      });
      res.status(200).json({ message: "Logout successful." });
  } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ message: "Internal server error." });
  }
};



// API to request password reset link
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate a unique token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiration = Date.now() + 3600000; // 1 hour expiration
        await user.save();

        // Send the reset email
        const transporter = nodemailer.createTransport({
            service: 'gmail', // or any other email service you prefer
            auth: {
                user: 'aliirtiza859@gmail.com',
                pass: 'pbqj xrqo lyyd dshc'
            }
        });

        const resetLink = `http://localhost:4000/api/auth/reset-password/${resetToken}`;
        await transporter.sendMail({
            to: email,
            subject: 'Password Reset',
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
        });

        res.status(200).json({ message: "Password reset link sent to email." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


// authController.js
exports.resetPassword = async (req, res) => {
 // const { token } = req.params;
 console.log(req.body);
  const { newPassword, confirmPassword ,token} = req.body;
console.log('entered in reset password', token, newPassword, confirmPassword);
  try {
      const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });

      if (!user) {
          return res.status(400).json({ message: "Invalid or expired token user not found" });
      }

      if (newPassword !== confirmPassword) {
          return res.status(400).json({ message: "Passwords do not match" });
      }

      // Hash the new password and save it
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      await user.save();

      res.status(200).json({ message: "Password has been successfully updated" });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
  }
};



exports.resetPage = async (req, res) => {
    const token = req.params.token;
    console.log('Entered in reset page with token:', token);

    try {
        // Validate the token: Check if the token exists and is not expired
        const user = await User.findOne({ 
            resetToken: token, 
            resetTokenExpiration: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Serve the reset-password.html page and pass the token as a query parameter
        // Send token as query parameter to frontend
        res.sendFile(path.join(__dirname, '..', '..', '..', 'frontend', 'views', 'reset-password.html') + `?token=${token}`);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
