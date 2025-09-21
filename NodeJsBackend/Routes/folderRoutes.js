const express = require("express");
const { addFolder, deleteFolder } = require("../Controllers/folderController");
// const upload = require("../Middlewares/uploadMiddleware");
const upload = require("../Middlewares/uploadMiddleware");

const router = express.Router();

// Route to add a folder with Cloudinary file uploads
router.post(
  "/add-folder",
  upload.fields([
    { name: "questionFile", maxCount: 1 },
    { name: "keyFile", maxCount: 1 },
  ]),
  addFolder
);

// Route to delete an assessment (folder)
router.delete("/delete-folder/:folderId", deleteFolder);

// router.post("/add-folder", upload.single("questionFile"), addFolder);

module.exports = router;
