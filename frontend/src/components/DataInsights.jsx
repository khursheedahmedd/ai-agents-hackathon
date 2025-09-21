import React from 'react';
import { FaTachometerAlt, FaSync } from 'react-icons/fa';
import D2 from '../assets/D2.jpg'; // Adjust the path as needed based on your project structure

const DataInsights = () => {
  return (
    <div className="flex flex-col md:flex-row items-center bg-gradient-to-t from-green-100  to-green-200 p-8 rounded-lg shadow-md ">
      {/* Left Section */}
      <div className="md:w-1/2 flex flex-col items-center md:items-start mb-6 md:mb-0">
  <img
    src={D2}
    alt="Smart Grading AI Dashboard"
    className="rounded-3xl shadow-md max-w-[85%] h-auto mb-6 border-4 border-gray-600"
  />
</div>

      {/* Right Section */}
      <div className="md:w-1/2 text-center md:text-left md:pl-6">
        <span className="inline-block bg-green-300 text-green-600 font-bold py-2 px-6 rounded-full text-sm uppercase mb-4">
          Data-Driven Insights
        </span>
        <h1 className="text-4xl sm:text-3xl md:text-4xl font-urbanist text-gray-800 leading-tight mb-4">
          Gain actionable insights to improve student performance
        </h1>
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          Our AI-powered grading system provides comprehensive analytics on student performance,
          enabling educators to identify strengths, weaknesses, and trends effortlessly.
        </p>
        <div className="flex flex-col md:flex-row md:space-x-6">
          {/* Performance Analytics */}
          <div className="flex items-start space-x-4 mb-6 md:mb-0">
            <div className="flex-shrink-0">
              <FaTachometerAlt className="text-white bg-gray-800 rounded-lg p-4 text-5xl sm:text-6xl" />
            </div>
            <div className="text-left">
              <h4 className="font-urbanist font-bold text-gray-800 text-sm sm:text-base">
                Performance Analytics
              </h4>
              <p className="text-xs sm:text-sm text-gray-600">
                Track student progress over time with detailed analytics and visual reports.
              </p>
            </div>
          </div>
          {/* Automated Reports */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <FaSync className="text-white bg-gray-800 rounded-lg p-4 text-5xl sm:text-6xl" />
            </div>
            <div className="text-left">
              <h4 className="font-urbanist font-bold text-gray-800 text-sm sm:text-base">
                Automated Reports
              </h4>
              <p className="text-xs sm:text-sm text-gray-600">
                Generate insightful reports on student assessments with just a few clicks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataInsights;
