const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'donation_items', // Folder in Cloudinary
        resource_type: 'auto', // Support multiple file types
    },
});

const parser = multer({ storage });

const setupUploadImageMiddleware = (req, res, next) => {
    parser.array('cart[0][images]', 20)(req, res, (err) => {
        if (err) {
            console.error('Error uploading files:', err);
            return res.status(500).json({ message: 'Files not uploaded', error: err });
        }
        next();
    });
};

module.exports = { setupUploadImageMiddleware, cloudinary };