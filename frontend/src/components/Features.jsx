import React from 'react';
import { FaClock, FaProjectDiagram, FaChartLine, FaTools, FaUserAlt, FaSyncAlt } from 'react-icons/fa';

const Features = () => {
  return (
    <div className="p-8 font-sans bg-gradient-to-t from-green-100 to-green-200 text-gray-800 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Section */}
      <div className="flex flex-col justify-center relative">
        <button className="absolute sm:top-40 hidden left-1/2 transform -translate-x-1/2 px-4 py-1 bg-green-400 text-white rounded-3xl text-sm font-medium shadow-md">
          Features
        </button>

        <h2 className="text-4xl font-urbanist mb-6 sm:text-4xl">
          Empowering Educators with Smart Grading
        </h2>
        <p className="text-lg font-urbanist mb-8 sm:text-base">
          Smart Grading AI offers a comprehensive suite of features designed to simplify grading,
          enhance accuracy, and provide valuable insights for educators. Discover how our solution can revolutionize your assessment process:
        </p>
        <button className="px-6 py-3 border border-black rounded-3xl hover:bg-black hover:text-white transition duration-300 w-fit sm:w-full">
          Learn more about all features
        </button>
      </div>

      {/* Right Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 text-center">
          <FaClock className="text-4xl text-gray-700 mb-4 mx-auto sm:text-3xl" />
          <h3 className="text-xl text-left font-urbanist mb-2 sm:text-lg">
            Real-Time Grading Insights
          </h3>
          <p className="text-gray-700 font-urbanist text-left">
            Get instant insights into student performance with real-time grading analytics, allowing for timely feedback and improved learning outcomes.
          </p>
        </div>

        <div className="p-6 text-center">
          <FaProjectDiagram className="text-4xl text-gray-700 mb-4 mx-auto sm:text-3xl" />
          <h3 className="text-2xl text-left font-urbanist mb-2 sm:text-xl">
            Intuitive Answer Evaluation
          </h3>
          <p className="text-gray-700 font-urbanist text-left">
            Our AI understands student responses intelligently, ensuring fair and accurate grading across different subjects and formats.
          </p>
        </div>

        <div className="p-6 text-center">
          <FaChartLine className="text-4xl text-gray-700 mb-4 mx-auto sm:text-3xl" />
          <h3 className="text-2xl text-left font-urbanist mb-2 sm:text-xl">
            Performance Analytics Dashboard
          </h3>
          <p className="text-gray-700 font-urbanist text-left">
            Track student progress over time with our visual analytics dashboard, helping educators identify trends and areas for improvement.
          </p>
        </div>

        <div className="p-6 text-center">
          <FaTools className="text-4xl text-gray-700 mb-4 mx-auto sm:text-3xl" />
          <h3 className="text-2xl text-left font-urbanist mb-2 sm:text-xl">
            Customizable Grading Criteria
          </h3>
          <p className="text-gray-700 font-urbanist text-left">
            Adapt grading parameters to fit your specific needs, ensuring personalized and consistent assessment standards.
          </p>
        </div>

        <div className="p-6 text-center">
          <FaUserAlt className="text-4xl text-gray-700 mb-4 mx-auto sm:text-3xl" />
          <h3 className="text-2xl text-left font-urbanist mb-2 sm:text-xl">
            User-Friendly Interface
          </h3>
          <p className="text-gray-700 font-urbanist text-left">
            Our intuitive design makes it easy for educators to navigate, grade assignments efficiently, and generate reports effortlessly.
          </p>
        </div>

        <div className="p-6 text-center">
          <FaSyncAlt className="text-4xl text-gray-700 mb-4 mx-auto sm:text-3xl" />
          <h3 className="text-2xl text-left font-urbanist mb-2 sm:text-xl">
            Continuous System Updates
          </h3>
          <p className="text-gray-700 font-urbanist text-left">
            Stay ahead with regular updates that introduce new features and enhancements, ensuring the best user experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Features;
