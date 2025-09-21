const express = require("express");
const router = express.Router();
const classController = require("../Controllers/classController");

// Route to add a new class
router.post("/addClass", classController.addClass);

// Add the route to your Express app
router.get("/classes/:classId/folders", classController.getClassFolders);

// Route to get the list of students in a specific class
router.get("/classes/:classId/students", classController.getClassStudents);

// Route to get details of a specific class
router.get("/classes/:classId", classController.getClassDetails);

module.exports = router;
