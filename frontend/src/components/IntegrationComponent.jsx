import React from 'react';
import { FaTools, FaChartLine, FaUsers } from 'react-icons/fa'; // Correct icons
import D4 from '../assets/D4.jpg'; // Adjust the path as needed based on your project structure

const IntegrationComponent = () => {
  return (
    <div className="p-8 bg-gradient-to-t from-green-200 to-green-100 rounded-lg space-y-8">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row items-center bg-green-200 rounded-lg shadow-md p-6 space-y-6 md:space-y-0 md:space-x-6">
        <div className="md:w-1/2 w-full">
          <span className="text-green-600 bg-green-300 font-bold py-2 px-4 rounded-full text-sm uppercase mb-4 inline-block">
            <FaTools className="inline-block mr-2" /> Seamless Integration
          </span>
          <h2 className="text-4xl font-urbanist text-gray-800 leading-tight mb-4">
            Connect Smart Grading AI with your existing platforms effortlessly.
          </h2>
          <p className="text-gray-600 font-urbanist text-md mb-7">
            Our AI-powered grading solution integrates seamlessly with your LMS, student information systems, and other educational tools, providing a hassle-free experience.
          </p>
          <a href="#" className="text-green-600 font-bold">
            Explore Integrations &rarr;
          </a>
        </div>
        <div className="md:w-1/2 w-full flex justify-center">
          <img
            src={D4}
            alt="Integration visualization"
            className="rounded-3xl shadow-lg max-w-auto h-72"
          />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Data-Driven Insights Card */}
        <div className="bg-green-200 rounded-lg shadow-md p-6">
          <span className="text-green-600 bg-green-300 font-bold py-1 px-3 rounded-full text-sm uppercase mb-4 inline-block">
            <FaChartLine className="inline-block mr-2" /> Performance Insights
          </span>
          <h3 className="text-4xl font-urbanist text-gray-800 mb-4">Actionable Analytics for Educators</h3>
          <p className="text-gray-600 font-urbanist text-md md mb-7">
            Get real-time analytics and performance trends to help you make data-driven decisions and improve student learning outcomes.
          </p>
        </div>

        {/* Collaboration Tools Card */}
        <div className="bg-green-200 rounded-lg shadow-md p-6">
          <span className="text-green-600 bg-green-300 font-bold py-1 px-3 rounded-full text-sm uppercase mb-4 inline-block">
            <FaUsers className="inline-block mr-2" /> Collaborative Grading
          </span>
          <h3 className="text-4xl font-urbanist text-gray-800 mb-4">Efficient Team Collaboration</h3>
          <p className="text-gray-600 font-urbanist text-md mb-4">
            Enable multiple educators to work together on grading with shared access and real-time updates, ensuring consistency across evaluations.
          </p>
          <div className="flex space-x-4">
            {/* Placeholder for team member details */}
            {/* These can be uncommented when ready to display team members */}
            {/* <div className="flex flex-col items-center">
              <img
                src="https://via.placeholder.com/40"
                alt="John Doe"
                className="w-12 h-12 rounded-full mb-2"
              />
              <p className="text-gray-800 font-bold text-sm">John Doe</p>
              <p className="text-gray-600 text-xs">Lead Instructor</p>
            </div>
            <div className="flex flex-col items-center">
              <img
                src="https://via.placeholder.com/40"
                alt="Alice Brown"
                className="w-12 h-12 rounded-full mb-2"
              />
              <p className="text-gray-800 font-bold text-sm">Alice Brown</p>
              <p className="text-gray-600 text-xs">Academic Coordinator</p>
            </div>
            <div className="flex flex-col items-center">
              <img
                src="https://via.placeholder.com/40"
                alt="Michael Lee"
                className="w-12 h-12 rounded-full mb-2"
              />
              <p className="text-gray-800 font-bold text-sm">Michael Lee</p>
              <p className="text-gray-600 text-xs">Teaching Assistant</p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationComponent;
