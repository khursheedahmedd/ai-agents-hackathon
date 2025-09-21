const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  questionFile: { type: String },
  keyFile: { type: String },
  images: [{ type: String }], // Optional: If you allow images
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
  dueDate: { type: Date },
  openEnded: { type: Boolean, default: false }, // Indicates if the folder is open-ended
  rubric: {
    questions: [
      {
        questionNumber: { type: Number, required: true },
        questionText: { type: String, required: true },
        totalMarks: { type: Number, required: true },
        rubric: { type: Map, of: String }, // Changed to support custom fields
        openEnded: { type: Boolean, default: false },
      },
    ],
    conceptCorrectness: { type: Number }, // Make optional
    similarityCorrectness: { type: Number }, // Make optional
  },
  totalMarks: { type: Number, required: true }, // Total marks for the entire assessment
  submissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task", // Reference to the Task model
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Folder = mongoose.model("Folder", folderSchema);

module.exports = Folder;
