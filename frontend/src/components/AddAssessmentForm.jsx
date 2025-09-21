import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify"; // Import Toastify
import {
  FiX,
  FiFileText,
  FiUpload,
  FiCalendar,
  FiEdit3,
  FiCheck,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import "react-toastify/dist/ReactToastify.css"; // Import Toastify styles

const AddAssessmentForm = ({ classId, onAssessmentAdded, onClose }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [questionFile, setQuestionFile] = useState(null);
  const [keyFile, setKeyFile] = useState(null);
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qaPairs, setQaPairs] = useState([]);
  const [showRubricForm, setShowRubricForm] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const handleExtractRubric = async () => {
    if (!keyFile) {
      toast.error("Please upload a key file first."); // Show error toast
      return;
    }

    setLoading(true);
    setLoadingMessage("Extracting Rubric...");
    setError("");

    const formData = new FormData();
    formData.append("key_file", keyFile);

    try {
      // Use FastAPI endpoint for rubric extraction
      const fastapiUrl =
        import.meta.env.VITE_FASTAPI_SERVER_URL ||
        import.meta.env.VITE_FLASK_SERVER_URL;
      const endpoint = fastapiUrl.includes("8000")
        ? `${fastapiUrl}/api/v1/grading/upload-key`
        : `${fastapiUrl}/api/upload_key`;

      console.log("Extracting rubric from:", endpoint);

      const response = await axios.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { qa_pairs } = response.data;
      // Initialize each extracted QA with default helper fields for the UI
      const initializedPairs = qa_pairs.map((qa) => ({
        // Handle both FastAPI and Flask response formats
        Question: qa.Question || qa.question || "",
        Answer: qa.Answer || qa.answer || "",
        // Marks default
        Marks: qa.Marks || qa.marks || 0,
        // Whether the question is open ended (default false)
        OpenEnded: qa.OpenEnded || qa.openEnded || false,
        // User-friendly rubric format
        RubricCriteria: [
          { name: "Correctness of Concept", percentage: 70 },
          { name: "Similarity with Key", percentage: 30 },
        ],
      }));
      setQaPairs(initializedPairs);
      console.log(response.data);
      setShowRubricForm(true);
      toast.success("Rubric extracted successfully!"); // Show success toast
    } catch (error) {
      console.error("Error extracting rubric:", error);
      setError("Failed to extract rubric. Please try again.");
      toast.error("Failed to extract rubric. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  // Helper function to convert rubric criteria to JSON format for API
  const convertRubricToJSON = (rubricCriteria) => {
    const rubric = {};
    rubricCriteria.forEach((criteria) => {
      rubric[criteria.name] = `${criteria.percentage}%`;
    });
    return rubric;
  };

  // Helper function to validate rubric percentages
  const validateRubricPercentages = (rubricCriteria) => {
    const total = rubricCriteria.reduce(
      (sum, criteria) => sum + criteria.percentage,
      0
    );
    return total === 100;
  };

  // Helper function to add new rubric criteria
  const addRubricCriteria = (questionIndex) => {
    const updatedQaPairs = [...qaPairs];
    updatedQaPairs[questionIndex].RubricCriteria.push({
      name: "New Criteria",
      percentage: 0,
    });
    setQaPairs(updatedQaPairs);
  };

  // Helper function to remove rubric criteria
  const removeRubricCriteria = (questionIndex, criteriaIndex) => {
    const updatedQaPairs = [...qaPairs];
    updatedQaPairs[questionIndex].RubricCriteria.splice(criteriaIndex, 1);
    setQaPairs(updatedQaPairs);
  };

  // Helper function to update rubric criteria name
  const updateRubricCriteriaName = (questionIndex, criteriaIndex, newName) => {
    const updatedQaPairs = [...qaPairs];
    updatedQaPairs[questionIndex].RubricCriteria[criteriaIndex].name = newName;
    setQaPairs(updatedQaPairs);
  };

  // Helper function to update rubric criteria percentage
  const updateRubricCriteriaPercentage = (
    questionIndex,
    criteriaIndex,
    newPercentage
  ) => {
    const updatedQaPairs = [...qaPairs];
    updatedQaPairs[questionIndex].RubricCriteria[criteriaIndex].percentage =
      parseInt(newPercentage) || 0;
    setQaPairs(updatedQaPairs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoadingMessage("Saving the Assessment...");
    setError("");

    // Validate all rubric percentages
    const invalidRubrics = qaPairs.filter(
      (qa) => !validateRubricPercentages(qa.RubricCriteria)
    );
    if (invalidRubrics.length > 0) {
      setError(
        "All rubric percentages must add up to 100%. Please check your rubric criteria."
      );
      setLoading(false);
      setLoadingMessage("");
      return;
    }

    // Build questions array with teacher‑defined custom rubric
    const formattedQuestions = qaPairs.map((qa, index) => {
      const rubricJSON = convertRubricToJSON(qa.RubricCriteria);
      return {
        questionNumber: index + 1,
        questionText: qa.Question,
        totalMarks: qa.Marks,
        rubric: rubricJSON, // store as object – backend will translate to Map
        openEnded: qa.OpenEnded,
      };
    });

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("questionFile", questionFile);
    formData.append("keyFile", keyFile);
    formData.append("classId", classId);
    formData.append("dueDate", dueDate);
    formData.append(
      "rubric",
      JSON.stringify({ questions: formattedQuestions })
    );

    console.log(import.meta.env.VITE_NODE_SERVER_URL);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_NODE_SERVER_URL}/api/folders/add-folder`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Assessment added successfully!"); // Show success toast
      onAssessmentAdded(response.data.folder); // Notify parent to refresh the list
      // Reset form
      setName("");
      setDescription("");
      setQuestionFile(null);
      setKeyFile(null);
      setDueDate("");
      setQaPairs([]);
      setShowRubricForm(false);
      // Close modal
      onClose();
    } catch (error) {
      console.error("Error adding assessment:", error);
      toast.error("Failed to add assessment. Please try again.");
      setError("Failed to add assessment. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const handleCancel = () => {
    // Reset form
    setName("");
    setDescription("");
    setQuestionFile(null);
    setKeyFile(null);
    setDueDate("");
    setQaPairs([]);
    setShowRubricForm(false);
    setError("");
    // Close modal
    onClose();
  };

  return (
    <>
      {/* Loading Overlay - Outside modal to prevent z-index issues */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-[60]">
          <div className="bg-white p-8 rounded-2xl flex flex-col items-center space-y-4 shadow-2xl text-center max-w-sm">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full"
            />
            <p className="text-lg font-semibold text-gray-700">
              {loadingMessage}
            </p>
          </div>
        </div>
      )}

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleCancel}
        >
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white">
                    <FiFileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {showRubricForm
                        ? "Set Assessment Rubric"
                        : "Create New Assessment"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {showRubricForm
                        ? "Configure grading criteria for each question"
                        : "Upload files and set assessment details"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <FiX className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {!showRubricForm ? (
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="space-y-6"
                >
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assessment Name
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <FiFileText className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          placeholder="Enter assessment name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Due Date
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <FiCalendar className="w-5 h-5" />
                        </div>
                        <input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      rows={3}
                      placeholder="Enter assessment description (optional)"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question File
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <FiUpload className="w-5 h-5" />
                        </div>
                        <input
                          type="file"
                          accept="image/*,.pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={(e) => setQuestionFile(e.target.files[0])}
                          className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Answer Key File
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <FiUpload className="w-5 h-5" />
                        </div>
                        <input
                          type="file"
                          accept="image/*,.pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={(e) => setKeyFile(e.target.files[0])}
                          className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleExtractRubric}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <FiEdit3 className="w-5 h-5" />
                      Extract Rubric
                    </motion.button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <FiCheck className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-800">
                        Rubric Configuration
                      </h3>
                    </div>
                    <p className="text-sm text-blue-700">
                      Review and customize the grading criteria for each
                      question. You can adjust marks and modify the rubric as
                      needed.
                    </p>
                  </div>

                  {qaPairs.map((qa, index) => {
                    const totalPercentage = qa.RubricCriteria.reduce(
                      (sum, criteria) => sum + criteria.percentage,
                      0
                    );
                    const isValidPercentage = totalPercentage === 100;

                    return (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                      >
                        <h4 className="font-semibold text-gray-800 mb-4">
                          Question {index + 1}: {qa.Question || "N/A"}
                        </h4>
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Total Marks
                            </label>
                            <input
                              type="number"
                              value={qa.Marks}
                              onChange={(e) => {
                                const updatedQaPairs = [...qaPairs];
                                updatedQaPairs[index].Marks = parseInt(
                                  e.target.value,
                                  10
                                );
                                setQaPairs(updatedQaPairs);
                              }}
                              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                              required
                            />
                          </div>
                          <div className="flex items-center">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <input
                                type="checkbox"
                                checked={qa.OpenEnded}
                                onChange={(e) => {
                                  const updatedQaPairs = [...qaPairs];
                                  updatedQaPairs[index].OpenEnded =
                                    e.target.checked;
                                  setQaPairs(updatedQaPairs);
                                }}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              Open-Ended Question
                            </label>
                          </div>
                        </div>

                        {/* Rubric Criteria Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-gray-800">
                              Grading Criteria
                            </h5>
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => addRubricCriteria(index)}
                              className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm"
                            >
                              <FiPlus className="w-4 h-4" />
                              Add Criteria
                            </motion.button>
                          </div>

                          {qa.RubricCriteria.map((criteria, criteriaIndex) => (
                            <div
                              key={criteriaIndex}
                              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                            >
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={criteria.name}
                                  onChange={(e) =>
                                    updateRubricCriteriaName(
                                      index,
                                      criteriaIndex,
                                      e.target.value
                                    )
                                  }
                                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
                                  placeholder="Criteria name (e.g., Spell Checking)"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={criteria.percentage}
                                  onChange={(e) =>
                                    updateRubricCriteriaPercentage(
                                      index,
                                      criteriaIndex,
                                      e.target.value
                                    )
                                  }
                                  className="w-20 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm text-center"
                                />
                                <span className="text-sm text-gray-500">%</span>
                              </div>
                              {qa.RubricCriteria.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeRubricCriteria(index, criteriaIndex)
                                  }
                                  className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}

                          {/* Percentage Validation */}
                          <div
                            className={`p-3 rounded-lg border ${
                              isValidPercentage
                                ? "bg-green-50 border-green-200"
                                : "bg-red-50 border-red-200"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-sm font-medium ${
                                  isValidPercentage
                                    ? "text-green-800"
                                    : "text-red-800"
                                }`}
                              >
                                Total: {totalPercentage}%
                              </span>
                              {!isValidPercentage && (
                                <span className="text-xs text-red-600">
                                  Must equal 100%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </div>
                      ) : (
                        <>
                          <FiCheck className="w-5 h-5" />
                          Create Assessment
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default AddAssessmentForm;
