const express = require("express");
const upload = require("../Middlewares/uploadMiddleware");
const { submitTask } = require("../Controllers/studentController");
const { getEnrolledClasses } = require("../Controllers/studentController");
const router = express.Router();
const {
  addStudent,
  enrollStudentInClass,
  getAllStudents,
  removeStudentFromClass,
} = require("../Controllers/studentController");

// Route to add a new student
router.post("/students", addStudent);

// Route to enroll a student into a class
router.post("/students/enroll", enrollStudentInClass);

// Route to remove a student from a class
router.post("/students/remove", removeStudentFromClass);

// Route to get classes a student is enrolled in
router.get("/students/classes", getEnrolledClasses);

router.get("/getStudents", getAllStudents);

// Route to submit a task
router.post(
  "/students/submit-task",
  upload.single("submissionFile"), // Handle file upload
  submitTask
);

module.exports = router;
