import { useState } from "react";
import { motion } from "framer-motion";

const stepsData = [
  {
    id: "01",
    title: "Upload Assignments & Tests",
    description:
      "Easily upload student assignments, quizzes, or exams directly onto our platform for seamless processing.",
    image: "/images/upload.png",
  },
  {
    id: "02",
    title: "AI-Powered Grading",
    description:
      "Our advanced AI automatically evaluates submissions, ensuring accuracy, fairness, and efficiency.",
    image: "/images/ai-grading.png",
  },
  {
    id: "03",
    title: "Provide Personalized Feedback",
    description:
      "Get AI-generated insights and feedback suggestions to help students improve their learning outcomes.",
    image: "/images/feedback.png",
  },
  {
    id: "04",
    title: "Generate Reports & Insights",
    description:
      "Easily generate performance analytics and reports to track student progress over time.",
    image: "/images/reports.png",
  },
  {
    id: "05",
    title: "Export & Share Results",
    description:
      "Download detailed grading reports or directly integrate results with your LMS for streamlined academic management.",
    image: "/images/export.png",
  },
];


export default function VideoCreationSteps() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="bg-gradient-to-b from-green-100  to-green-200 py-20">
      <div className="flex flex-col items-center text-center p-10 md:p-20 my-20  w-full max-w-7xl mx-auto font-urbanist rounded-3xl bg-green-300 relative">
        {/* Section Titles */}
        <motion.div
          className="rounded-3xl bg-green-500 py-2 px-6 mb-4 inline-block"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h4 className="text-lg font-medium text-green-100 uppercase tracking-wider">
            How It Works
          </h4>
        </motion.div>
        <motion.h2
          className="text-3xl s md:text-4xl font-urbanist mb-10 leading-tight"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
Grade smarter with SmartGrade AI—just <br></br><span className="text-green-600">upload</span> & get results in less than a minute!        </motion.h2>

        {/* Steps Section */}
        <div className="flex flex-col md:flex-row items-center w-full gap-10 md:gap-16">
          {/* Left Side - Image */}
          <div className="w-full md:w-1/2 flex justify-center">
            <motion.img
              key={stepsData[activeStep].image}
              src={stepsData[activeStep].image}
              alt={stepsData[activeStep].title}
              className="w-64 h-64 md:w-96 md:h-96 rounded-lg shadow-md"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          {/* Right Side - Steps Content */}
          <div className="w-full md:w-1/2 flex flex-col gap-8 md:gap-12 text-left relative">
            {stepsData.map((step, index) => (
              <motion.div
                key={step.id}
                className={`relative flex items-start gap-4 md:gap-6 cursor-pointer transition-all ${
                  activeStep === index ? "text-green-500" : "text-gray-600"
                }`}
                onClick={() => setActiveStep(index)}
                transition={{ duration: 0.3 }}
              >
                {/* Step Number */}
                <motion.span
                  className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full aspect-square text-lg md:text-xl font-bold transition-all ${
                    activeStep === index
                      ? "bg-green-500 text-white scale-110 shadow-lg"
                      : "bg-green-200 text-gray-700"
                  }`}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: activeStep === index ? 1.2 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {step.id}
                </motion.span>
                {/* Step Content */}
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold">{step.title}</h3>
                  <p className="text-gray-600 mt-2 text-sm md:text-base">{step.description}</p>
                </div>

                {/* Progress Line Between Steps */}
                {index < stepsData.length - 1 && (
                  <motion.div
                    className="absolute left-6 md:left-7 top-14 md:top-16 w-1 h-12 md:h-16 bg-transparent"
                    initial={{ height: 0 }}
                    animate={{
                      height: activeStep > index ? "100%" : "50%",
                      opacity: activeStep === index ? 1 : 0.5,
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-0 h-full border-l-2 border-dashed border-green-500"></div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}