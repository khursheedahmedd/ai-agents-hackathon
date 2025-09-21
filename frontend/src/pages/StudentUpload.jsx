import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

const StudentUpload = () => {
  const { key_id } = useParams(); // Retrieve the key_id from the URLs
  const [studentName, setStudentName] = useState("");
  const [answerFile, setAnswerFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [responseMessage, setResponseMessage] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null); // State to store the PDF blob

  const handleStudentNameChange = (e) => {
    setStudentName(e.target.value);
    setResponseMessage(null);
  };

  const handleAnswerFileChange = (e) => {
    setAnswerFile(e.target.files[0]);
    setResponseMessage(null);
  };

  const handleUpload = async () => {
    if (!studentName || !answerFile) {
      setResponseMessage("Please enter your name and select your answer file.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("student_name", studentName);
    formData.append("answer_file", answerFile);

    try {
      // Use FastAPI endpoint for answer upload
      const fastapiUrl =
        import.meta.env.VITE_FASTAPI_SERVER_URL ||
        "https://flask-backend.ashyriver-2a697dc0.westus2.azurecontainerapps.io";
      const endpoint = fastapiUrl.includes("8000")
        ? `${fastapiUrl}/api/v1/grading/grade-simple`
        : `${fastapiUrl}/api/upload_answer/${key_id}`;

      console.log("Using endpoint:", endpoint);

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        setPdfBlob(blob);
        setResponseMessage(
          "Grading completed. Your report is ready to download."
        );
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

  const handleDownload = () => {
    if (pdfBlob) {
      const pdfUrl = window.URL.createObjectURL(pdfBlob);

      // Create a link to download the PDF
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.setAttribute(
        "download",
        `Grading_Report_${studentName.replace(" ", "_")}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      // Revoke the object URL after download
      window.URL.revokeObjectURL(pdfUrl);
    }
  };

  const renderFilePreview = (file) => {
    if (!file) return null;

    if (file.type.startsWith("image/")) {
      // Preview for images
      return (
        <img
          src={URL.createObjectURL(file)}
          alt="Preview"
          className="mt-4 w-full max-h-48 object-contain border border-gray-300 rounded-md"
        />
      );
    }

    if (file.type === "application/pdf") {
      // Preview for PDFs
      return (
        <div className="mt-4 flex items-center space-x-2 text-gray-600">
          <i className="fas fa-file-pdf text-red-500"></i>
          <span>{file.name}</span>
        </div>
      );
    }

    if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      // Preview for DOCX files: just display file name
      return (
        <div className="mt-4 flex items-center space-x-2 text-gray-600">
          <i className="fas fa-file-word text-blue-500"></i>
          <span>{file.name}</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-white text-black py-32 px-6 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="max-w-3xl mx-auto bg-green-50 p-8 sm:p-10 shadow-lg rounded-lg mt-16 py-8"
      >
        <h2 className="text-3xl font-urbanist sm:text-4xl font-semibold text-center text-black mb-6">
          Upload Your Answer
        </h2>

        <p className="text-lg font-urbanist text-gray-600 text-center mb-8">
          Enter your details and upload your answer to receive a grading report.
        </p>

        {/* Student Name Input */}
        <div className="mb-6">
          <label
            htmlFor="student-name"
            className="block text-sm font-medium mb-2 text-gray-700"
          >
            Your Name
          </label>
          <input
            type="text"
            id="student-name"
            value={studentName}
            onChange={handleStudentNameChange}
            className="w-full text-gray-800 p-3 bg-gray-200 border border-gray-300 rounded-md focus:ring focus:ring-green-500 focus:outline-none"
          />
        </div>

        {/* Upload Section */}
        {!answerFile && (
          <div className="text-center mb-6">
            <div
              onClick={() =>
                document.getElementById("answer-file-upload").click()
              }
              className={`flex flex-col items-center justify-center w-full h-40 border rounded-lg shadow-md cursor-pointer transition ${
                answerFile
                  ? "bg-green-100 border-green-400"
                  : "bg-gray-100 border-green-300"
              } hover:bg-green-100`}
            >
              <div className={`text-5xl mb-2 text-green-500`}>+</div>
              <div className="text-base font-medium text-gray-700">
                {answerFile
                  ? "File Ready for Upload"
                  : "Choose Your Answer File"}
              </div>
              <input
                type="file"
                id="answer-file-upload"
                accept="image/*,.pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleAnswerFileChange}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Preview Section */}
        {answerFile && (
          <div className="mt-6 bg-gray-100 p-4 rounded-md shadow-sm">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              File Preview:
            </h3>
            {renderFilePreview(answerFile)}
          </div>
        )}

        {/* Upload Button */}
        {answerFile && (
          <button
            onClick={handleUpload}
            className="w-full py-3 text-lg font-semibold text-white bg-green-500 rounded-md hover:bg-green-600 focus:ring focus:ring-green-500"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Submit Answer"}
          </button>
        )}

        {/* Response Message */}
        {responseMessage && (
          <div
            className={`mt-6 p-4 rounded-md ${
              responseMessage.startsWith("Grading completed")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            <p>{responseMessage}</p>
          </div>
        )}

        {/* Download Button */}
        {pdfBlob && (
          <button
            onClick={handleDownload}
            className="mt-4 w-full py-3 text-lg font-semibold text-white bg-green-500 rounded-md hover:bg-green-600 focus:ring focus:ring-green-500"
          >
            Download Grading Report
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default StudentUpload;
