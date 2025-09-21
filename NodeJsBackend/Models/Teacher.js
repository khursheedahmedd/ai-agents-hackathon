const { FindCursor } = require("mongodb");
const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  clerkUserId: { type: String, required: true, unique: true },
  role: { type: String, required: true, default: "teacher" },
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }], // Array of class IDs
});

const Teacher = mongoose.model("Teacher", teacherSchema);
module.exports = Teacher;
