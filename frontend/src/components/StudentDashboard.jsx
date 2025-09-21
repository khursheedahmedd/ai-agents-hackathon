import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import {
  FaChalkboardTeacher,
  FaFileUpload,
  FaFileAlt,
  FaRegCalendarCheck,
  FaCloudUploadAlt,
  FaUsers,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import { FiChevronRight, FiDownload, FiX, FiTrendingUp } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StudentDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [activeSubmissions, setActiveSubmissions] = useState([]);
  const [previousSubmissions, setPreviousSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);
  const { user } = useUser();
  const [loading, setLoading] = useState(false); // Loading state
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showAppealForm, setShowAppealForm] = useState(false);
  const [appealDescription, setAppealDescription] = useState("");
  const [dashboardStats, setDashboardStats] = useState({
    totalActiveAssessments: 0,
    totalSubmissions: 0,
    pendingAssessments: 0,
    upcomingDeadlines: 0,
  });
  const [showClassModal, setShowClassModal] = useState(false);
  const [modalSection, setModalSection] = useState("overview"); // 'overview', 'pending', 'submitted', 'overdue'

  const studentEmail = user.emailAddresses[0].emailAddress;
  const studentName = user.fullName;

  const handleAppealSubmit = async () => {
    console.log("Submitting appeal...");
    console.log("selected submission:", selectedSubmission);

    if (!selectedSubmission) {
      alert("No submission selected for appeal.");
      return;
    }

    try {
      const appealData = {
        gradingReport: selectedSubmission.gradingReport,
        studentEmail: user.emailAddresses[0].emailAddress,
        assessmentId: selectedSubmission.assessmentId, // Ensure assessmentId is included
        description: appealDescription,
      };

      console.log("Submitting appeal with data:", appealData);

      await axios.post(
        `${import.meta.env.VITE_NODE_SERVER_URL}/api/appeals/submit`,
        appealData
      );

      alert("Appeal submitted successfully!");
      setShowAppealForm(false);
      setAppealDescription("");
    } catch (error) {
      console.error("Error submitting appeal:", error);
      alert("Failed to submit appeal. Please try again.");
    }
  };

  const getCloudinaryUrl = (fileUrl) => {
    if (fileUrl.endsWith(".pdf")) {
      // Append 'raw' transformation for PDFs
      return fileUrl.replace("/upload/", "/upload/raw/");
    }
    return fileUrl; // Return the original URL for other file types
  };

  const fetchEnrolledClasses = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_NODE_SERVER_URL}/api/students/classes`,
        {
          params: { studentEmail },
        }
      );
      setClasses(response.data.classes);
      calculateDashboardStats(response.data.classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const calculateDashboardStats = async (classesList) => {
    let totalActiveAssessments = 0;
    let totalSubmissions = 0;
    let pendingAssessments = 0;
    let upcomingDeadlines = 0;

    try {
      // Fetch details for each class to get accurate statistics
      for (const cls of classesList) {
        const response = await axios.get(
          `${import.meta.env.VITE_NODE_SERVER_URL}/api/classes/${cls._id}`,
          {
            params: { studentEmail },
          }
        );

        const { activeSubmissions, previousSubmissions } = response.data;

        totalActiveAssessments += activeSubmissions.length;
        totalSubmissions += previousSubmissions.length;

        // Count pending assessments (active assessments not yet submitted)
        pendingAssessments += activeSubmissions.filter(
          (assessment) => !assessment.submitted
        ).length;

        // Count upcoming deadlines (within next 7 days)
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        upcomingDeadlines += activeSubmissions.filter((assessment) => {
          const dueDate = new Date(assessment.dueDate);
          return dueDate > now && dueDate <= nextWeek;
        }).length;
      }

      setDashboardStats({
        totalActiveAssessments,
        totalSubmissions,
        pendingAssessments,
        upcomingDeadlines,
      });
    } catch (error) {
      console.error("Error calculating dashboard stats:", error);
    }
  };

  const fetchClassDetails = async (classId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_NODE_SERVER_URL}/api/classes/${classId}`,
        {
          params: { studentEmail },
        }
      );
      setSelectedClass(response.data.class);
      setActiveSubmissions(response.data.activeSubmissions);
      setPreviousSubmissions(response.data.previousSubmissions);
      setShowClassModal(true);
      setModalSection("overview");
    } catch (error) {
      console.error("Error fetching class details:", error);
    }
  };

  // Helper functions to categorize assessments
  const getPendingAssessments = () => {
    return activeSubmissions.filter((assessment) => !assessment.submitted);
  };

  const getSubmittedAssessments = () => {
    return previousSubmissions;
  };

  const getOverdueAssessments = () => {
    const now = new Date();
    return activeSubmissions.filter((assessment) => {
      const dueDate = new Date(assessment.dueDate);
      return dueDate < now && !assessment.submitted;
    });
  };

  const handleTaskSubmit = async (folderId, taskName) => {
    const formData = new FormData();
    formData.append("submissionFile", submissionFile);
    formData.append("folderId", folderId);
    formData.append("taskName", taskName);
    formData.append("studentEmail", user.emailAddresses[0].emailAddress);

    setLoading(true); // Show loading pop-up
    setLoadingMessage("Submitting and evaluating the assessment...");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_NODE_SERVER_URL}/api/students/submit-task`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success("Task submitted successfully!");
      setSubmissionFile(null);
      fetchClassDetails(selectedClass._id); // Refresh class details
    } catch (error) {
      console.error("Error submitting task:", error);
      toast.error("Failed to submit task. Please try again.");
    } finally {
      setLoading(false); // Hide loading pop-up
      setLoadingMessage("");
    }
  };

  useEffect(() => {
    fetchEnrolledClasses();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-emerald-50 pt-[12rem] pb-[12rem] p-6"
    >
      {/* Toast Container */}
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
        // transition="opacity ease-in-out"
      />

      {/* Loading Pop-Up */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg flex flex-col items-center space-y-4 shadow-lg text-center">
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

      <div className="max-w-6xl mx-auto">
        {/* Enhanced Welcome Header with Statistics */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-xl p-8 mb-8 text-white"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="md:text-4xl text-2xl font-bold mb-2">
                Welcome back,{" "}
                <span className="text-emerald-200">{studentName}</span>
              </h1>
              <p className="text-emerald-100 text-lg">
                Here's an overview of your academic progress
              </p>
            </div>
            <div className="flex items-center gap-4 text-emerald-200">
              <FaChalkboardTeacher className="text-2xl" />
              <span className="text-xl font-semibold">
                {classes.length} enrolled classes
              </span>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            icon={<FaFileAlt className="w-6 h-6" />}
            title="Active Assessments"
            value={dashboardStats.totalActiveAssessments}
            color="blue"
            trend="+2 this week"
          />
          <StatCard
            icon={<FaCheckCircle className="w-6 h-6" />}
            title="Completed Submissions"
            value={dashboardStats.totalSubmissions}
            color="green"
            trend="+5 this month"
          />
          <StatCard
            icon={<FaClock className="w-6 h-6" />}
            title="Pending Assessments"
            value={dashboardStats.pendingAssessments}
            color="orange"
            trend="Due soon"
          />
          <StatCard
            icon={<FaExclamationTriangle className="w-6 h-6" />}
            title="Upcoming Deadlines"
            value={dashboardStats.upcomingDeadlines}
            color="red"
            trend="Next 7 days"
          />
        </motion.div>

        {/* Enrolled Classes Section */}
        <motion.div className="grid gap-6">
          <h2 className="text-xl font-semibold text-emerald-800 flex items-center gap-2">
            <FaChalkboardTeacher className="text-emerald-600" />
            Your Classes
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <motion.div
                key={cls._id}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer border border-gray-100 hover:shadow-xl transition-all duration-200 group"
                onClick={() => fetchClassDetails(cls._id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <FaChalkboardTeacher className="w-6 h-6 text-white" />
                  </div>
                  <FiChevronRight className="text-emerald-600 text-xl group-hover:translate-x-1 transition-transform duration-200" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-700 transition-colors duration-200">
                    {cls.className}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Class ID: {cls.classId || "N/A"}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <FaUsers className="w-4 h-4" />
                    <span>Click to view assessments</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Class Details Modal */}
        <AnimatePresence>
          {showClassModal && selectedClass && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <FaChalkboardTeacher className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          {selectedClass.className}
                        </h2>
                        <p className="text-gray-500">
                          {selectedClass.teacherName}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowClassModal(false);
                        setModalSection("overview");
                      }}
                      className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <FiX className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  {modalSection === "overview" && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-6">
                        Assessment Overview
                      </h3>

                      <div className="grid gap-6">
                        {/* Pending Assessments Card */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 cursor-pointer group"
                          onClick={() => setModalSection("pending")}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                <FaClock className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-blue-800">
                                  Pending Assessments
                                </h4>
                                <p className="text-blue-600">
                                  {getPendingAssessments().length} assessments
                                  waiting for submission
                                </p>
                              </div>
                            </div>
                            <FiChevronRight className="text-blue-600 text-xl group-hover:translate-x-1 transition-transform duration-200" />
                          </div>
                        </motion.div>

                        {/* Submitted Assessments Card */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200 cursor-pointer group"
                          onClick={() => setModalSection("submitted")}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                <FaCheckCircle className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-green-800">
                                  Submitted Assessments
                                </h4>
                                <p className="text-green-600">
                                  {getSubmittedAssessments().length} completed
                                  submissions
                                </p>
                              </div>
                            </div>
                            <FiChevronRight className="text-green-600 text-xl group-hover:translate-x-1 transition-transform duration-200" />
                          </div>
                        </motion.div>

                        {/* Overdue Assessments Card - Only show if there are overdue assessments */}
                        {getOverdueAssessments().length > 0 && (
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6 border border-red-200 cursor-pointer group"
                            onClick={() => setModalSection("overdue")}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                                  <FaExclamationTriangle className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h4 className="text-lg font-bold text-red-800">
                                    Overdue Assessments
                                  </h4>
                                  <p className="text-red-600">
                                    {getOverdueAssessments().length} assessments
                                    past due date
                                  </p>
                                </div>
                              </div>
                              <FiChevronRight className="text-red-600 text-xl group-hover:translate-x-1 transition-transform duration-200" />
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Pending Assessments Section */}
                  {modalSection === "pending" && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 mb-6">
                        <button
                          onClick={() => setModalSection("overview")}
                          className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        >
                          <FiChevronRight className="w-5 h-5 rotate-180" />
                        </button>
                        <h3 className="text-xl font-semibold text-gray-800">
                          Pending Assessments
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getPendingAssessments().map((assessment) => {
                          const dueDate = new Date(assessment.dueDate);
                          const now = new Date();
                          const daysUntilDue = Math.ceil(
                            (dueDate - now) / (1000 * 60 * 60 * 24)
                          );
                          const isDueSoon =
                            daysUntilDue <= 3 && daysUntilDue >= 0;

                          return (
                            <motion.div
                              key={assessment._id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`rounded-xl p-4 border cursor-pointer transition-all duration-200 group ${
                                isDueSoon
                                  ? "bg-orange-50 border-orange-200 hover:bg-orange-100"
                                  : "bg-emerald-50 border-emerald-100 hover:bg-emerald-100"
                              }`}
                              onClick={() => {
                                setSelectedSubmission(assessment);
                                setShowClassModal(false);
                              }}
                            >
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                      isDueSoon
                                        ? "bg-orange-100 text-orange-600"
                                        : "bg-emerald-100 text-emerald-600"
                                    }`}
                                  >
                                    <FaFileAlt className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-800 group-hover:text-emerald-700 transition-colors duration-200 text-sm truncate">
                                      {assessment.name}
                                    </h4>
                                  </div>
                                </div>

                                <p className="text-xs text-gray-500 line-clamp-2">
                                  {assessment.description ||
                                    "No description provided"}
                                </p>

                                <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs w-fit">
                                  <FaRegCalendarCheck className="w-3 h-3" />
                                  <span className="font-medium">
                                    Due {dueDate.toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Submitted Assessments Section */}
                  {modalSection === "submitted" && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 mb-6">
                        <button
                          onClick={() => setModalSection("overview")}
                          className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        >
                          <FiChevronRight className="w-5 h-5 rotate-180" />
                        </button>
                        <h3 className="text-xl font-semibold text-gray-800">
                          Submitted Assessments
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getSubmittedAssessments().map((submission) => (
                          <motion.div
                            key={submission._id}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                  <FaCheckCircle className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-gray-800 group-hover:text-emerald-700 transition-colors duration-200 text-sm truncate">
                                    {submission.taskName}
                                  </h4>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <FaRegCalendarCheck className="w-3 h-3" />
                                  <span>
                                    Submitted on{" "}
                                    {new Date(
                                      submission.submittedAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>

                                {submission.gradingReport && (
                                  <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-green-100 text-green-700 w-fit">
                                    <FaFileAlt className="w-3 h-3" />
                                    <span className="text-xs font-medium">
                                      Graded
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 pt-2">
                                {submission.gradingReport && (
                                  <a
                                    href={submission.gradingReport}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors duration-200 text-center text-xs font-medium"
                                    title="View Grading Report"
                                  >
                                    <FaFileAlt className="w-4 h-4 mx-auto mb-1" />
                                    Report
                                  </a>
                                )}
                                <a
                                  href={submission.submissionFile}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors duration-200 text-center text-xs font-medium"
                                  title="Download Submission"
                                >
                                  <FiDownload className="w-4 h-4 mx-auto mb-1" />
                                  Download
                                </a>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Overdue Assessments Section */}
                  {modalSection === "overdue" && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 mb-6">
                        <button
                          onClick={() => setModalSection("overview")}
                          className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        >
                          <FiChevronRight className="w-5 h-5 rotate-180" />
                        </button>
                        <h3 className="text-xl font-semibold text-gray-800">
                          Overdue Assessments
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getOverdueAssessments().map((assessment) => {
                          const dueDate = new Date(assessment.dueDate);
                          const now = new Date();
                          const daysOverdue = Math.ceil(
                            (now - dueDate) / (1000 * 60 * 60 * 24)
                          );

                          return (
                            <motion.div
                              key={assessment._id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="bg-red-50 rounded-xl p-4 border border-red-200 cursor-pointer transition-all duration-200 group hover:bg-red-100"
                              onClick={() => {
                                setSelectedSubmission(assessment);
                                setShowClassModal(false);
                              }}
                            >
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                                    <FaExclamationTriangle className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-800 group-hover:text-red-700 transition-colors duration-200 text-sm truncate">
                                      {assessment.name}
                                    </h4>
                                  </div>
                                </div>

                                <p className="text-xs text-gray-500 line-clamp-2">
                                  {assessment.description ||
                                    "No description provided"}
                                </p>

                                <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs w-fit">
                                  <FaRegCalendarCheck className="w-3 h-3" />
                                  <span className="font-medium">
                                    Overdue by {daysOverdue} day
                                    {daysOverdue !== 1 ? "s" : ""}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submission Details Modal */}
        <AnimatePresence>
          {selectedSubmission && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-white rounded-2xl p-8 max-w-xl w-full"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-emerald-800">
                      {selectedSubmission.name}
                    </h2>
                    <p className="text-emerald-600 mt-1">
                      {selectedSubmission.description}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="text-emerald-600 hover:text-emerald-800 p-2 rounded-full"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>

                <div className="space-y-4">
                  <DetailItem
                    icon={<FaRegCalendarCheck />}
                    label="Due Date"
                    value={new Date(
                      selectedSubmission.dueDate
                    ).toLocaleDateString()}
                  />
                  <DetailItem
                    icon={<FaFileAlt />}
                    label="Question File"
                    value={
                      <a
                        href={selectedSubmission.questionFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:underline flex items-center gap-2"
                      >
                        <FiDownload /> Download
                      </a>
                    }
                  />
                </div>

                {selectedSubmission.submitted ? (
                  <div className="mt-6 bg-emerald-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-emerald-800 mb-2">
                      Your Submission
                    </h3>
                    <DetailItem
                      icon={<FaCloudUploadAlt />}
                      label="Submitted On"
                      value={new Date(
                        selectedSubmission.submissionDetails.submittedAt
                      ).toLocaleDateString()}
                    />
                    <DetailItem
                      icon={<FaFileAlt />}
                      label="Submission File"
                      value={
                        <a
                          href={
                            selectedSubmission.submissionDetails.submissionFile
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:underline flex items-center gap-2"
                        >
                          <FiDownload /> Download
                        </a>
                      }
                    />
                  </div>
                ) : (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-emerald-800 mb-4">
                      Upload Your Submission (PDF)
                    </label>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="border-2 border-dashed border-emerald-200 rounded-xl p-8 text-center cursor-pointer"
                    >
                      <input
                        type="file"
                        onChange={(e) => setSubmissionFile(e.target.files[0])}
                        className="hidden"
                        id="fileInput"
                      />
                      <label htmlFor="fileInput" className="cursor-pointer">
                        <div className="text-emerald-600 mb-2">
                          <FaCloudUploadAlt className="text-3xl mx-auto" />
                        </div>
                        <p className="text-emerald-600">
                          {submissionFile
                            ? submissionFile.name
                            : "Click to select file"}
                        </p>
                      </label>
                    </motion.div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        handleTaskSubmit(
                          selectedSubmission._id,
                          selectedSubmission.name
                        )
                      }
                      disabled={!submissionFile}
                      className={`w-full mt-6 py-3 rounded-xl font-semibold ${
                        submissionFile
                          ? "bg-green-500 text-white hover:bg-green-600"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Submit Assessment
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Helper Components
const StatCard = ({ icon, title, value, color, trend }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-emerald-500 to-emerald-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
  };

  const iconBgClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-emerald-100 text-emerald-600",
    orange: "bg-orange-100 text-orange-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBgClasses[color]}`}
        >
          {icon}
        </div>
        <div
          className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${colorClasses[color]} text-white font-medium`}
        >
          {trend}
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </motion.div>
  );
};

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-lg">
    <div className="text-emerald-600">{icon}</div>
    <div>
      <div className="text-sm font-medium text-emerald-800">{label}</div>
      {typeof value === "string" && value.endsWith(".pdf") ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 hover:underline flex items-center gap-2"
        >
          <FiDownload /> Download PDF
        </a>
      ) : (
        <div className="text-emerald-600">{value}</div>
      )}
    </div>
  </div>
);

export default StudentDashboard;
