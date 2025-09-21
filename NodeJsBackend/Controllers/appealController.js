const Appeal = require("../Models/Appeal");
const Folder = require("../Models/Folder");
const Task = require("../Models/Task");
const axios = require("axios");
const FormData = require("form-data"); // Import the form-data package
const Student = require("../Models/Student");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const submitAppeal = async (req, res) => {
  console.log("Submitting appeal");

  try {
    const { gradingReport, studentEmail, description } = req.body;

    console.log("Request body:", req.body);

    if (!gradingReport || !studentEmail || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find the task using the grading report URL
    const task = await Task.findOne({ gradingReport });
    if (!task) {
      return res
        .status(404)
        .json({ message: "Task not found for the provided grading report" });
    }

    // Extract the folder (assessment) ID from the task
    const assessmentId = task.folder;

    // Find the folder (assessment) by ID
    const folder = await Folder.findById(assessmentId);
    if (!folder) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Create a new appeal
    const newAppeal = new Appeal({
      gradingReport,
      studentEmail,
      assessment: assessmentId,
      keyFile: folder.keyFile, // Get the key file URL from the folder
      description,
    });

    // Save the appeal to the database
    await newAppeal.save();

    res
      .status(201)
      .json({ message: "Appeal submitted successfully", appeal: newAppeal });
  } catch (error) {
    console.error("Error submitting appeal:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAppeals = async (req, res) => {
  try {
    // Fetch all appeals and populate the assessment details
    const appeals = await Appeal.find().populate(
      "assessment",
      "name description"
    );

    res.status(200).json({ appeals });
  } catch (error) {
    console.error("Error fetching appeals:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const recheckAppeal = async (req, res) => {
  try {
    const { studentEmail, keyFile, assessmentId, appealId } = req.body;

    console.log("Request body:", req.body);

    // Fetch the task submission for the assessment using assessmentId
    const task = await Task.findOne({ folder: assessmentId }).exec();

    console.log("Task:", task);

    // Check if the task exists
    if (!task) {
      return res
        .status(404)
        .json({ message: "Task submission not found for the assessment." });
    }

    // Fetch the student document using the student ObjectId from the task
    const student = await Student.findById(task.student).exec();

    console.log("Student:", student);

    // Check if the student exists
    if (!student) {
      return res
        .status(404)
        .json({ message: "Student not found for the task submission." });
    }

    // Fetch the rubric and total marks from the Folder schema
    const folder = await Folder.findById(assessmentId).exec();
    if (!folder) {
      return res.status(404).json({ message: "Assessment not found." });
    }

    const rubric = folder.rubric;
    const totalMarks = folder.totalMarks;

    // Download the key file from the provided URL
    const tempKeyFilePath = path.join(__dirname, "../temp", "key_file.pdf");
    const keyFileWriter = fs.createWriteStream(tempKeyFilePath);

    const keyFileResponse = await axios({
      url: keyFile,
      method: "GET",
      responseType: "stream",
    });

    keyFileResponse.data.pipe(keyFileWriter);

    await new Promise((resolve, reject) => {
      keyFileWriter.on("finish", resolve);
      keyFileWriter.on("error", reject);
    });

    // Download the student's answer file from the provided URL
    const tempAnswerFilePath = path.join(
      __dirname,
      "../temp",
      "answer_file.pdf"
    );
    const answerFileWriter = fs.createWriteStream(tempAnswerFilePath);

    const answerFileResponse = await axios({
      url: task.submissionFile,
      method: "GET",
      responseType: "stream",
    });

    answerFileResponse.data.pipe(answerFileWriter);

    await new Promise((resolve, reject) => {
      answerFileWriter.on("finish", resolve);
      answerFileWriter.on("error", reject);
    });

    // Prepare data for the Python backend
    const formData = new FormData();
    formData.append("answer_file", fs.createReadStream(tempAnswerFilePath)); // Attach the downloaded answer file
    formData.append("key_file", fs.createReadStream(tempKeyFilePath)); // Attach the downloaded key file
    formData.append("rubric", JSON.stringify(rubric)); // Attach the rubric
    formData.append("total_marks", totalMarks); // Attach the total marks
    formData.append("student_name", `${student.firstName} ${student.lastName}`); // Attach the student's name

    // Send the data to the Python backend
    const pythonResponse = await axios.post(
      `${process.env.FLASK_SERVER_URL}/api/grade_answer`,
      formData,
      {
        headers: formData.getHeaders(), // Use the correct headers from form-data
      }
    );

    if (pythonResponse.status !== 200) {
      return res
        .status(500)
        .json({ message: "Failed to regrade the answers." });
    }

    const newGradingReportUrl = pythonResponse.data.pdf_url;

    // Update the grading report URL in the database
    task.gradingReport = newGradingReportUrl;
    await task.save();

    // Clean up temporary files
    fs.unlinkSync(tempKeyFilePath);
    fs.unlinkSync(tempAnswerFilePath);

    res.status(200).json({
      message: "Recheck completed successfully.",
      newGradingReportUrl,
    });
  } catch (error) {
    console.error("Error during recheck:", error);
    res.status(500).json({ message: "Server error during recheck." });
  }
};

module.exports = {
  submitAppeal,
  getAppeals,
  recheckAppeal,
};
