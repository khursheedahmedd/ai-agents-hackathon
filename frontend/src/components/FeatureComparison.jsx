import React from 'react';

const FeatureComparison = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-20 font-sans">
      {/* Header Section */}
      <div className="text-center mb-8 md:mb-16">
        <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-900 mb-4">
          Transform Grading with{' '}
          <span className="text-green-400 inline-block md:whitespace-nowrap">SmartGrade AI</span>
        </h1>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mt-4 md:mt-8">
          <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full w-full sm:w-auto justify-center cursor-default">
            <svg className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs sm:text-sm font-medium text-gray-700">Manual Grading</span>
          </div>
          <span className="text-gray-400 text-sm sm:text-lg">vs</span>
          <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-green-100 w-full sm:w-auto justify-center cursor-default">
            <svg className="h-4 w-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs sm:text-sm font-medium text-green-700">AI Solution</span>
          </div>
        </div>
      </div>

      {/* Enhanced Features Table */}
      <div className="mb-8 md:mb-16">
        <div className="bg-white rounded-lg shadow-xs overflow-hidden border border-gray-100">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-12 items-center gap-2 px-3 sm:px-4 md:px-6 py-3 md:py-4 bg-gray-50 cursor-default">
            <div className="col-span-8 text-xs font-medium text-gray-700 tracking-wider">
              Assessment Features
            </div>
            <div className="col-span-2 text-center text-xs font-medium text-gray-700 tracking-wider">
              Manual
            </div>
            <div className="col-span-2 text-center text-xs font-medium text-gray-700 tracking-wider">
              SmartGrade
            </div>
          </div>

          {/* Feature Rows */}
          {[
            'Bulk exam processing',
            'Automated grading reports',
            'Detailed feedback generation',
            'Real-time results delivery',
            'Bias-free evaluation',
          ].map((feature) => (
            <div 
              key={feature}
              className="grid grid-cols-12 items-center gap-2 px-3 sm:px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-default"
            >
              <div className="col-span-8 sm:col-span-8 text-sm text-gray-700 font-medium break-words">
                {feature}
              </div>
              <div className="col-span-2 sm:col-span-2 text-center">
                <span className="text-gray-500 text-lg sm:text-xl">×</span>
              </div>
              <div className="col-span-2 sm:col-span-2 text-center">
                <span className="text-green-600 text-lg sm:text-xl">✓</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 md:mb-12 cursor-default">
        <div className="md:col-span-2 text-center md:text-left mb-4 md:mb-0">
          <div className="text-lg sm:text-xl md:text-3xl font-semibold text-gray-900 leading-tight">
            Helping Teachers
            <br className="hidden md:block" />
            Focus on Teaching
          </div>
        </div>

        <div className="md:col-span-3 grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          {[
            { value: '95%', label: 'Accuracy Rate' },
            { value: '9.5h', label: 'Weekly Saving' },
            { value: '11s', label: 'Per Exam' },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-2">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1">
                {stat.value}
              </div>
              <div className="text-[0.65rem] sm:text-xs text-gray-500 font-medium uppercase tracking-wide leading-tight">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <button className="bg-green-400 text-gray-900 px-4 py-2 sm:px-6 sm:py-3 rounded-full 
          hover:bg-green-500 transition-all duration-200 text-sm sm:text-base font-semibold
          flex items-center gap-2 mx-auto shadow-sm hover:shadow-md
          focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2">
          Explore Efficiency
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FeatureComparison;