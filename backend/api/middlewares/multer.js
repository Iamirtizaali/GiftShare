// middlewares/uploadImage.js
const multer = require('multer');
const path = require('path');

// Configure storage options
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'D:/SE study material 3rd semester/SE Semester Project/GiftShare/backend/uploads'); // Specify directory for profile pictures
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.userId}-${Date.now()}${path.extname(file.originalname)}`); // Generate unique filename
  },
});

// Filter for image uploads
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
