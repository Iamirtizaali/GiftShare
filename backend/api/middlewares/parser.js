const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../../utils/cloudinary');

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'donation_items', // Folder in Cloudinary
    resource_type: 'auto', // Support multiple file types
  },
});

const parser = multer({ storage });

module.exports = parser;