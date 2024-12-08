// middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const config = require("../../helpers/config");

const authenticate = (req, res, next) => {
  console.log('sfddsffs',req.header("Authorization"))
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token)
    return res.status(401).json({ error: "Access denied. No token provided." });
  console.log(token);
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ error: "Invalid token." });
  }
};

module.exports = authenticate;
