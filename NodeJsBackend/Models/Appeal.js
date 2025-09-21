const mongoose = require("mongoose");

const appealSchema = new mongoose.Schema({
  gradingReport: { type: String, required: true }, // URL of the grading report
  studentEmail: { type: String, required: true }, // Email of the student
  assessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
    required: true,
  }, // Reference to the assessment
  keyFile: { type: String, required: true }, // URL of the key file for the assessment
  description: { type: String, required: true }, // Appeal description
  createdAt: { type: Date, default: Date.now }, // Timestamp
});

const Appeal = mongoose.model("Appeal", appealSchema);

module.exports = Appeal;
