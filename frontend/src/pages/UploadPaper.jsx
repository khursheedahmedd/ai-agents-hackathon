import React, { useState } from "react";
import {
  FaUpload,
  FaFileAlt,
  FaUser,
  FaCogs,
  FaBrain,
  FaDownload,
  FaCheckCircle,
  FaBalanceScale,
} from "react-icons/fa";
import { motion } from "framer-motion";

const UploadPaper = () => {
  const [keyFile, setKeyFile] = useState(null);
  const [answerFile, setAnswerFile] = useState(null);
  const [criteria, setCriteria] = useState("");
  const [studentName, setStudentName] = useState("");
  const [examTitle, setExamTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [responseMessage, setResponseMessage] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  const handleFileChange = (setter) => (e) => {
    setter(e.target.files[0]);
    setResponseMessage(null);
    setPdfUrl(null);
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setResponseMessage(null);
    setPdfUrl(null);
  };

  const handleUpload = async () => {
    if (!keyFile || !answerFile || !criteria || !studentName || !examTitle) {
      setResponseMessage("Please fill in all fields and select the files.");
      return;
    }

    setUploading(true);
    setResponseMessage(null);
    setPdfUrl(null);

    const formData = new FormData();
    formData.append("key_file", keyFile);
    formData.append("answer_file", answerFile);
    formData.append("criteria", criteria);
    formData.append("student_name", studentName);
    formData.append("exam_title", examTitle);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_FLASK_SERVER_URL}/api/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResponseMessage("Grading completed successfully.");
        setPdfUrl(data.pdf_url);
      } else {
        const errorData = await response.json();
        setResponseMessage(`Error: ${errorData.message}`);
      }
    } catch (error) {
      setResponseMessage("Failed to connect to the server.");
    } finally {
      setUploading(false);
    }
  };

  const renderFilePreview = (file) => {
    if (!file) return null;

    const fileUrl = URL.createObjectURL(file);
    const isPDF = file.type === "application/pdf";
    const isImage = file.type.startsWith("image");

    if (isPDF) {
      return (
        <div className="mt-2">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500"
          >
            View {file.name}
          </a>
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="mt-2">
          <img
            src={fileUrl}
            alt="Preview"
            className="w-72 h-auto rounded-lg shadow-lg"
          />
        </div>
      );
    }

    return (
      <div className="mt-2">
        <p className="text-gray-500">No preview available for this file type</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-32 px-6">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto bg-green-50 p-8 shadow-lg rounded-lg"
      >
        <h2 className="text-4xl font-urbanist font-semibold text-center text-gray-800 mb-6">
          Upload Exam Key and Student's Answer
        </h2>

        <p className="text-center font-urbanist text-gray-600 mb-8">
          Streamline grading with AI-powered analysis.
        </p>

        {/* Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label
              htmlFor="student-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Student Name
            </label>
            <input
              type="text"
              id="student-name"
              value={studentName}
              onChange={handleInputChange(setStudentName)}
              placeholder="Enter student's name"
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-green-300"
            />
          </div>
          <div>
            <label
              htmlFor="exam-title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Exam Title
            </label>
            <input
              type="text"
              id="exam-title"
              value={examTitle}
              onChange={handleInputChange(setExamTitle)}
              placeholder="Enter exam title"
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-green-300"
            />
          </div>
        </div>

        {/* File Uploads */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col items-center w-full">
            {!keyFile && (
              <FileUpload
                label="Upload Exam Key"
                file={keyFile}
                onChange={handleFileChange(setKeyFile)}
              />
            )}
            {renderFilePreview(keyFile)}
          </div>

          <div className="flex flex-col items-center w-full">
            {!answerFile && (
              <FileUpload
                label="Upload Answer File"
                file={answerFile}
                onChange={handleFileChange(setAnswerFile)}
              />
            )}
            {renderFilePreview(answerFile)}
          </div>
        </div>

        {/* Grading Criteria */}
        <div className="mb-6">
          <label
            htmlFor="grading-criteria"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Grading Criteria
          </label>
          <select
            id="grading-criteria"
            value={criteria}
            onChange={handleInputChange(setCriteria)}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-green-300"
          >
            <option value="">Select Criteria</option>
            <option value="strict">Strict</option>
            <option value="moderate">Moderate</option>
            <option value="relaxed">Relaxed</option>
          </select>
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          className={`w-full py-3 text-lg font-bold text-white bg-green-500 rounded-3xl hover:bg-green-600 focus:ring-4 focus:ring-green-400 ${
            uploading ? "cursor-not-allowed opacity-70" : ""
          }`}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload & Analyze"}
        </button>

        {/* Response Message */}
        {responseMessage && (
          <div
            className={`mt-4 p-4 rounded-lg text-center ${
              responseMessage.startsWith("Grading completed")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {responseMessage}
          </div>
        )}

        {/* PDF Download Link */}
        {pdfUrl && (
          <div className="mt-6 text-center">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Download Grading Report
            </a>
          </div>
        )}

        {/* Page Description */}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-8 lg:px-16 py-16 bg-gray-50"
      >
        {/* Steps Section */}
        <div
          id="how-it-works"
          className="w-full flex flex-col items-center text-center"
        >
          {/* New Integrated "How It Works" Title */}
          <h3 className="text-4xl sm:text-5xl lg:text-5xl font-urbanist text-green-600 leading-tight mb-6 tracking-tight">
            How It Works
          </h3>

          <p className="text-base sm:text-lg text-gray-700 max-w-2xl font-medium mb-12">
            Fast. Accurate. AI-powered grading in seconds.
          </p>

          <div className="bg-white p-4 sm:p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-3xl lg:max-w-4xl flex flex-col gap-6">
            {[
              {
                step: "01",
                title: "Start",
                description: "Begin the process by initiating the system.",
              },
              {
                step: "02",
                title: "Upload Exam Key",
                description:
                  "Upload the exam key containing the correct answers.",
              },
              {
                step: "03",
                title: "Submit Answer File",
                description: "Submit the student's response file for analysis.",
              },
              {
                step: "04",
                title: "Enter Student Details",
                description:
                  "Provide the student's name, exam title, and grading criteria.",
              },
              {
                step: "05",
                title: "Select Grading Criteria",
                description:
                  "Select the desired grading strictness (strict, moderate, relaxed).",
              },
              {
                step: "06",
                title: "AI Analysis",
                description:
                  "The AI system evaluates the response based on the provided key and criteria.",
              },
              {
                step: "07",
                title: "Download Report",
                description:
                  "Download the comprehensive report as a PDF for easy sharing.",
              },
              {
                step: "08",
                title: "End",
                description: "Process complete, ready for review.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex items-center p-4 sm:p-6 rounded-2xl border border-gray-200 bg-white shadow-md hover:shadow-2xl hover:bg-green-50 transition-all duration-300 w-full text-left"
                whileHover={{ scale: 1.05, borderColor: "#16A34A", y: -2 }}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Step Number */}
                <div className="flex items-center justify-center w-11 h-9 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-full bg-green-500 text-white text-base sm:text-lg md:text-xl lg:text-2xl font-urbanist shadow-md mr-4 sm:mr-6">
                  {item.step}
                </div>

                {/* Step Content */}
                <div className="flex flex-col">
                  <h4 className="text-lg sm:text-xl md:text-2xl font-urbanist text-gray-900">
                    {item.title}
                  </h4>
                  <p className="text-gray-600 text-sm sm:text-md md:text-lg">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Closing Message */}
          <p className="mt-10 text-base sm:text-lg text-gray-800 font-urbanist">
            AI-Powered Grading. Smarter, Faster, Easier.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const FileUpload = ({ label, file, onChange }) => (
  <div
    onClick={() => document.getElementById(`${label}-upload`).click()}
    className={`flex flex-col items-center justify-center h-48 w-full border border-green-300 rounded-lg shadow-lg cursor-pointer transition-all ${
      file ? "bg-green-100" : "bg-white"
    } hover:bg-green-100 hover:text-black`}
  >
    <div className="text-5xl text-green-500 mb-2">+</div>
    <div>{file ? `${label} Uploaded` : label}</div>
    <input
      type="file"
      id={`${label}-upload`}
      onChange={onChange}
      className="hidden"
    />
  </div>
);

export default UploadPaper;
