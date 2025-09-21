// src/pages/Unauthorized.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 flex items-center justify-center"
    >
      <div className="text-center">
        <motion.h1
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-9xl font-bold text-indigo-600 mb-4"
        >
          403
        </motion.h1>
        <p className="text-2xl text-gray-600 mb-8">
          You don't have permission to access this page
        </p>
        <motion.div whileHover={{ scale: 1.05 }}>
          <Link
            to="/"
            className="inline-block px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Return to Home
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}