// import React from 'react';
// import { motion } from 'framer-motion';
// import HeroSection from '../components/HeroSection';
// import LogoSlider from '../components/LogoSlider';
// import WhyUS from '../components/WhyUs';
// import BoostEfficiency from '../components/BoostEfficiency';
// import DataInsights from '../components/DataInsights';
// import IntegrationComponent from '../components/IntegrationComponent';
// import Features from '../components/Features';
// import Testimonials from '../components/Testimonials';
// import Step from '../components/Steps';
// import ChooseYourPlan from '../components/ChooseYourPlan';
// import contentlist from '../components/contentList'

// const sectionVariants = {
//   hidden: { opacity: 0, y: 50 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
// };

// const Home = () => {
//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="relative min-h-screen bg-green-100 overflow-hidden"
//     >
//       {/* Subtle Floating Background Effect */}
//       <motion.div
//         animate={{ y: [0, -10, 0] }}
//         transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
//         className="absolute inset-0 bg-opacity-20 bg-white rounded-full w-[500px] h-[500px] blur-3xl mx-auto"
//       />

//       <HeroSection />
//       <LogoSlider />

//       <motion.div variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
//         <Step />
//       </motion.div>

      
//       <motion.div variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
//         <WhyUS />
//       </motion.div>

//       <motion.div variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
//         <BoostEfficiency />
//       </motion.div>

//       {/* <motion.div variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
//         <DataIsnights />
//       </motion.div> */}

//       {/* <motion.div variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
//         <ChooseYourPlan />
//       </motion.div> */}

//       {/* <motion.div variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
//         <IntegrationComponent />
//       </motion.div> */}

//       <motion.div variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
//         <Features />
//       </motion.div>
      
//       <motion.div variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
//         <Testimonials />
//       </motion.div>

//       {/* Add Step Section */}
      
      
//     </motion.div>
//   );
// };

// export default Home;


import React from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../components/HeroSection';
import ProcessSteps from '../components/ProcessSteps';
import WhySmartGrade from '../components/WhySmartGrade';
import FeatureComparison from '../components/FeatureComparison';



const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen bg-gray-50  overflow-hidden"
    >
      {/* Subtle Floating Background Effect */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-opacity-20 bg-white rounded-full w-[500px] h-[500px] blur-3xl mx-auto"
      />

      <HeroSection />
      <ProcessSteps/>
      <WhySmartGrade/>
      <FeatureComparison/>
      
      
    </motion.div>
  );
};

export default Home;
