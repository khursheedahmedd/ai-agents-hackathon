const Class = require("../Models/Class");
const Teacher = require("../Models/Teacher");
const Student = require("../Models/Student");

// Add a new class
const addClass = async (req, res) => {
  try {
    const { classId, className, capacity, teacherEmail } = req.body;
    console.log("req body ", req.body);

    // Check if the class already exists
    const existingClass = await Class.findOne({ classId });
    if (existingClass) {
      return res.status(400).json({ message: "Class already exists" });
    }

    // Check if the teacher exists
    const teacher = await Teacher.findOne({ email: teacherEmail });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    console.log("teacher", teacher);

    // Create a new class
    const newClass = new Class({
      classId,
      className,
      capacity,
      teacherId: teacher._id,
    });

    // Save the class to the database
    await newClass.save();

    // Add the class to the teacher's classes array
    teacher.classes.push(newClass._id);
    await teacher.save();

    // Respond with success message
    res.status(201).json({
      message: "Class is successfully added ...",
    });
  } catch (error) {
    console.error("Error adding class:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getClassFolders = async (req, res) => {
  try {
    const { classId } = req.params;

    // Find the class by ID and populate folders and their submissions
    const classDetails = await Class.findById(classId).populate({
      path: "folders",
      populate: {
        path: "submissions", // Populate submissions in each folder
        populate: {
          path: "student", // Populate student details in each submission
          select: "email", // Only include the email field
        },
      },
    });

    if (!classDetails) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Respond with the class folders and their submissions
    res.status(200).json({
      className: classDetails.className,
      folders: classDetails.folders,
    });
  } catch (error) {
    console.error("Error fetching class folders:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;

    // Find the class by ID and populate the students
    const classDetails = await Class.findById(classId).populate("students");

    if (!classDetails) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Respond with the list of students
    res.status(200).json({
      className: classDetails.className,
      students: classDetails.students,
    });
  } catch (error) {
    console.error("Error fetching class students:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getClassDetails = async (req, res) => {
  try {
    const { classId } = req.params;
    const { studentEmail } = req.query;

    // Find the class by ID and populate teacher, students, and folders
    const classDetails = await Class.findById(classId)
      .populate("teacherId", "firstName lastName email")
      .populate("students", "firstName lastName email")
      .populate("folders");

    if (!classDetails) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Find the student by email and populate taskSubmissions
    const student = await Student.findOne({ email: studentEmail }).populate({
      path: "taskSubmissions",
      populate: {
        path: "folder",
        select: "name description",
      },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Separate active and previous submissions for the student
    const activeSubmissions = classDetails.folders.map((folder) => {
      const submission = student.taskSubmissions.find(
        (task) =>
          task.folder && task.folder._id.toString() === folder._id.toString()
      );
      return {
        ...folder.toObject(),
        submitted: !!submission,
        submissionDetails: submission
          ? {
              submissionFile: submission.submissionFile,
              gradingReport: submission.gradingReport,
              gradingResults: submission.gradingResults,
            }
          : null,
      };
    });

    const previousSubmissions = student.taskSubmissions.filter(
      (task) =>
        task.folder &&
        classDetails.folders.some(
          (folder) => folder._id.toString() === task.folder._id.toString()
        )
    );

    console.log("classDetails", classDetails);
    console.log("activeSubmissions", activeSubmissions);
    console.log("previousSubmissions", previousSubmissions);

    // Respond with class details
    res.status(200).json({
      class: {
        _id: classDetails._id,
        className: classDetails.className,
        teacherName: `${classDetails.teacherId.firstName} ${classDetails.teacherId.lastName}`,
        capacity: classDetails.capacity,
        students: classDetails.students,
      },
      activeSubmissions,
      previousSubmissions: previousSubmissions.map((task) => ({
        taskName: task.taskName,
        submissionFile: task.submissionFile,
        gradingReport: task.gradingReport,
        gradingResults: task.gradingResults,
        submittedAt: task.submittedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching class details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addClass,
  getClassFolders,
  getClassStudents,
  getClassDetails,
};
