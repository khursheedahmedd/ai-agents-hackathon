import React from "react";

const WhyUs = () => {
  const cards = [
    {
      id: 1,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-16 h-16 text-black"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 12l2 2l4-4" />
          <path d="M21 12a9 9 0 1 1-9-9" />
        </svg>
      ),
      title: "Automated Grading with AI Precision",
      description:
        "Smart Grading AI leverages advanced machine learning algorithms to analyze answer sheets with unmatched accuracy, saving educators time and ensuring unbiased grading.",
    },
    {
      id: 2,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-16 h-16 text-black"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 6h16" />
          <path d="M4 12h8m-8 6h16" />
          <path d="M8 8v8" />
        </svg>
      ),
      title: "Customizable Grading Criteria",
      description:
        "Define your own grading rubrics and criteria with our flexible AI, allowing for personalized evaluation styles that suit different subjects and difficulty levels.",
    },
    {
      id: 3,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-16 h-16 text-black"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12h3m12 0h3" />
          <circle cx="12" cy="12" r="9" />
          <path d="M10 16v-8l4 8v-8" />
        </svg>
      ),
      title: "Seamless Integration & Accessibility",
      description:
        "Easily integrate Smart Grading AI with existing LMS platforms and access it from anywhere, enabling hassle-free grading for educators and institutions alike.",
    },
  ];
  return (
    <section className="py-16 bg-gradient-to-t from-green-100 to-green-200">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header and Description */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 space-y-6 md:space-y-0">
          {/* Left Header Section */}
          <div className="w-full md:w-1/2 p-4 text-left">
            <span className="text-green-600 bg-green-300 font-bold py-2 px-8 rounded-full text-sm uppercase mb-4 inline-block">
              Why Us
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl text-gray-800 leading-snug font-urbanist">
              <span>Why Choose</span> <br />
              <span>Smart Grade AI?</span>
            </h2>
          </div>
          {/* Right Paragraph Section */}
          <p className="text-gray-600 flex lg:pt-16 text-lg sm:text-xl pt-6 md:pt-0 md:w-1/2 leading-relaxed font-urbanist">
            Grading exams manually can be time-consuming and inconsistent. Here
            are three compelling reasons why our AI-driven grading platform is the
            ideal solution for modern educators.
          </p>
        </div>
        {/* Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card) => (
            <div
              key={card.id}
              className="max-w-sm mx-auto bg-gradient-to-br from-green-100 to-green-200 rounded-3xl shadow-lg p-8 text-left flex flex-col min-h-[390px] transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl hover:bg-gradient-to-br hover:from-green-200 hover:to-green-300"
            >
              <div className="flex flex-col items-left mb-4">
                {/* Icon at the top */}
                <div className="mb-4">{card.icon}</div>
                {/* Title below the icon */}
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 font-urbanist">
                  {card.title}
                </h3>
              </div>
              {/* Card description */}
              <p className="text-gray-600 text-base font-urbanist mt-4">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
