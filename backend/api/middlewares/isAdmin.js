// middleware/authorizeAdmin.js
const jwt = require("jsonwebtoken");
const config = require("../../helpers/config");

const authorizeAdmin = (req, res, next) => {

  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token)
    return res.status(401).json({ error: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
   
    req.user = decoded;
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    next();
  } catch (ex) {
    res.status(400).json({ error: "Invalid token." });
  }



  };
  
  module.exports = authorizeAdmin;
  