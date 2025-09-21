import React, { useState } from "react";
import { motion } from "framer-motion";

const TeacherUpload = () => {
  const [keyFile, setKeyFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uniqueLink, setUniqueLink] = useState(null);
  const [responseMessage, setResponseMessage] = useState(null);

  const handleKeyFileChange = (e) => {
    setKeyFile(e.target.files[0]);
    setResponseMessage(null);
    setUniqueLink(null);
  };

  const handleUpload = async () => {
    if (!keyFile) {
      setResponseMessage("Please select an answer key file to upload.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("key_file", keyFile);

    try {
      console.log("extracting rubric");
      // Use FastAPI endpoint for rubric extraction
      const fastapiUrl =
        import.meta.env.VITE_FASTAPI_SERVER_URL ||
        "https://flask-backend.ashyriver-2a697dc0.westus2.azurecontainerapps.io";
      const endpoint = fastapiUrl.includes("8000")
        ? `${fastapiUrl}/api/v1/grading/upload-key`
        : `${fastapiUrl}/api/upload_key`;

      console.log("Using endpoint:", endpoint);

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResponseMessage("Answer key uploaded successfully.");
        setUniqueLink(data.unique_link);
      } else {
        const errorData = await response.json();
        setResponseMessage(`Error: ${errorData.message}`);
      }
    } catch (error) {
      setResponseMessage(
        "Failed to connect to the server. Please try again later."
      );
    } finally {
      setUploading(false);
    }
  };

  const renderFilePreview = (file) => {
    if (!file) return null;

    if (file.type.startsWith("image/")) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt="Preview"
          className="mt-4 w-full max-h-48 object-contain border border-gray-300 rounded-md shadow-sm"
        />
      );
    }

    if (file.type === "application/pdf") {
      return (
        <div className="mt-4 flex items-center space-x-2 text-gray-600">
          <i className="fas fa-file-pdf text-red-500 text-xl"></i>
          <span>{file.name}</span>
        </div>
      );
    }

    if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return (
        <div className="mt-4 flex items-center space-x-2 text-gray-600">
          <i className="fas fa-file-word text-blue-500 text-xl"></i>
          <span>{file.name}</span>
        </div>
      );
    }

    return (
      <div className="mt-4 flex items-center space-x-2 text-gray-600">
        <i className="fas fa-file text-blue-500 text-xl"></i>
        <span>{file.name}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black py-32 px-6 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto bg-green-50 p-8 sm:p-10 shadow-lg rounded-lg"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-6">
          Upload Answer Key
        </h2>

        <p className="text-lg text-gray-600 text-center mb-8">
          Upload the answer key file to generate a unique link for your
          students.
        </p>

        {!keyFile && (
          <div className="text-center">
            <div
              onClick={() => document.getElementById("key-file-upload").click()}
              className={`flex flex-col items-center justify-center w-full h-40 border rounded-lg shadow-md cursor-pointer transition ${
                keyFile
                  ? "bg-green-100 border-green-400"
                  : "bg-gray-100 border-green-300"
              } hover:bg-green-100`}
            >
              <div className="text-5xl mb-2 text-green-500">+</div>
              <div className="text-base font-medium text-gray-700">
                Upload Answer Key
              </div>
              <input
                type="file"
                id="key-file-upload"
                accept="image/*,.pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleKeyFileChange}
                className="hidden"
              />
            </div>
          </div>
        )}

        {keyFile && (
          <div className="mt-6 bg-gray-100 p-4 rounded-md shadow-sm">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              File Preview:
            </h3>
            {renderFilePreview(keyFile)}
          </div>
        )}

        <button
          onClick={handleUpload}
          className="w-full py-3 mt-6 text-lg rounded-3xl font-semibold text-white bg-green-500  hover:bg-green-600 focus:ring focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload Answer Key"}
        </button>

        {responseMessage && (
          <div
            className={`mt-6 p-4 rounded-md text-black shadow-md ${
              responseMessage.startsWith("Answer key uploaded")
                ? "bg-green-100"
                : "bg-red-100"
            }`}
          >
            <p>{responseMessage}</p>
          </div>
        )}

        {uniqueLink && (
          <div className="mt-6 p-4 bg-gray-100 text-black rounded-md shadow-md">
            <p className="mb-2 text-gray-700 font-medium">
              Share this link with your students:
            </p>
            <div className="flex items-center justify-between">
              <a
                href={uniqueLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 underline break-all"
              >
                {uniqueLink}
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(uniqueLink);
                  alert("Link copied to clipboard!");

                  window.location.href = "/StudentUpload";
                  window.location.href = "/StudentUpload"; // Redirect to StudentUpload page after copying
                }}
                className="ml-4 px-4 py-2 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 transition-all"
              >
                Copy Link
              </button>
            </div>
          </div>
        )}
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
                description:
                  "Initiate the grading process by uploading the exam answer key.",
              },
              {
                step: "02",
                title: "Upload Exam Answer Key",
                description:
                  "Upload the exam key with correct answers to the system.",
              },
              {
                step: "03",
                title: "Generate Unique Student Link",
                description:
                  "Generate a unique link to share with students for exam submission.",
              },
              {
                step: "04",
                title: "Students Upload Exam Responses",
                description:
                  "Students upload their completed exams via the unique link.",
              },
              {
                step: "05",
                title: "Review Student Details",
                description:
                  "Verify student name, exam title, and any other relevant information.",
              },
              {
                step: "06",
                title: "Select Grading Criteria",
                description:
                  "Choose grading criteria: strict, moderate, or relaxed grading modes.",
              },
              {
                step: "07",
                title: "AI Analysis",
                description:
                  "The AI analyzes the student's responses based on the uploaded key and selected criteria.",
              },
              {
                step: "08",
                title: "Generate Report",
                description:
                  "Generate and view the grading report for each student.",
              },
              {
                step: "09",
                title: "Download Report",
                description:
                  "Download the grading report in PDF format for easy sharing.",
              },
              {
                step: "10",
                title: "End",
                description:
                  "Review the final report and complete the grading process.",
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
export default TeacherUpload;
