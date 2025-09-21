// src/pages/Signup.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SignupForm from "../components/auth/SignupForm";
import { useState } from "react";

export default function Signup() {
  const [demoCredentials, setDemoCredentials] = useState(null);

  const handleDemoSignup = (email, password, role, firstName, lastName) => {
    setDemoCredentials({ email, password, role, firstName, lastName });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 py-12 pb-32 pt-32 my-24 flex items-center justify-center"
    >
      <div className="max-w-lg w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Create New Account
          </h2>
        </motion.div>

        <SignupForm demoCredentials={demoCredentials} />

        {/* Demo Credentials Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <h3 className="text-sm font-medium text-blue-900 mb-3">
            Demo Credentials for Testing: (Go to Login section to use these
            credentials)
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">Teacher:</span>
              {/* <button
                onClick={() =>
                  handleDemoLogin("khursheedig416@gmail.com", "<HjKh416>")
                }
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Use Demo
              </button> */}
            </div>
            <div className="text-blue-700 font-mono text-xs">
              Gmail: khursheedig416@gmail.com <br></br> Password:
              &lt;HjKh416&gt;
            </div>

            <div className="flex items-center justify-between mt-3">
              <span className="text-blue-800 font-medium">Student:</span>
              {/* <button
                onClick={() =>
                  handleDemoLogin("khursheed65777@gmail.com", "<HjKH416>")
                }
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Use Demo
              </button> */}
            </div>
            <div className="text-blue-700 font-mono text-xs">
              Gmail: khursheed65777@gmail.com <br></br> Password:
              &lt;HjKH416&gt;
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-4"
        >
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-green-600 hover:text-green-800 font-medium"
            >
              Login here
            </Link>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
