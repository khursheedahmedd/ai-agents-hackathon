import React from 'react';
import Img from '../assets/Rectangle 54.png';
import pic1 from '../assets/pic1.jpg';
import pic2 from '../assets/pic2.jpg';

const WhySmartGrade = () => {
  const features = [
    {
      title: "Save Time with",
      highlight: "Automated Grading",
      description: "Smart Grading AI uses latest AI technology to analyze answer sheets with unmatched accuracy, saving educators time and ensuring unbiased grading.",
      image: Img
    },
    {
      title: "Customizable",
      highlight: "Grading Criteria",
      description: "Define your own grading rubrics and criteria with, allowing for personalized evaluation styles that suit different subjects and difficulty levels.",
      image: pic1,
      reverse: true,
    },
    {
      title: "Store and Retrieve",
      highlight: "Student Records",
      description: "Easily store the student exam records online and export reports in all commonly supported formats (CSV, PSF, Excel)",
      image: pic2
    },
  ];

  return (
    <div className="bg-gray-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 font-sans">
      {/* Top Section */}
      <div className="text-center mb-8 md:mb-16">
        <button className="rounded-full px-4 py-1.5 md:px-6 md:py-2 bg-green-400 text-gray-800 text-sm font-bold mb-4 md:mb-8 hover:bg-green-400 transition-colors">
          For Educators, By Educators
        </button>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
          Why Smartgrade.ai?
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Grading exams manually can be time-consuming and inconsistent. Here are three compelling reasons why our AI-driven grading platform is the ideal solution for modern educators.
        </p>
      </div>

      {/* Feature Sections */}
      {features.map((feature, index) => (
        <div 
          key={index}
          className={`flex flex-col ${feature.reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-6 md:gap-12 lg:gap-60 mb-12 md:mb-24`}
        >
          {/* Text Content */}
          <div className="w-full md:w-7/12 lg:w-1/2 px-4 sm:px-6 md:px-0 md:mx-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              <span className="block">{feature.title}</span>
              <span className="block text-green-400">{feature.highlight}</span>
            </h2>
            <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 leading-relaxed">
              {feature.description}
            </p>
            <button className="bg-green-400 text-black px-4 py-2 md:px-6 md:py-3 rounded-3xl font-semibold hover:bg-green-500 transition-colors flex items-center gap-2">
              Learn More
              <svg 
                className="w-4 h-4"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </button>
          </div>

          {/* Image */}
          <div className={`w-full md:w-5/12 lg:w-1/2 px-4 sm:px-6 md:px-0 ${index === 1 ? 'md:mr-14' : ''}`}>
            <img
              src={feature.image}
              alt={feature.title}
              className="rounded-xl shadow-lg w-full h-auto max-w-full md:max-w-[400px] mx-auto"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default WhySmartGrade;