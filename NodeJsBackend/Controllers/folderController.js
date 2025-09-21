const Folder = require("../Models/Folder");
const Class = require("../Models/Class");

// Add Folder with File Uploads to Cloudinary
const addFolder = async (req, res) => {
  try {
    console.log("✅ Request Headers:", req.headers);
    console.log("✅ Request Body:", req.body);

    if (!req.file && (!req.files || Object.keys(req.files).length === 0)) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const { name, description, classId, dueDate, rubric } = req.body;

    // Ensure class exists
    const existingClass = await Class.findById(classId);
    if (!existingClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Parse the rubric JSON
    let parsedRubric;
    try {
      parsedRubric = JSON.parse(rubric);
    } catch (error) {
      return res.status(400).json({ message: "Invalid rubric format" });
    }

    // Format questions with custom rubrics
    const formattedQuestions = parsedRubric.questions.map((question) => {
      // Create a Map from the custom rubric fields
      const customRubric = new Map();
      Object.entries(question.rubric).forEach(([key, value]) => {
        customRubric.set(key, value);
      });

      return {
        questionNumber: question.questionNumber,
        questionText: question.questionText,
        totalMarks: question.totalMarks,
        rubric: customRubric,
        openEnded: question.openEnded || false,
      };
    });

    // Calculate total marks
    const totalMarks = formattedQuestions.reduce(
      (sum, question) => sum + question.totalMarks,
      0
    );

    const questionFileUrl = req.files.questionFile?.[0]?.path || null;
    const keyFileUrl = req.files.keyFile?.[0]?.path || null;

    const newFolder = new Folder({
      name,
      description,
      questionFile: questionFileUrl,
      keyFile: keyFileUrl,
      class: classId,
      dueDate,
      rubric: { questions: formattedQuestions },
      totalMarks,
      createdAt: new Date(),
    });

    await newFolder.save();

    // Update class with new folder
    const classToUpdate = await Class.findById(classId);
    if (classToUpdate) {
      classToUpdate.folders.push(newFolder._id);
      await classToUpdate.save();
    }

    res.status(201).json({ 
      message: "Folder added successfully", 
      folder: newFolder 
    });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete an assessment (folder)
const deleteFolder = async (req, res) => {
  try {
    const { folderId } = req.params;

    // Find and delete the folder
    const folder = await Folder.findByIdAndDelete(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Remove the folder from the class
    await Class.findByIdAndUpdate(folder.class, {
      $pull: { folders: folderId },
    });

    res.status(200).json({ message: "Assessment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addFolder,
  deleteFolder,
};
