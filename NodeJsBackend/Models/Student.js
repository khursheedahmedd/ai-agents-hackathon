const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  clerkUserId: { type: String, required: true, unique: true },
  role: { type: String, required: true, default: "student" },
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  enrolledClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }], // Array of class IDs
  taskSubmissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }], // Array of task submission IDs
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
