
import React from "react";
import { FaQuoteLeft, FaChalkboardTeacher, FaUniversity } from "react-icons/fa";
import { MdOutlineSchool, MdOutlineFeedback } from "react-icons/md";
import { GiTeacher, GiBookshelf } from "react-icons/gi";
import { Link } from 'react-router-dom';


const Testimonials = () => {
  const testimonialsData = [
    {
      quote:
        "This tool has streamlined our grading workflow, allowing educators to focus more on teaching rather than spending hours grading papers.",
      name: "Dr Haris Masood Zuberi",
      title: "University of Management & Technology UMT, Lahore",
    },
    {
      quote:
        "The AI's precision in grading and analyzing answer sheets is simply outstanding. Our students are benefiting from timely and constructive feedback.",
      name: "Dr Ahsan Akram",
      title: "University of Management & Technology UMT, Lahore",
    },
    {
      quote:
        "Grading papers used to be a daunting task. With Smart Grading AI, I can now focus on providing meaningful mentorship to my students.",
      name: "Dr Muhammad Asif",
      title: "School of Systems and Technology, Professor, UMT, Lahore",
    },
  ];

  return (
    <div className="p-8 pb-64 font-sans bg-gradient-to-t from-green-200 to-green-100 text-gray-800">
      {/* Testimonials Section */}
      <div className="text-center mb-12">
      <button className="px-5 py-2 bg-green-300 text-green-600 rounded-3xl text-sm font-urbanist font-bold shadow-md mb-4 cursor-default">
  Testimonials
</button>

<h2 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-urbanist mb-4 sm:mb-6 md:mb-8 text-center sm:text-center">
  What Educators Say About Smart Grading AI
</h2>

      </div>

      {/* Testimonials Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonialsData.map((testimonial, index) => (
          <div
            key={index}
            className="bg-green-50 p-6 rounded-3xl shadow-md flex flex-col items-center text-center"
          >
            <p className="text-gray-700 text-md mb-4">{testimonial.quote}</p>
            <h4 className="font-bold font-urbanist text-lg mb-2">{testimonial.name}</h4>
            <p className="text-sm text-gray-500">{testimonial.title}</p>
          </div>
        ))}
      </div>

      {/* Call to Action Section */}
      {/* <div className="mt-16 bg-green-50 p-8 rounded-lg shadow-lg mb-60">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-urbanist mb-4">
            Ready to Transform Your Grading Process? Get Started Today!
          </h2>
          <p className="text-gray-600 mb-6">
            Leverage AI-powered grading to save time, enhance accuracy, and
            provide insightful feedback. Join leading educational institutions
            in streamlining the grading process.
          </p>
          <Link to='/sign-in'>
          <button className="px-6 py-3 bg-green-500 text-white rounded-3xl shadow-md hover:bg-green-600 transition">
            Get Started Now
          </button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800">500+</h3>
            <p className="text-gray-600">Institutions Served</p>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800">1M+</h3>
            <p className="text-gray-600">Papers Graded</p>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-green-500">98%</h3>
            <p className="text-gray-600">Accuracy Rate</p>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Testimonials;
