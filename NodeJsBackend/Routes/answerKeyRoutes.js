const express = require("express");
const upload = require("../Middlewares/uploadMiddleware");
const fastapiService = require("../services/fastapiService");

const router = express.Router();

// Upload answer key and extract Q&A pairs
router.post("/upload-key", upload.single("keyFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Create FormData for FastAPI
    const FormData = require("form-data");
    const fs = require("fs");
    
    const formData = new FormData();
    formData.append("key_file", fs.createReadStream(req.file.path));

    // Use FastAPI service to process the answer key
    const result = await fastapiService.uploadAnswerKey(formData);
    
    if (!result.success) {
      return res.status(500).json({
        message: "Answer key processing failed",
        error: result.error,
        details: result.data
      });
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: "Answer key processed successfully",
      qa_pairs: result.data.qa_pairs
    });
  } catch (error) {
    console.error("Error processing answer key:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
});

module.exports = router;
