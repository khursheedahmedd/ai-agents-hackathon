const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  classId: { type: String, required: true, unique: true }, // Ensure classId is unique
  className: { type: String, required: true }, // Ensure className is unique
  capacity: { type: Number, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }, // Array of teacher IDs
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }], // Array of student IDs
  folders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Folder" }], // Array of folder IDs
});

const Class = mongoose.model("Class", classSchema);
module.exports = Class;
