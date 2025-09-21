const OpenEndedAssessment = require("../Models/OpenEndedAssessment");
const Class = require("../Models/Class");

// Fetch Open-Ended Assessments for a Class
const getOpenEndedAssessments = async (req, res) => {
  try {
    const { classId } = req.params;

    // Find all open-ended assessments for the given class
    const assessments = await OpenEndedAssessment.find({ class: classId });

    res.status(200).json({ assessments });
  } catch (error) {
    console.error("Error fetching open-ended assessments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add Open-Ended Assessment
const addOpenEndedAssessment = async (req, res) => {
  try {
    const { name, description, classId, totalMarks, dueDate } = req.body;

    // Ensure class exists
    const existingClass = await Class.findById(classId);
    if (!existingClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Get the uploaded question file
    const questionFile = req.file?.path;
    if (!questionFile) {
      return res.status(400).json({ message: "Question file is required" });
    }

    // Create a new open-ended assessment
    const newAssessment = new OpenEndedAssessment({
      name,
      description,
      questionFile,
      class: classId,
      totalMarks,
      dueDate,
    });

    await newAssessment.save();

    res.status(201).json({
      message: "Open-Ended Assessment added successfully",
      assessment: newAssessment,
    });
  } catch (error) {
    console.error("Error adding open-ended assessment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { addOpenEndedAssessment, getOpenEndedAssessments };
