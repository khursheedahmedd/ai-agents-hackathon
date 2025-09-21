import React from "react";
import { motion } from "framer-motion";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import UploadPaper from "./pages/UploadPaper";
import TeacherUpload from "./pages/TeacherUpload";
import AboutUs from "./pages/AboutUs";
import { AnimatePresence } from "framer-motion";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Unauthorized from "./pages/Unauthorized";
import VerifyEmail from "./pages/VerifyEmail";
import ErrorBoundary from "./components/ErrorBoundary";
import StudentUpload from "./pages/StudentUpload";
import TeacherDashboard from "./components/TeacherDasboard";
import StudentDashboard from "./components/StudentDashboard";
import { useUser } from "@clerk/clerk-react";

const App = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50">
        <motion.div
          className="h-16 w-16 border-4 border-emerald-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.p
          className="mt-4 text-emerald-700 text-lg font-semibold"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Loading your experience...
        </motion.p>
      </div>
    );

  const role = user?.unsafeMetadata?.role || "";

  return (
    <AnimatePresence mode="wait">
      <Navbar />
      <ErrorBoundary>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/about-us" element={<AboutUs />} />

          {/* Teacher-only Routes */}
          <Route
            path="/teacher-dashboard"
            element={
              <ProtectedRoute allowedRole="teacher" role={role}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload-paper"
            element={
              <ProtectedRoute allowedRole="teacher" role={role}>
                <UploadPaper />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/upload"
            element={
              <ProtectedRoute allowedRole="teacher" role={role}>
                <TeacherUpload />
              </ProtectedRoute>
            }
          />

          {/* Student-only Routes */}
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute allowedRole="student" role={role}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload_answer/:key_id"
            element={
              <ProtectedRoute allowedRole="student" role={role}>
                <StudentUpload />
              </ProtectedRoute>
            }
          />
        </Routes>
      </ErrorBoundary>
      <Footer />
    </AnimatePresence>
  );
};

export default App;
