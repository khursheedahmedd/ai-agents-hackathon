import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import CreateClass from "./AddClass";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import EnrollStudent from "./EnrollStudent";
import AddAssessmentForm from "./AddAssessmentForm";
import {
  FiChevronDown,
  FiTrash2,
  FiUsers,
  FiFilePlus,
  FiBookOpen,
  FiDownload,
  FiEye,
  FiFileText,
  FiX,
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css";

const TeacherDashboard = () => {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddClassForm, setShowAddClassForm] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [showAddAssessmentForm, setShowAddAssessmentForm] = useState(false); // State to toggle Add Assessment form
  const [assessments, setAssessments] = useState([]);
  const { user } = useUser();
  const [loadingExcel, setLoadingExcel] = useState(false); // Loading state for Excel generation
  const [appeals, setAppeals] = useState([]);
  const [selectedAppeal, setSelectedAppeal] = useState(null); // State for the selected appeal
  const [showAppealModal, setShowAppealModal] = useState(false); // State for showing the modal
  const [loadingRecheck, setLoadingRecheck] = useState(false); // Loading state for recheck
  const [expandedAssessment, setExpandedAssessment] = useState(null); // State for expanded assessment
  const [selectedAssessment, setSelectedAssessment] = useState(null); // State for selected assessment in modal
  const [showAssessmentModal, setShowAssessmentModal] = useState(false); // State for showing assessment modal

  const teacherEmail = user?.emailAddresses?.[0]?.emailAddress;
  const teacherName = user?.fullName;

  const handleRecheck = async (appeal) => {
    if (!appeal || !appeal.assessment || !appeal.assessment._id) {
      toast.error("Invalid appeal data for recheck");
      return;
    }

    setLoadingRecheck(true); // Start loading
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_NODE_SERVER_URL}/api/appeals/recheck`,
        {
          studentEmail: appeal.studentEmail,
          keyFile: appeal.keyFile,
          assessmentId: appeal.assessment._id,
          appealId: appeal._id,
        }
      );

      if (response.status === 200) {
        toast.success("Recheck completed successfully!");
        setShowAppealModal(false);
        fetchAppeals(); // Refresh appeals list
      } else {
        toast.error("Failed to recheck. Please try again.");
      }
    } catch (error) {
      console.error("Error during recheck:", error);
      toast.error("An error occurred during recheck.");
    } finally {
      setLoadingRecheck(false); // Stop loading
    }
  };

  const fetchAppeals = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_NODE_SERVER_URL}/api/appeals`
      );
      setAppeals(response.data.appeals || []);
    } catch (error) {
      console.error("Error fetching appeals:", error);
      setAppeals([]);
    }
  };

  const handleGenerateExcel = async (folderId) => {
    if (!folderId) {
      toast.error("Invalid folder ID");
      return;
    }

    setLoadingExcel(true); // Show loading state
    try {
      // Send the folder ID to the Node.js backend
      const response = await axios.post(
        `${import.meta.env.VITE_NODE_SERVER_URL}/api/teachers/generate-excel`,
        { folderId }
      );

      const { excelUrl } = response.data;

      // Trigger download of the Excel file
      const link = document.createElement("a");
      link.href = excelUrl;
      link.download = "Assessment_Results.xlsx";
      link.click();

      toast.success("Result Excel sheet downloaded successfully!");
    } catch (error) {
      console.error("Error generating Excel sheet:", error);
      toast.error("Failed to generate Excel sheet. Please try again.");
    } finally {
      setLoadingExcel(false); // Hide loading state
    }
  };

  const getCloudinaryUrl = (fileUrl) => {
    if (!fileUrl) return ""; // Return empty string if fileUrl is null or undefined
    if (fileUrl.endsWith(".pdf")) {
      // Append 'raw' and 'fl_attachment' transformations for PDFs
      return fileUrl.replace("/upload/", "/upload/");
    }
    return fileUrl; // Return the original URL for other file types
  };

  const fetchAssessments = async (classId) => {
    if (!classId) return;

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_NODE_SERVER_URL}/api/classes/${classId}/folders`
      );
      setAssessments(response.data.folders || []);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      setAssessments([]);
    }
  };

  const handleDeleteAssessment = async (folderId) => {
    if (!folderId) {
      toast.error("Invalid folder ID");
      return;
    }

    try {
      await axios.delete(
        `${
          import.meta.env.VITE_NODE_SERVER_URL
        }/api/folders/delete-folder/${folderId}`
      );
      toast.success("Assessment deleted successfully!");
      setAssessments(assessments.filter((folder) => folder._id !== folderId));
    } catch (err) {
      console.error("Error deleting assessment:", err);
      toast.error("Failed to delete assessment.");
    }
  };

  const fetchTeacherDetails = async () => {
    if (!teacherEmail) {
      setError("Teacher email not available");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Replace with dynamic email if needed
      const response = await axios.get(
        `${import.meta.env.VITE_NODE_SERVER_URL}/api/teachers/details`,
        {
          params: { teacherEmail },
        }
      );
      setTeacher(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacherEmail) {
      fetchTeacherDetails();
      fetchAppeals();
    }
  }, [teacherEmail]);

  const handleClassClick = (cls) => {
    if (!cls || !cls._id) return;

    if (selectedClass?._id === cls._id) {
      // If the clicked class is already selected, close it
      setSelectedClass(null);
    } else {
      // Otherwise, set the clicked class as the selected class
      setSelectedClass(cls);
      setShowAddAssessmentForm(false); // Reset Add Assessment form visibility when switching classes
      fetchAssessments(cls._id); // Fetch assessments for the selected class
    }
  };

  const handleViewAppeal = (appeal) => {
    if (!appeal) return;

    setSelectedAppeal(appeal); // Set the selected appeal
    setShowAppealModal(true); // Show the modal
  };

  const handleAssessmentClick = (assessment) => {
    setSelectedAssessment(assessment); // Set the selected assessment
    setShowAssessmentModal(true); // Show the modal
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="bg-red-100 p-6 rounded-xl max-w-md text-center">
          <h2 className="text-red-600 font-semibold text-xl mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );

  if (!teacher || !teacher.classes) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="bg-yellow-100 p-6 rounded-xl max-w-md text-center">
          <h2 className="text-yellow-600 font-semibold text-xl mb-2">
            No Teacher Data
          </h2>
          <p className="text-yellow-500">Teacher information not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 p-4 md:p-8 pt-[8rem] md:pt-[12rem] pb-[8rem] md:pb-[12rem]">
      <div className="max-w-7xl mx-auto">
        {/* Loading Popup for Recheck */}
        {loadingRecheck && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-emerald-800 font-semibold">
                Rechecking in progress...
              </p>
            </div>
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl shadow-xl p-8 mb-8 border border-emerald-100"
        >
          {/* Toast Container */}
          <ToastContainer
            position="top-right"
            autoClose={5000} // Toast disappears after 5 seconds
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />

          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="md:text-4xl text-2xl font-bold text-emerald-800 mb-2">
              Welcome back,{" "}
              <span className="text-emerald-600">
                {teacherName || "Teacher"}
              </span>
            </h1>
            <p className="text-emerald-600 text-lg">
              Here's an overview of your teaching dashboard
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatCard
              icon={<FiBookOpen className="w-6 h-6" />}
              title="Total Classes"
              value={teacher.classes?.length || 0}
              color="emerald"
              trend="+2 this month"
            />
            <StatCard
              icon={<FiUsers className="w-6 h-6" />}
              title="Total Students"
              value={
                teacher.classes?.reduce(
                  (total, cls) => total + (cls.students?.length || 0),
                  0
                ) || 0
              }
              color="blue"
              trend="+12 this week"
            />
            <StatCard
              icon={<FiFilePlus className="w-6 h-6" />}
              title="Active Assessments"
              value={assessments.length}
              color="purple"
              trend="3 pending"
            />
            <StatCard
              icon={<FiEye className="w-6 h-6" />}
              title="Pending Appeals"
              value={appeals.filter((appeal) => !appeal.resolved).length}
              color="orange"
              trend="2 new today"
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-emerald-100">
            <h3 className="text-lg font-semibold text-emerald-800 mb-4">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddClassForm(!showAddClassForm)}
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
              >
                <FiFilePlus className="w-5 h-5" />
                Create New Class
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
              >
                <FiDownload className="w-5 h-5" />
                Export Reports
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
              >
                <FiUsers className="w-5 h-5" />
                Manage Students
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Recent Activity
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500 rounded-lg text-white">
                  <FiUsers className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-emerald-800">
                    New Students
                  </div>
                  <div className="text-sm text-emerald-600">This week</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-emerald-800">
                {teacher.classes?.reduce(
                  (total, cls) => total + (cls.students?.length || 0),
                  0
                ) || 0}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500 rounded-lg text-white">
                  <FiFilePlus className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-blue-800">Assessments</div>
                  <div className="text-sm text-blue-600">Active</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-800">
                {assessments.length}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500 rounded-lg text-white">
                  <FiEye className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-purple-800">Appeals</div>
                  <div className="text-sm text-purple-600">Pending</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-800">
                {appeals.filter((appeal) => !appeal.resolved).length}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          <LayoutGroup>
            <motion.div className="grid gap-6">
              {teacher.classes?.map((cls) => {
                if (!cls || !cls._id) return null;

                const totalStudents = cls.students?.length || 0;
                const capacity = cls.capacity || 0;
                const enrollmentRate =
                  capacity > 0
                    ? Math.round((totalStudents / capacity) * 100)
                    : 0;

                return (
                  <motion.div
                    key={cls._id}
                    layout
                    className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
                  >
                    <motion.div
                      layout
                      className="p-6 cursor-pointer hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 transition-all duration-300"
                      onClick={() => handleClassClick(cls)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl text-white">
                            <FiBookOpen className="text-xl md:text-2xl" />
                          </div>
                          <div>
                            <h4 className="text-xl md:text-2xl font-bold text-gray-800">
                              {cls.className || "Unnamed Class"}
                            </h4>
                            <p className="text-gray-500 text-sm">
                              Class ID: {cls.classId || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:gap-4">
                          <div className="text-right">
                            <div className="text-sm text-gray-500">
                              Enrollment
                            </div>
                            <div className="text-lg font-semibold text-emerald-600">
                              {totalStudents}/{capacity}
                            </div>
                            <div className="text-xs text-gray-400">
                              {enrollmentRate}% filled
                            </div>
                          </div>
                          <FiChevronDown
                            className={`text-emerald-600 text-2xl transform transition-transform duration-300 ${
                              selectedClass?._id === cls._id ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </div>

                      {/* Quick Stats Row */}
                      <div className="grid grid-cols-3 gap-2 md:gap-4 mt-4">
                        <div className="text-center p-2 md:p-3 bg-emerald-50 rounded-lg">
                          <div className="text-lg md:text-2xl font-bold text-emerald-600">
                            {totalStudents}
                          </div>
                          <div className="text-xs text-emerald-600">
                            Students
                          </div>
                        </div>
                        <div className="text-center p-2 md:p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg md:text-2xl font-bold text-blue-600">
                            {
                              assessments.filter(
                                (assessment) => assessment.classId === cls._id
                              ).length
                            }
                          </div>
                          <div className="text-xs text-blue-600">
                            Assessments
                          </div>
                        </div>
                        <div className="text-center p-2 md:p-3 bg-purple-50 rounded-lg">
                          <div className="text-lg md:text-2xl font-bold text-purple-600">
                            {
                              appeals.filter(
                                (appeal) =>
                                  appeal.assessment &&
                                  appeal.assessment.classId === cls._id
                              ).length
                            }
                          </div>
                          <div className="text-xs text-purple-600">Appeals</div>
                        </div>
                      </div>
                    </motion.div>

                    <AnimatePresence>
                      {selectedClass && selectedClass._id === cls._id && (
                        <motion.div
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white"
                        >
                          <div className="p-6">
                            {/* Class Details Section */}
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h5 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                  Class Statistics
                                </h5>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                                    <div className="text-3xl font-bold text-emerald-600">
                                      {cls.capacity || 0}
                                    </div>
                                    <div className="text-sm text-emerald-600">
                                      Capacity
                                    </div>
                                  </div>
                                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-3xl font-bold text-blue-600">
                                      {cls.students?.length || 0}
                                    </div>
                                    <div className="text-sm text-blue-600">
                                      Enrolled
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-4">
                                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Enrollment Progress</span>
                                    <span>{enrollmentRate}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${enrollmentRate}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="space-y-3">
                                <h5 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  Quick Actions
                                </h5>
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setShowEnrollForm(true)}
                                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg transition-all duration-200"
                                >
                                  <FiUsers className="w-5 h-5" />
                                  Manage Students
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() =>
                                    setShowAddAssessmentForm(
                                      !showAddAssessmentForm
                                    )
                                  }
                                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg transition-all duration-200"
                                >
                                  <FiFilePlus className="w-5 h-5" />
                                  {showAddAssessmentForm
                                    ? "Close Form"
                                    : "New Assessment"}
                                </motion.button>
                              </div>
                            </div>

                            {/* Assessments List */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                Course Assessments
                                <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
                                  {assessments.length}
                                </span>
                              </h3>
                              {assessments.length === 0 ? (
                                <div className="text-center py-12">
                                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiFilePlus className="w-8 h-8 text-gray-400" />
                                  </div>
                                  <h4 className="text-lg font-medium text-gray-600 mb-2">
                                    No assessments yet
                                  </h4>
                                  <p className="text-gray-500">
                                    Create your first assessment to get started
                                  </p>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {assessments.map((folder) => {
                                    if (!folder || !folder._id) return null;

                                    const submissionCount =
                                      folder.submissions?.length || 0;

                                    return (
                                      <motion.div
                                        key={folder._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                                      >
                                        {/* Assessment Card */}
                                        <div
                                          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                                          onClick={() =>
                                            handleAssessmentClick(folder)
                                          }
                                        >
                                          <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                              <h4 className="text-lg font-bold text-gray-800 mb-1">
                                                {folder.name ||
                                                  "Unnamed Assessment"}
                                              </h4>
                                              <p className="text-sm text-gray-600 line-clamp-2">
                                                {folder.description ||
                                                  "No description provided"}
                                              </p>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                              <FiEye className="text-gray-400" />
                                            </div>
                                          </div>

                                          {/* Quick Stats */}
                                          <div className="grid grid-cols-3 gap-3 text-center">
                                            <div className="bg-gray-50 rounded-lg p-2">
                                              <div className="text-sm font-semibold text-gray-800">
                                                {submissionCount}
                                              </div>
                                              <div className="text-xs text-gray-600">
                                                Submissions
                                              </div>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-2">
                                              <div className="text-sm font-semibold text-gray-800">
                                                {folder.dueDate
                                                  ? new Date(
                                                      folder.dueDate
                                                    ).toLocaleDateString()
                                                  : "No due date"}
                                              </div>
                                              <div className="text-xs text-gray-600">
                                                Due Date
                                              </div>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-2">
                                              <div className="text-sm font-semibold text-gray-800">
                                                {folder.createdAt
                                                  ? new Date(
                                                      folder.createdAt
                                                    ).toLocaleDateString()
                                                  : "Unknown"}
                                              </div>
                                              <div className="text-xs text-gray-600">
                                                Created
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          </LayoutGroup>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showAddClassForm && (
            <CreateClass
              teacherEmail={teacher.email}
              onClassCreated={fetchTeacherDetails}
              onClose={() => setShowAddClassForm(false)}
            />
          )}
          {showAddAssessmentForm && selectedClass && (
            <AddAssessmentForm
              classId={selectedClass._id}
              onAssessmentAdded={(newAssessment) =>
                setAssessments([...assessments, newAssessment])
              }
              onClose={() => setShowAddAssessmentForm(false)}
            />
          )}
          {showEnrollForm && selectedClass && (
            <EnrollStudent
              classId={selectedClass._id}
              onClose={() => setShowEnrollForm(false)}
            />
          )}
          {showAppealModal && selectedAppeal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h3 className="text-lg font-semibold text-emerald-800 mb-4">
                  Appeal Details
                </h3>
                <p className="text-sm text-emerald-800">
                  <strong>Student Email:</strong>{" "}
                  {selectedAppeal.studentEmail || "Unknown"}
                </p>
                <p className="text-sm text-emerald-800">
                  <strong>Description:</strong>{" "}
                  {selectedAppeal.description || "No description"}
                </p>
                <p className="text-sm text-emerald-800">
                  <strong>Assessment:</strong>{" "}
                  {selectedAppeal.assessment?.name || "Unknown assessment"}
                </p>
                <p className="text-sm text-emerald-800">
                  <strong>Created At:</strong>{" "}
                  {selectedAppeal.createdAt
                    ? new Date(selectedAppeal.createdAt).toLocaleString()
                    : "Unknown"}
                </p>
                <div className="flex justify-end gap-4 mt-4">
                  <button
                    onClick={() => setShowAppealModal(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleRecheck(selectedAppeal)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    disabled={loadingRecheck}
                  >
                    {loadingRecheck ? "Rechecking..." : "Recheck"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          {showAssessmentModal && selectedAssessment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FiFileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {selectedAssessment.name || "Unnamed Assessment"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Assessment Details
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAssessmentModal(false)}
                      className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Assessment Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Description
                    </h4>
                    <p className="text-gray-600">
                      {selectedAssessment.description ||
                        "No description provided"}
                    </p>
                  </div>

                  {/* File Downloads */}
                  <div
                    className={`grid gap-4 ${
                      selectedAssessment.questionFile
                        ? "md:grid-cols-2"
                        : "md:grid-cols-1"
                    }`}
                  >
                    {selectedAssessment.questionFile && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <FiDownload className="w-4 h-4 text-blue-600" />
                          Question File
                        </h5>
                        <a
                          href={getCloudinaryUrl(
                            selectedAssessment.questionFile
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-2"
                        >
                          <FiDownload className="w-4 h-4" />
                          Download Question File
                        </a>
                      </div>
                    )}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FiDownload className="w-4 h-4 text-green-600" />
                        Answer Key
                      </h5>
                      <a
                        href={getCloudinaryUrl(selectedAssessment.keyFile)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline flex items-center gap-2"
                      >
                        <FiDownload className="w-4 h-4" />
                        Download Answer Key
                      </a>
                    </div>
                  </div>

                  {/* Submissions, Reports, and Appeals */}
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Submissions Section */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FiUsers className="w-4 h-4 text-blue-600" />
                        Submissions (
                        {selectedAssessment.submissions?.length || 0})
                      </h5>
                      {!selectedAssessment.submissions ||
                      selectedAssessment.submissions.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          No submissions yet
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {selectedAssessment.submissions
                            .slice(0, 5)
                            .map((submission) => {
                              if (!submission || !submission._id) return null;
                              return (
                                <div
                                  key={submission._id}
                                  className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm"
                                >
                                  <span className="text-gray-700 truncate">
                                    {submission.student?.email ||
                                      "Unknown student"}
                                  </span>
                                  <a
                                    href={submission.submissionFile}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    <FiDownload className="w-3 h-3" />
                                  </a>
                                </div>
                              );
                            })}
                          {selectedAssessment.submissions.length > 5 && (
                            <p className="text-xs text-gray-500 text-center">
                              +{selectedAssessment.submissions.length - 5} more
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Grading Reports Section */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FiFileText className="w-4 h-4 text-green-600" />
                        Grading Reports
                      </h5>
                      {!selectedAssessment.submissions ||
                      selectedAssessment.submissions.length === 0 ? (
                        <p className="text-sm text-gray-500">No reports yet</p>
                      ) : (
                        <div className="space-y-2">
                          {selectedAssessment.submissions
                            .slice(0, 5)
                            .map((submission) => {
                              if (!submission || !submission._id) return null;
                              return (
                                <div
                                  key={submission._id}
                                  className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm"
                                >
                                  <span className="text-gray-700 truncate">
                                    {submission.student?.email ||
                                      "Unknown student"}
                                  </span>
                                  {submission.gradingReport ? (
                                    <a
                                      href={submission.gradingReport}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-green-600 hover:underline"
                                    >
                                      <FiDownload className="w-3 h-3" />
                                    </a>
                                  ) : (
                                    <span className="text-gray-400 text-xs">
                                      No report
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>

                    {/* Appeals Section */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FiEye className="w-4 h-4 text-orange-600" />
                        Appeals
                      </h5>
                      {!selectedAssessment.submissions ||
                      selectedAssessment.submissions.length === 0 ? (
                        <p className="text-sm text-gray-500">No appeals yet</p>
                      ) : (
                        <div className="space-y-2">
                          {selectedAssessment.submissions
                            .slice(0, 5)
                            .map((submission) => {
                              if (!submission || !submission._id) return null;
                              const appeal = appeals.find(
                                (a) =>
                                  a.assessment &&
                                  a.assessment._id === selectedAssessment._id &&
                                  a.studentEmail ===
                                    (submission.student?.email || "")
                              );
                              // Only show students who have appeals
                              if (!appeal) return null;
                              return (
                                <div
                                  key={submission._id}
                                  className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm"
                                >
                                  <span className="text-gray-700 truncate">
                                    {submission.student?.email ||
                                      "Unknown student"}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setShowAssessmentModal(false);
                                      handleViewAppeal(appeal);
                                    }}
                                    className="text-orange-600 hover:underline"
                                  >
                                    <FiEye className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                          {selectedAssessment.submissions.filter(
                            (submission) => {
                              const appeal = appeals.find(
                                (a) =>
                                  a.assessment &&
                                  a.assessment._id === selectedAssessment._id &&
                                  a.studentEmail ===
                                    (submission.student?.email || "")
                              );
                              return appeal;
                            }
                          ).length === 0 && (
                            <p className="text-sm text-gray-500">
                              No appeals yet
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <button
                      onClick={() =>
                        handleGenerateExcel(selectedAssessment._id)
                      }
                      className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center gap-2"
                      disabled={loadingExcel}
                    >
                      {loadingExcel ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <FiDownload className="w-4 h-4" />
                          Generate Excel Sheet
                        </>
                      )}
                    </button>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setShowAssessmentModal(false)}
                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteAssessment(selectedAssessment._id);
                          setShowAssessmentModal(false);
                        }}
                        className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
                      >
                        Delete Assessment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ icon, title, value, color, trend }) => {
  const colorClasses = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`bg-white rounded-xl p-6 shadow-sm border ${colorClasses[color]} transition-all duration-200`}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 rounded-lg ${colorClasses[color].replace(
            "50",
            "100"
          )}`}
        >
          {icon}
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-800">{value}</div>
          <div className="text-sm text-gray-500">{title}</div>
        </div>
      </div>
      <div className="text-xs text-gray-500">{trend}</div>
    </motion.div>
  );
};

const StatBox = ({ icon, label, value }) => (
  <div className="bg-white p-3 rounded-lg flex items-center gap-3">
    <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
      {icon}
    </div>
    <div>
      <div className="text-xs text-emerald-600">{label}</div>
      <div className="text-lg font-semibold text-emerald-800">{value}</div>
    </div>
  </div>
);

const DetailItem = ({ label, value }) => (
  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
      {label}
    </span>
    <span className="block font-semibold text-gray-800 mt-1">{value}</span>
  </div>
);

export default TeacherDashboard;
