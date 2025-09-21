// pages/Login.jsx
import { motion } from "framer-motion";
import { useSignIn } from "@clerk/clerk-react";
import LoginForm from "../components/auth/LoginForm";
import { useAuth } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function Login() {
  const { isLoaded } = useSignIn();
  const { signOut } = useAuth();

  const handleForceSignOut = async () => {
    await signOut();
    window.location.reload();
  };

  if (!isLoaded) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 flex items-center justify-center"
    >
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Exam Portal Login
          </h2>
        </motion.div>
        <LoginForm />
        {/* <button 
        onClick={handleForceSignOut}
        className="mt-4 text-red-600 hover:text-red-800"
      >
        Force Sign Out All Sessions
      </button> */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-4"
        >
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-green-600 hover:text-green-800 font-medium"
            >
              Register here
            </Link>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
