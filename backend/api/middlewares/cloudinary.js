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
    folder: 'profiles', // The folder in Cloudinary where you want to store images

    params: {
        resource_type: 'auto'

    },
});

const parser = multer({ storage });

const setupUploadImageMiddleware = (req, res, next) => {
    parser.single('image')(req, res, (err) => {
        if (err) {
            console.error('Error uploading file:', err);
            return res.status(500).json({ message: "File not uploaded", error: err });
        }
        next();
    });
};
//& DOCUMENT UPLOADING
const docStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'documents', // The folder in Cloudinary where you want to store images
    params: {
        resource_type: 'auto'
    },
});

const docParser = multer({ storage: docStorage });

const setupUploadDocMiddleware = (req, res, next) => {
    docParser.array('documents')(req, res, async (err) => {
        if (err) {
            console.error('Error uploading files:', err);
            return res.status(500).json({ message: "Files not uploaded", error: err.message });
        }

        try {
            // Upload files to Cloudinary and attach URLs and IDs to the request object
            const uploadPromises = req.files.map(file => cloudinary.uploader.upload(file.path));
            const results = await Promise.all(uploadPromises);

            req.fileUrls = results.map(result => result.secure_url);
            req.cloudinaryIds = results.map(result => result.public_id);
            next();
        } catch (uploadErr) {
            console.error('Error uploading to Cloudinary:', uploadErr);
            return res.status(500).json({ message: "Files not uploaded to Cloudinary", error: uploadErr.message });
        }
    });
};

module.exports = {setupUploadImageMiddleware,setupUploadDocMiddleware,cloudinary};