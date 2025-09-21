// import React from "react";
// import { Link } from 'react-router-dom';
// function HeroSection() {
//   return (
//     <div className="pt-44 lg:pt-40 md:p-6 bg-gradient-to-b lg:py-36 from-[#E6FAE6] to-[#CCFFCC] flex flex-col shadow-none items-center relative overflow-hidden">
//       {/* Background Rings */}
//       <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
//         {[...Array(15)].map((_, index) => (
//           <div
//             key={index}
//             className={`absolute rounded-full ${index % 2 === 0
//                 ? "bg-gradient-to-r from-green-500 via-green-500 to-green-300"
//                 : "bg-gradient-to-r from-green-100 via-green-50 to-green-100"
//               }`}
//             style={{
//               width: `${(index + 1) * 10}rem`,
//               height: `${(index + 1) * 10}rem`,
//               opacity: 0.5 - index * 0.03,
//             }}
//           />
//         ))}
//       </div>

//       {/* Header Section */}
//       <section className="text-center py-12 sm:py-16 md:py-20 lg:py-20 z-10 relative px-4 sm:px-6">
//   <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] text-gray-900 font-urbanist font-medium leading-snug">
//     Welcome to SmartGrade AI
//   </h1>

//   <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 mt-4">
//     Transform the way you evaluate and analyze handwritten documents. SmartGrade AI leverages <br className="hidden md:block" /> advanced machine learning to make grading smarter, faster, and more accurate every time.
//   </p>

//   <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3">
//     <input
//       type="email"
//       placeholder="Enter your email"
//       className="border border-gray-300 px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-full focus:outline-none w-full sm:w-80 shadow-sm text-gray-700"
//     />
//     <Link to='/login'>
//       <button className="bg-green-500 text-white px-6 py-2 sm:px-8 sm:py-3 md:px-10 md:py-4 rounded-full hover:bg-green-600 shadow-md font-medium">
//         Try for Free
//       </button>
//     </Link>
//   </div>

//   <p className="text-gray-600 mt-4 text-sm sm:text-base md:text-lg">
//     Powerful, yet simple. Tools for everyone. <span className="font-semibold text-green-500">100% Accurate.</span>
//   </p>
// </section>




//       {/* Main Content */}
//       {/* <div className="w-full max-w-6xl bg-white border-8 border-black rounded-3xl shadow-md p-4 md:p-6 mt-6 md:mt-10 min-h-[600px] z-10 relative"> */}
//         {/* Main Header */}
//         {/* <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4 px-4 sm:px-6">
//           <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Your Sales Analysis</h1>
//           <div className="flex flex-col sm:flex-row gap-3">
//             <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2">
//               <span className="text-gray-500 text-sm">Date:</span>
//               <span className="ml-2 font-medium text-gray-700 text-sm">28 Jan - 29 Jan 2023</span>
//             </div>
//             <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">Export as CSV</button>
//           </div>
//         </div> */}

//         {/* Stats Section */}
//         {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 sm:px-6">
//           {[ 
//             { title: "Available to Payout", value: "$16.4K", description: "Payout: $6.1K will be available soon", bg: "bg-black", text: "text-white" },
//             { title: "Today Revenue", value: "$6.4K", description: "Payout: $6.1K will be available soon", bg: "bg-gray-100", text: "text-black" },
//             { title: "Today Sessions", value: "400", description: "Payout: $6.1K will be available soon", bg: "bg-gray-100", text: "text-black" },
//           ].map((stat, index) => (
//             <div key={index} className={`${stat.bg} ${stat.text} p-6 rounded-lg relative`}>
//               <h2 className="text-lg font-medium">{stat.title}</h2>
//               <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
//               <p className="text-sm mt-2">{stat.description}</p>
//               <button className="absolute top-4 right-4 bg-white text-black p-2 rounded-full hover:bg-gray-200">→</button>
//             </div>
//           ))}
//         </div> */}

//         {/* Charts Section */}
//         {/* <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-6">
//           {[ 
//             { title: "Sales Funnel", description: "Total view per month" },
//             { title: "Orders", description: "Based on social media" },
//           ].map((chart, index) => (
//             <div key={index} className="bg-gray-100 p-6 rounded-lg">
//               <h2 className="text-lg font-medium">{chart.title}</h2>
//               <p className="text-sm text-gray-600">{chart.description}</p>
//               <div className="h-40 bg-gray-300 rounded-lg mt-4 flex items-center justify-center">
//                 Chart Placeholder
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>*/}
//     </div> 
//   );
// }

// export default HeroSection;

import { useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Image from '../assets/Mask group.png';

const HeroSection = () => {
  const heroRef = useRef(null);
  const tl = useRef();

  useGSAP(() => {
    tl.current = gsap.timeline()
      .from(".hero-content", {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power4.out"
      })
      .from(".hero-image", {
        scale: 0.95,
        opacity: 0,
        duration: 1.2,
        ease: "expo.out"
      }, "-=0.5");
  }, { scope: heroRef });

  return (
    <section ref={heroRef} className="relative py-32  md:py-44 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Text Content */}
        <div className="w-full text-center mb-12 md:mb-16 space-y-6 hero-content font-sans">
  <motion.h1 
    className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
    whileHover={{ scale: 1.02 }}
  >
    <span className="block">
      Check Any <span className="text-green-400">Exam</span>
    </span>
    <span className="block">
      In Less Than A Minute
    </span>
  </motion.h1>

  <motion.div 
    className="max-w-2xl mx-auto"
    whileHover={{ scale: 1.01 }}
  >
    <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
      Smartgrade AI transforms the way you evaluate and analyze exams making grading{' '}
      <span className="text-green-400">smarter,</span>{' '}
      <span className="text-green-400">faster, and</span> {' '}
      <span className="text-green-400">accurate</span> every time.
    </p>
  </motion.div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 mt-8 md:mt-12">
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="bg-gray-200 text-gray-800 px-6 md:px-8 py-1 md:py-2 rounded-3xl text-base md:text-lg font-semibold shadow-lg transition-all"
            >
              Request Demo
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="border-2 bg-green-400  border-green-300 text-gray-900 px-6 md:px-8 py-1 md:py-2 rounded-3xl text-base md:text-lg font-semibold transition-all"
            >
              Start Grading
            </motion.button>
          </div>
        </div>

        {/* Image Container */}
        <motion.div 
          className="hero-image w-full max-w-6xl mt-12 md:mt-16  rounded-xl overflow-hidden"
        >
          <img 
            src='https://media.istockphoto.com/id/1992829688/photo/close-up-on-a-teacher-grading-an-educational-exam.jpg?s=612x612&w=0&k=20&c=v2XjgZ3pH9KNxbAh-QKJaVnaWwGpZhZrcE-hManBfhY='
            alt="AI Grading Interface"
            className="w-full h-auto object-cover object-center"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
