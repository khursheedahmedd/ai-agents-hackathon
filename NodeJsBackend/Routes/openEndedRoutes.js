const express = require("express");
const {
  addOpenEndedAssessment,
  getOpenEndedAssessments,
} = require("../Controllers/openEndedController");
const upload = require("../Middlewares/uploadMiddleware");

const router = express.Router();

// Route to add an open-ended assessment
router.post(
  "/add-open-ended",
  upload.single("questionFile"), // Upload the question file
  addOpenEndedAssessment
);
// Route to fetch open-ended assessments for a class
router.get("/class/:classId", getOpenEndedAssessments);

module.exports = router;
