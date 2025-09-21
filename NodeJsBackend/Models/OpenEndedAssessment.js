const mongoose = require("mongoose");

const openEndedAssessmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  questionFile: { type: String, required: true }, // File for the open-ended questions
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  dueDate: { type: Date, required: true },
  totalMarks: { type: Number, required: true }, // Total marks for the assessment
  createdAt: { type: Date, default: Date.now },
});

const OpenEndedAssessment = mongoose.model(
  "OpenEndedAssessment",
  openEndedAssessmentSchema
);

module.exports = OpenEndedAssessment;
