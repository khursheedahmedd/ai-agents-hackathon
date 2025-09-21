import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import Smart from "../assets/Logo_Footer.png";

const Footer = () => {
  return (
    <footer className="bg-[#000000] text-white font-urbanist pt-1 pb-8">
      {/* Call to Action Section */}
      {/* <div className="bg-gradient-to-r from-green-100 to-green-50 rounded-2xl p-8 max-w-6xl mx-auto -mt-36 relative shadow-lg text-center">
        <h2 className="text-3xl text-gray-800 font-urbanist mb-4">
          Ready to Transform Your Grading Process? Get Started Today!
        </h2>
        <p className="text-gray-700 mb-6">
          Leverage AI-powered grading to save time, enhance accuracy, and provide insightful feedback.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">500+</h3>
            <p className="text-gray-600">Institutions Served</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">1M+</h3>
            <p className="text-gray-600">Papers Graded</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-green-500">98%</h3>
            <p className="text-gray-600">Accuracy Rate</p>
          </div>
        </div>
        <Link to='/login'>
        <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full text-lg font-medium transition duration-300 shadow-md">
          Get Started
        </button>
        </Link>
      </div> */}

      {/* Footer Content */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Company Section */}
        <div>
          <img 
            src={Smart} 
            alt="Smart Grade AI Logo" 
            className="h-12 w-auto object-contain"
          />
          <p className="text-gray-300 mt-4">
            Check exams in less than a minute with AI-powered accuracy!   
          </p>
          <div className="flex space-x-4 mt-4 text-lg">
            {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube].map((Icon, index) => (
              <Icon key={index} className="hover:text-green-400 cursor-pointer" />
            ))}
          </div>
        </div>

        {/* Quick Links Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-1 text-gray-300">
            <li className="hover:text-white"><Link to="/">Home</Link></li>
            <li className="hover:text-white"><Link to="/upload-paper">Instant Checking</Link></li>
            <li className="hover:text-white"><Link to="/teacher/upload">Bulk Checking</Link></li>
            <li className="hover:text-white"><Link to="/about-us">About Us</Link></li>
          </ul>
        </div>

        {/* Quick Menu Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Menu</h3>
          <ul className="space-y-1 text-gray-300">
            <li className="hover:text-white"><Link to="/team">Our Team</Link></li>
            <li className="hover:text-white"><Link to="/careers">Career</Link></li>
            <li className="hover:text-white"><Link to="/community">Community</Link></li>
            <li className="hover:text-white"><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>

        {/* Smart Grade AI Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Smart Grade AI</h3>
          <ul className="space-y-1 text-gray-300">
            <li className="hover:text-white"><Link to="/ai-exam">AI Exam</Link></li>
            <li className="hover:text-white"><Link to="/ai-checking">AI Checking</Link></li>
            <li className="hover:text-white"><Link to="/ai-research">AI Research</Link></li>
            <li className="hover:text-white"><Link to="/ai-rnd">AI R&D</Link></li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-500 text-center py-4 text-gray-400 text-sm">
        <p>
          &copy; {new Date().getFullYear()} SmartGrade AI | All Rights Reserved | 
          <Link to="/terms-conditions" className="hover:text-white"> Terms & Conditions</Link> | 
          <Link to="/privacy-policy" className="hover:text-white"> Privacy Policy</Link>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
