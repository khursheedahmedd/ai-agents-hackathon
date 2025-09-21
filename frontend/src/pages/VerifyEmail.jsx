import { useState } from "react";
import { useSignUp, useClerk } from "@clerk/clerk-react"; // Changed to useClerk
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import axios from "axios";

export default function VerifyEmail() {
  const { isLoaded, signUp } = useSignUp();
  const { setActive } = useClerk(); // Get from useClerk
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { getToken, signOut } = useAuth();
  const { user } = useUser();



  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!isLoaded) return;

      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === "complete") {
        // Proper session activation
        await setActive({ session: result.createdSessionId });
        try {
          const token = await getToken();

          // Fetch user role from backend
          const response = await axios.get(
            `${import.meta.env.VITE_NODE_SERVER_URL}/api/users/me`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // Validate role exists in response
          if (!response.data?.role) {
            throw new Error("Role not found in backend response");
          }

          console.log("User role:", response.data.role);
          if (response.data.role === "teacher") {
            navigate("/teacher-dashboard");
          } else {
            navigate("/student-dashboard");
          }
        } catch (error) {
          console.error("Verification error:", error);
        }
      }
    } catch (err) {
      setError(err?.errors?.[0]?.message || "Verification failed");
      console.error("Verification error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await signUp.prepareEmailAddressVerification();
    } catch (error) {
      setError("Failed to resend code. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 flex items-center justify-center"
    >
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Verify Email
          </h2>
          <p className="text-gray-600">
            Check your email for the verification code
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter 6-digit code"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 bg-green-500 hover:bg-green-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white  ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={handleResend}
            className="text-green-600 hover:text-green-800  text-sm font-medium"
          >
            Resend Code
          </button>
        </div>
      </div>
    </motion.div>
  );
}
