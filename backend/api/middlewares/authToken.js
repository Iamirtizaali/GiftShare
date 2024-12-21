const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Assuming the User model is in models/User.js

const authenticateToken = async (req, res, next) => {
    try {
        const token = req.cookies.authToken;

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token.' });
        }

        req.user = user; // Attach the user to the request object
        console.log('Authenticated user:', user);
        console.log("body is ",req.body);
        console.log("file is ",req.files);

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(403).json({ message: 'Forbidden: Invalid or expired token.' });
    }
};

module.exports = authenticateToken;
