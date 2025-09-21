import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Img from '../assets/Mask.png';
import pics1 from '../assets/pics1.jpg';
import pics2 from '../assets/pics2.jpg';

const ProcessSteps = () => {
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = [
    {
      title: "Upload and Adjust the Exam Criteria",
      content: "Upload the exam solution in PDF, Doc or Image Format. Adjust the grading preferences and save the file.",
      img: Img
    },
    {
      title: "Share the Link with Students",
      content: "Generate and distribute secure assessment links to students through multiple channels.",
      img: pics1
    },
    {
      title: "Get Instant Reports",
      content: "Automatically receive comprehensive exam reports in your designated folder.",
      img: pics2
    }
  ];

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-sans font-semibold text-gray-900">
            <span className="block">
              Exam Checking Made Instant with{' '}
              <span className="text-green-400">Just 3 Steps</span>
            </span>
            <span className="block text-2xl sm:text-3xl md:text-4xl font-sans font-semibold text-gray-900 ">
              Upload, Share and Grade!
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Image Section */}
          <div className="relative h-[280px] sm:h-[320px] md:h-[360px] w-full max-w-[500px] mx-auto overflow-hidden rounded-xl md:rounded-3xl">
  <AnimatePresence mode='wait'>
    <motion.div
      key={activeStep}
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3 }}
      className="absolute w-full h-full"
    >
      <img
        src={steps[activeStep].img}
        alt={steps[activeStep].title}
        className="w-full h-full object-cover rounded-xl md:rounded-3xl"
      />
    </motion.div>
  </AnimatePresence>
</div>

          {/* Steps List */}
          <div className="space-y-8 md:space-y-12">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="group relative pl-12 md:pl-14 cursor-pointer"
                onMouseEnter={() => setActiveStep(index)}
                onClick={() => setActiveStep(index)}
              >
                <div className={`absolute font-sans left-0 top-0 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center 
                  ${activeStep === index ? 'bg-green-400 text-white' : 'bg-gray-100'}`}>
                  {index + 1}
                </div>
                
                <h3 className={`text-lg md:text-xl lg:text-2xl font-sans font-semibold mb-2 transition-colors 
                  ${activeStep === index ? 'text-green-400' : 'text-gray-900'}`}>
                  {step.title}
                </h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  {step.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSteps;