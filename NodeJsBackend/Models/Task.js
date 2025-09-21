const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  taskName: { type: String, required: true },
  folder: { type: mongoose.Schema.Types.ObjectId, ref: "Folder" },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  submissionFile: { type: String, required: true },
  gradingReport: { type: String }, // URL of the grading report PDF
  gradingResults: { type: Array }, // Grading results
  // Issue:{type:String},
  submittedAt: { type: Date, default: Date.now },
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
