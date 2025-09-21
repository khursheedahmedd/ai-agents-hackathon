import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify"; // Import Toastify
import { FiX, FiBookOpen, FiUsers, FiHash } from "react-icons/fi";
import "react-toastify/dist/ReactToastify.css"; // Import Toastify styles

const CreateClass = ({ teacherEmail, onClassCreated, onClose }) => {
  const [className, setClassName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [classId, setClassId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_NODE_SERVER_URL}/api/addClass`,
        {
          className,
          capacity,
          classId,
          teacherEmail,
        }
      );

      if (response.status === 201) {
        toast.success("Class created successfully!");
        onClassCreated(); // Notify parent to refresh the class list
        // Reset form
        setClassName("");
        setCapacity("");
        setClassId("");
        // Close modal
        onClose();
      }
    } catch (err) {
      console.error("Error creating class:", err);
      setError("Failed to create class. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setClassName("");
    setCapacity("");
    setClassId("");
    setError(null);
    // Close modal
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={handleCancel}
      >
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg text-white">
                <FiBookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Create New Class
              </h2>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <FiX className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <InputField
              label="Class Name"
              value={className}
              onChange={setClassName}
              required
              icon={<FiBookOpen className="w-5 h-5" />}
            />
            <InputField
              label="Capacity"
              type="number"
              value={capacity}
              onChange={setCapacity}
              required
              icon={<FiUsers className="w-5 h-5" />}
            />
            <InputField
              label="Class ID"
              value={classId}
              onChange={setClassId}
              required
              icon={<FiHash className="w-5 h-5" />}
            />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </div>
                ) : (
                  "Create Class"
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  required,
  icon,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 ${
          icon ? "pl-10" : ""
        }`}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </div>
  </div>
);

export default CreateClass;
