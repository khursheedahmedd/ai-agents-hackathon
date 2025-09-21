const express = require("express");
const router = express.Router();
const {
  addTeacher,
  assignClassToTeacher,
  getTeacherDetails,
  generateExcelSheet,
} = require("../Controllers/teacherController");

// Route to add a new teacher
router.post("/teachers", addTeacher);

// Route to assign a class to a teacher
router.post("/teachers/assign-class", assignClassToTeacher);

// Route to get teacher details and their classes
router.get("/teachers/:teacherEmail", getTeacherDetails);

router.post("/teachers/generate-excel", generateExcelSheet);

module.exports = router;
