const bcrypt = require("bcrypt");
const axios = require("axios");
const Folder = require("../Models/Folder");
const Teacher = require("../Models/Teacher");
const Class = require("../Models/Class");
const fastapiService = require("../services/fastapiService");
require("dotenv").config();

const addTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the teacher already exists
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ message: "Teacher already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new teacher
    const newTeacher = new Teacher({
      name,
      email,
      password: hashedPassword,
    });

    // Save the teacher to the database
    await newTeacher.save();

    // Respond with the created teacher (excluding the password for security)
    res.status(201).json({
      _id: newTeacher._id,
      name: newTeacher.name,
      email: newTeacher.email,
    });
  } catch (error) {
    console.error("Error adding teacher:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const assignClassToTeacher = async (req, res) => {
  try {
    const { teacherEmail, className } = req.body;

    // Find teacher and class
    const teacher = await Teacher.findOne({ email: teacherEmail });
    const classToAssign = await Class.findOne({ className });

    if (!teacher || !classToAssign) {
      return res.status(404).json({ message: "Teacher or class not found" });
    }

    // Assign class to teacher (example logic)
    teacher.classes.push(classToAssign._id);
    await teacher.save();

    res.status(200).json({ message: "Class assigned successfully" });
  } catch (error) {
    console.error("Error assigning class:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get teacher details and their classes
const getTeacherDetails = async (req, res) => {
  try {
    const { teacherEmail } = req.query;

    console.log("email", teacherEmail);
    // Find the teacher by email and populate the classes they teach
    const teacher = await Teacher.findOne({ email: teacherEmail }).populate({
      path: "classes",
      select: "className capacity students",
      populate: {
        path: "folders", // Populate folders within each class
        select: "name description questionFile keyFile", // Adjust fields as needed
      },
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Respond with the teacher's details and their classes
    res.status(200).json({
      // _id: teacher._id,
      name: teacher.name,
      role: teacher.role,
      name: teacher.name,
      email: teacher.email,
      classes: teacher.classes,
    });
  } catch (error) {
    console.error("Error fetching teacher details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const generateExcelSheet = async (req, res) => {
  try {
    const { folderId } = req.body;

    // Query the database for the folder and its submissions
    const folder = await Folder.findById(folderId).populate({
      path: "submissions",
      populate: {
        path: "student", // Populate the student field in each submission
        select: "firstName lastName email", // Select firstName, lastName, and email fields
      },
    });

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    // Check if there are any submissions
    if (!folder.submissions || folder.submissions.length === 0) {
      return res.status(400).json({ 
        message: "No submissions found for this assessment",
        error: "No submissions available to generate Excel report"
      });
    }

    // Extract student data, grading results, and calculate marks
    const submissions = folder.submissions.map((submission) => {
      const gradingResults = submission.gradingResults || [];
      const totalMarks = gradingResults.reduce(
        (sum, result) => sum + (result.totalMarks || 0),
        0
      ); // Sum of total marks
      const obtainedMarks = gradingResults.reduce(
        (sum, result) => sum + (result.marks_awarded || 0),
        0
      ); // Sum of marks awarded

      return {
        student_name: submission.student
          ? `${submission.student.firstName || ""} ${
              submission.student.lastName || ""
            }`.trim()
          : "Name not found", // Combine firstName and lastName, or use fallback
        student_email: submission.student?.email || "Email not found",
        total_marks: totalMarks,
        obtained_marks: obtainedMarks,
      };
    });

    console.log(`Processing ${submissions.length} submissions for Excel generation`);
    console.log("Sample submission:", submissions[0]);

    // Use FastAPI service for Excel generation
    console.log('Starting Excel generation...');
    const excelResult = await fastapiService.generateExcel(submissions);
    
    if (!excelResult.success) {
      console.error('Excel generation failed:', excelResult.error);
      return res.status(500).json({ 
        message: "Excel generation failed", 
        error: excelResult.error,
        details: excelResult.data
      });
    }

    const { excelUrl } = excelResult.data;

    // Return the Cloudinary URL to the frontend
    res.status(200).json({ excelUrl });
  } catch (error) {
    console.error("Error generating Excel sheet:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  generateExcelSheet,
  addTeacher,
  getTeacherDetails,
  assignClassToTeacher,
};
