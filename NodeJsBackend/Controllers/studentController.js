const bcrypt = require("bcrypt");
const Student = require("../Models/Student");
const Class = require("../Models/Class");
const Task = require("../Models/Task");
const Folder = require("../Models/Folder");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const fastapiService = require("../services/fastapiService");
require("dotenv").config();

// Add a new student
const addStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the student already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: "Student already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10); // Generate a salt
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password

    // Create a new student
    const newStudent = new Student({
      name,
      email,
      password: hashedPassword, // Save the hashed password
    });

    // Save the student to the database
    await newStudent.save();

    // Respond with the created student (excluding the password for security)
    res.status(201).json({
      _id: newStudent._id,
      name: newStudent.name,
      email: newStudent.email,
    });
  } catch (error) {
    console.error("Error adding student:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find(); // Fetch all students
    res.status(200).json(students); // Send the students as a response
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Enroll a student into a class
const enrollStudentInClass = async (req, res) => {
  try {
    const { studentEmail, classId } = req.body;
    console.log("request body", req.body);
    // Find the student by email
    const student = await Student.findOne({ email: studentEmail });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find the class by name
    const classToEnroll = await Class.findOne({ _id: classId });
    if (!classToEnroll) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Check if the student is already enrolled in the class
    if (student.enrolledClasses.includes(classToEnroll._id)) {
      return res
        .status(400)
        .json({ message: "Student already enrolled in this class" });
    }

    // Check if the class has reached its capacity
    if (classToEnroll.students.length >= classToEnroll.capacity) {
      return res.status(400).json({ message: "Class is full" });
    }

    // Enroll the student in the class
    student.enrolledClasses.push(classToEnroll._id);
    await student.save();

    // Add the student to the class's students array
    classToEnroll.students.push(student._id);
    await classToEnroll.save();

    // Respond with success
    res.status(200).json({
      message: "Student enrolled in class successfully",
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        enrolledClasses: student.enrolledClasses,
      },
      class: {
        _id: classToEnroll._id,
        className: classToEnroll.className,
        students: classToEnroll.students,
        capacity: classToEnroll.capacity,
      },
    });
  } catch (error) {
    console.error("Error enrolling student in class:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove a student from a class
const removeStudentFromClass = async (req, res) => {
  try {
    const { studentEmail, classId } = req.body;

    // Find the student by email
    const student = await Student.findOne({ email: studentEmail });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find the class by ID
    const classToRemoveFrom = await Class.findById(classId);
    if (!classToRemoveFrom) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Remove the student from the class's students array
    classToRemoveFrom.students = classToRemoveFrom.students.filter(
      (id) => id.toString() !== student._id.toString()
    );
    await classToRemoveFrom.save();

    // Remove the class from the student's enrolledClasses array
    student.enrolledClasses = student.enrolledClasses.filter(
      (id) => id.toString() !== classId
    );
    await student.save();

    // Respond with success
    res.status(200).json({
      message: "Student removed from class successfully",
      class: {
        _id: classToRemoveFrom._id,
        className: classToRemoveFrom.className,
        students: classToRemoveFrom.students,
      },
    });
  } catch (error) {
    console.error("Error removing student from class:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Submit a task
const submitTask = async (req, res) => {
  try {
    const { studentEmail, folderId, taskName } = req.body;
    const submissionFileUrl = req.file.path; // Path to the uploaded answer file

    // Find the student by email
    const student = await Student.findOne({ email: studentEmail });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find the folder (assessment) by ID
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Prepare the rubric and total marks
    const rubric = folder.rubric;

    // Debug: Log the rubric to verify its structure
    console.log("Rubric being sent to Python backend:", rubric);

    const totalMarks = folder.totalMarks;
    const keyFileUrl = folder.keyFile;

    // Download the key file from Cloudinary
    const tempKeyFilePath = path.join(__dirname, "../temp", "key_file.pdf");
    const keyFileWriter = fs.createWriteStream(tempKeyFilePath);

    const keyFileResponse = await axios({
      url: keyFileUrl,
      method: "GET",
      responseType: "stream",
    });

    keyFileResponse.data.pipe(keyFileWriter);

    await new Promise((resolve, reject) => {
      keyFileWriter.on("finish", resolve);
      keyFileWriter.on("error", reject);
    });

    // Download the student's answer file from Cloudinary
    const tempAnswerFilePath = path.join(
      __dirname,
      "../temp",
      "answer_file.pdf"
    );
    const answerFileWriter = fs.createWriteStream(tempAnswerFilePath);

    const answerFileResponse = await axios({
      url: submissionFileUrl,
      method: "GET",
      responseType: "stream",
    });

    answerFileResponse.data.pipe(answerFileWriter);

    await new Promise((resolve, reject) => {
      answerFileWriter.on("finish", resolve);
      answerFileWriter.on("error", reject);
    });

    // Prepare the form data for the Python backend
    const formData = new FormData();
    formData.append("answer_file", fs.createReadStream(tempAnswerFilePath)); // Attach the downloaded answer file
    formData.append("key_file", fs.createReadStream(tempKeyFilePath)); // Attach the downloaded key file
    formData.append("rubric", JSON.stringify(rubric)); // Attach the rubric
    formData.append("total_marks", totalMarks); // Attach the total marks for the assessment
    formData.append("student_name", `${student.firstName} ${student.lastName}`);
    formData.append("student_email", student.email);

    // Debug: Log the FormData contents
    console.log("FormData contents:");
    formData._streams.forEach((stream) => {
      console.log(stream.toString());
    });

    // Use FastAPI service for grading
    console.log('Starting grading process...');
    const gradingResult = await fastapiService.gradeAnswer(formData);
    
    if (!gradingResult.success) {
      console.error('Grading failed:', gradingResult.error);
      return res.status(500).json({ 
        message: "Grading failed", 
        error: gradingResult.error,
        details: gradingResult.data
      });
    }

    const { pdf_url, results } = gradingResult.data;

    // Save the grading report and results in the database
    const newTask = new Task({
      taskName,
      folder: folderId,
      student: student._id,
      submissionFile: submissionFileUrl, // Store the Cloudinary URL
      gradingReport: pdf_url, // Store the grading report URL
      gradingResults: results, // Store the grading results
    });

    await newTask.save();

    // Add the task submission to the student's taskSubmissions array
    student.taskSubmissions.push(newTask._id);
    await student.save();

    // Add the task submission to the folder's submissions array
    folder.submissions.push(newTask._id);
    await folder.save();

    // Clean up temporary files
    fs.unlinkSync(tempKeyFilePath);
    fs.unlinkSync(tempAnswerFilePath);

    res.status(200).json({
      message: "Task submitted and graded successfully",
      gradingReportUrl: pdf_url,
      gradingResults: results,
    });
  } catch (error) {
    console.error("Error submitting task:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get classes a student is enrolled in
const getEnrolledClasses = async (req, res) => {
  try {
    const { studentEmail } = req.query;

    // Find the student by email
    const student = await Student.findOne({ email: studentEmail });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Populate the student's enrolled classes and submissions
    const enrolledClasses = await Class.find({
      _id: { $in: student.enrolledClasses },
    }).populate({
      path: "folders",
      populate: {
        path: "submissions",
        match: { student: student._id }, // Match the student's ObjectId
      },
    });

    // Populate the student's task submissions
    const taskSubmissions = await Task.find({ student: student._id }).populate({
      path: "folder",
      select: "name description",
    });

    // Respond with the list of enrolled classes and submissions
    res.status(200).json({
      classes: enrolledClasses,
      submissions: taskSubmissions,
    });
  } catch (error) {
    console.error("Error fetching enrolled classes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addStudent,
  enrollStudentInClass,
  getAllStudents,
  removeStudentFromClass,
  submitTask,
  getEnrolledClasses,
};
