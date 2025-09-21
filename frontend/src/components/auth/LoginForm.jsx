import { motion } from "framer-motion";
import { useSignIn } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useClerk, useUser, useAuth } from "@clerk/clerk-react";
import axios from "axios";

export default function LoginForm({ demoCredentials }) {
  const { signIn } = useSignIn();
  const [email, setEmail] = useState(demoCredentials?.email || "");
  const [password, setPassword] = useState(demoCredentials?.password || "");
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();
  const { setActive } = useClerk();
  const { user } = useUser();
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();

  // Update form fields when demo credentials change
  useEffect(() => {
    if (demoCredentials) {
      setEmail(demoCredentials.email);
      setPassword(demoCredentials.password);
    }
  }, [demoCredentials]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        // Set the active session
        await setActive({ session: result.createdSessionId });
        console.log("Session activated");
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
      console.error("Login error:", err);
    } finally {
      setLoading(false); // Reset loading to false
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <motion.input
          whileFocus={{ scale: 1.02 }}
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <motion.input
          whileFocus={{ scale: 1.02 }}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={loading} // Disable button when loading
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600 "
        }`}
      >
        {loading ? "Signing in..." : "Sign in"}
      </motion.button>
    </motion.form>
  );
}
