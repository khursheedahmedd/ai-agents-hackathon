// upload.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require("path");
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET

});

// Set up Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "uploads", // Cloudinary folder name
      format: path.extname(file.originalname).substring(1), // Extract file extension
      public_id: Date.now() + "-" + file.originalname.split(".")[0], // Unique file name
    };
  },
});

// Debugging Log
console.log("✅ Multer Cloudinary Storage Initialized");

// Create the multer instance
const upload = multer({ storage: storage });

module.exports = upload;
