const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Function to generate a random 6-digit code
function generateRandomCode() {
  return Math.floor(100000 + Math.random() * 900000);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("file is ", file);
    console.log("path is ", path.join(__dirname, "../api/data"));
    cb(null, path.join(__dirname,"..","data"));
  },
  filename: function (req, file, cb) {
    cb(null, `${new Date().getTime()}_${file.originalname}`);
  },
  limits: { fileSize: 100000000 }, // limit file size to 1MB
});

const fileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpeg|JPEG|jpg|JPG|png|PNG)$/)) {
    return cb(new Error('Unsupported file type'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});  // Ensure the field name here matches the one in your form or frontend request

const uploadDocuments = () => {
  const createDestinationDirectory = () => {
    const destinationPath = path.join(
      __dirname,
      "..",
      "data",
    );
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true });
    }
    return destinationPath;
  };

  return multer({
    storage: multer.diskStorage({
      destination(req, file, cb) {
        cb(null, createDestinationDirectory());
      },
      filename(req, file, cb) {
        const randomCode = generateRandomCode();
        const fileName = `${randomCode}_${file.originalname}`;
        cb(null, fileName);
      },
    }),
    fileFilter: (req, file, cb) => {
      // Accept all files
      cb(null, true);
    },
  });  // Use 'array' for handling multiple files with the same field name
};

module.exports = { upload, uploadDocuments };