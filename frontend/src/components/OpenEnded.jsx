import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OpenEnded = ({ classId, onAssessmentAdded }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [questionFile, setQuestionFile] = useState(null);
  const [totalMarks, setTotalMarks] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  const formData = new FormData();
  formData.append("name", name);
  formData.append("description", description);
  formData.append("questionFile", questionFile);
  formData.append("classId", classId);
  formData.append("totalMarks", totalMarks);
  formData.append("dueDate", dueDate);

  try {
    const response = await axios.post(
      "https://node-app.ashyriver-2a697dc0.westus2.azurecontainerapps.io/api/open-ended/add-open-ended",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    toast.success("Open-Ended Assessment added successfully!");
    onAssessmentAdded(response.data.assessment); // Notify parent to refresh the list
    setName("");
    setDescription("");
    setQuestionFile(null);
    setTotalMarks("");
    setDueDate("");
  } catch (error) {
    console.error("Error adding open-ended assessment:", error);
    toast.error("Failed to add assessment. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl p-6 border border-gray-200 shadow-md"
    >
      <ToastContainer />
      <h2 className="text-xl font-bold mb-4">Add Open-Ended Assessment</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Question File:</label>
          <input
            type="file"
            accept="image/*,.pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => setQuestionFile(e.target.files[0])}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Total Marks:</label>
          <input
            type="number"
            value={totalMarks}
            onChange={(e) => setTotalMarks(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Due Date:</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Saving..." : "Save Assessment"}
        </button>
      </form>
    </motion.div>
  );
};

export default OpenEnded;
