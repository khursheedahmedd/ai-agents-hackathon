import React from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// New SVG face icons
const FaceIcon = ({ filled }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path 
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" 
      fill={filled ? "#2F855A" : "#CBD5E0"}
    />
  </svg>
);

const theme = {
  colors: {
    primary: "#1A365D",
    secondary: "#2D3748",
    ai: "#2F855A",
    manual: "#718096",
    accent: "#38A169",
    background: "#F0FFF4",
    border: "#E2E8F0"
  },
  spacing: {
    chartHeight: 400,
    margin: { top: 24, right: 32, left: 40, bottom: 24 }
  }
};

export default function Analysis() {
  const data = [
    { category: "Essay", Manual: 45, AI: 10 },
    { category: "MCQs", Manual: 30, AI: 5 },
    { category: "Assignments", Manual: 60, AI: 15 },
    { category: "Research Papers", Manual: 90, AI: 25 },
  ];

  return (
    <div className="font-urbanist bg-gradient-to-t from-green-200 to-green-100 flex flex-col md:flex-row items-center p-6 sm:p-8 md:p-16 animate-fadeIn w-full gap-6 sm:gap-10">
  {/* Left Content */}
  <div className="md:w-1/2 w-full space-y-6 sm:space-y-8 pr-0 md:pr-8">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-4 sm:space-y-6"
    >
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-urbanist text-gray-900 leading-tight">
        <span className="text-gray-900">Transform Assessment </span> 
        <span className="text-green-600">with Smart Grade AI</span>
      </h2>
      
      <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-full sm:max-w-2xl">
        Time efficiency comparison between automated AI grading and manual assessment processes
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Time Saved */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">Time Saved</p>
          </div>
          <p className="text-xl sm:text-2xl font-urbanist text-gray-900">78%</p>
        </div>

        {/* Accuracy Rate */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">Accuracy Rate</p>
          </div>
          <p className="text-xl sm:text-2xl font-urbanist text-gray-900">99.2%</p>
        </div>
      </div>

      {/* Educator Verified Card */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
  <div className="flex items-start gap-4">
    {/* Verification Badge */}
    <div className="flex-shrink-0 mt-1">
      <svg 
        className="w-6 h-6 text-green-600" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
    </div>

    {/* Content */}
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-gray-900">Educator Verified</h3>
      <p className="text-sm text-gray-600 mt-2">
        Trusted by educators and academic institutions worldwide
      </p>
      <p className="text-xs text-gray-500 mt-3">
        Verified profiles from accredited institutions
      </p>
    </div>
  </div>
</div>
    </motion.div>
  </div>
  {/* Chart Section */}
  <motion.div 

  className="w-full md:w-3/4 lg:w-2/ bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden lg:p-10 lg:h-[500px]"

  initial={{ opacity: 0, x: 50 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.8, delay: 0.2 }}
>
  <div className="p-6 sm:p-8 lg:p-12">
    <h3 className="text-lg sm:text-2xl lg:text-3xl font-urbanist text-gray-900 mb-2">
      Grading Efficiency Analysis
    </h3>
    <p className="text-sm sm:text-base lg:text-lg text-gray-500">
      Time investment comparison per 100 submissions (in minutes)
    </p>

    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" tick={{ fontSize: 14 }} />
        <YAxis tickFormatter={(value) => `${value}m`} tick={{ fontSize: 14 }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Manual" stroke="#D97706" strokeWidth={3} />
        <Line type="monotone" dataKey="AI" stroke="#059669" strokeWidth={4} />
      </LineChart>
    </ResponsiveContainer>
  </div>
</motion.div>

</div>

  );
}