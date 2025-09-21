import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FiSearch, FiDownload, FiChevronDown, FiTrash2 } from "react-icons/fi";
import * as XLSX from "xlsx";
import "react-toastify/dist/ReactToastify.css";

const EnrollStudent = ({ classId, onClose }) => {
  const [studentEmail, setStudentEmail] = useState("");
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEnrolledStudents = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_NODE_SERVER_URL
        }/api/classes/${classId}/students`
      );
      setStudents(response.data.students);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  useEffect(() => {
    fetchEnrolledStudents();
  }, [classId]);

  const filteredStudents = students.filter(
    (student) =>
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${student.firstName} ${student.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const handleEnroll = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_NODE_SERVER_URL}/api/students/enroll`,
        { studentEmail, classId }
      );

      if (response.status === 200) {
        toast.success("Student enrolled successfully!");
        setStudentEmail("");
        fetchEnrolledStudents();
      }
    } catch (err) {
      console.error("Error enrolling student:", err);
      setError(err.response?.data?.message || "Failed to enroll student.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (email) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_NODE_SERVER_URL}/api/students/remove`,
        { studentEmail: email, classId }
      );

      if (response.status === 200) {
        toast.success("Student removed successfully!");
        fetchEnrolledStudents();
      }
    } catch (err) {
      console.error("Error removing student:", err);
      alert("Failed to remove student.");
    }
  };

  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      students.map((student) => ({
        "First Name": student.firstName,
        "Last Name": student.lastName,
        Email: student.email,
        Role: "Student",
        Submissions: student.submissions || 0,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Roster");
    XLSX.writeFile(
      workbook,
      `class_roster_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <ToastContainer position="top-right" autoClose={3000} />
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-2xl p-6 md:p-8 max-w-4xl w-full shadow-xl mx-4"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Course Roster</h1>
            <p className="text-sm text-gray-500 mt-1">
              {students.length} students • 1 instructor
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-72">
            <div className="flex items-center border-b-2 border-gray-300 pb-1">
              <FiSearch className="text-gray-400 mr-2 text-lg" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
              />
              <FiChevronDown className="text-gray-400 ml-2 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Enrollment Input */}
        <form onSubmit={handleEnroll} className="mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              placeholder="Enter student email to enroll"
              required
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 text-sm"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-lg font-medium text-sm ${
                loading ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
              } text-white transition-colors whitespace-nowrap`}
            >
              {loading ? "Enrolling..." : "Enroll Student"}
            </motion.button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>

        {/* Roster Table */}
        <div className="mb-6">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-2 md:px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
            <div className="col-span-5 md:col-span-4">Name</div>
            <div className="col-span-4 md:col-span-3">Email</div>
            <div className="hidden md:block col-span-2">Role</div>
            <div className="col-span-3 md:col-span-1">Submissions</div>
            <div className="col-span-3 md:col-span-2 text-right">Actions</div>
          </div>

          {/* Student Rows */}
          <div className="max-h-[400px] overflow-y-auto">
            {filteredStudents.map((student) => (
              <div
                key={student._id}
                className="grid grid-cols-12 gap-4 px-2 md:px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="col-span-5 md:col-span-4 text-sm font-medium text-gray-800">
                  {student.firstName} {student.lastName}
                </div>
                <div className="col-span-4 md:col-span-3 text-sm text-gray-600 truncate">
                  {student.email}
                </div>
                <div className="hidden md:flex col-span-2 items-center text-sm text-gray-600">
                  <span>Student</span>
                  {/* <FiChevronDown className="ml-1 text-gray-400 cursor-pointer" /> */}
                </div>
                <div className="col-span-3 md:col-span-1 text-sm text-gray-600">
                  {student.submissions || 0}
                </div>
                <div className="col-span-3 md:col-span-2 flex justify-end">
                  <button
                    onClick={() => handleRemove(student.email)}
                    className="text-red-600 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-4 border-t border-gray-200 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleDownload}
            className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm transition-colors w-full md:w-auto justify-center"
          >
            <FiDownload className="mr-2" />
            Download Excel Roster
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full md:w-auto py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
          >
            Close Roster
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnrollStudent;
