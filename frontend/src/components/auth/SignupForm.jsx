// components/Auth/SignupForm.jsx
import { motion } from "framer-motion";
import { useSignUp } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SignupForm({ demoCredentials }) {
  const { isLoaded, signUp } = useSignUp();
  const [email, setEmail] = useState(demoCredentials?.email || "");
  const [firstName, setFirstName] = useState(demoCredentials?.firstName || "");
  const [lastName, setLastName] = useState(demoCredentials?.lastName || "");
  const [password, setPassword] = useState(demoCredentials?.password || "");
  const [role, setRole] = useState(demoCredentials?.role || "");
  const navigate = useNavigate();

  // Update form fields when demo credentials change
  useEffect(() => {
    if (demoCredentials) {
      setEmail(demoCredentials.email);
      setFirstName(demoCredentials.firstName || "Demo");
      setLastName(demoCredentials.lastName || "User");
      setPassword(demoCredentials.password);
      setRole(demoCredentials.role);
    }
  }, [demoCredentials]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      await signUp.create({
        email_address: email,
        password,
        first_name: firstName,
        last_name: lastName,
        // Add optional fields if needed
        public_metadata: { role },

        // Add required fields if needed
        username: `${email.split("@")[0]}_${Date.now().toString().slice(-4)}`,
      });

      // Force complete the sign-up
      await signUp.update({
        unsafeMetadata: {
          role: role,
        },
      });

      await signUp.prepareEmailAddressVerification();
      navigate("/verify-email");
    } catch (err) {
      console.error("Signup error:", err);
      // Handle specific Clerk errors
      if (err.errors?.[0]?.code === "form_identifier_exists") {
        alert("Email already registered");
      }
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
          First Name
        </label>
        <input
          type="name"
          onChange={(e) => setFirstName(e.target.value)}
          className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Last Name
        </label>
        <input
          type="name"
          onChange={(e) => setLastName(e.target.value)}
          className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Role</label>
        <select
          required
          onChange={(e) => setRole(e.target.value)}
          className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Please Select one</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        className="w-full p-2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 "
      >
        Create Account
      </motion.button>
    </motion.form>
  );
}
