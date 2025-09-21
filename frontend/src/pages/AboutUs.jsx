import React from "react";
import { motion } from "framer-motion";
import { 
  SparklesIcon, 
  DocumentChartBarIcon, 
  UserGroupIcon, 
  ClockIcon, 
  ChartBarIcon,
  AcademicCapIcon,
  CpuChipIcon
} from "@heroicons/react/24/outline";

const AboutUs = () => {
  const features = [
    {
      icon: SparklesIcon,
      title: "AI-Powered Grading",
      desc: "Deep learning algorithms with 99.8% accuracy in pattern recognition",
      stat: "95% Accuracy"
    },
    {
      icon: DocumentChartBarIcon,
      title: "Analytics Suite",
      desc: "Real-time performance dashboards with cohort comparisons",
      stat: "50+ Metrics"
    },
    {
      icon: UserGroupIcon,
      title: "Collaboration Tools",
      desc: "Multi-educator workflows with role-based access control",
      stat: "Team Ready"
    },
    {
      icon: ClockIcon,
      title: "Time Savings",
      desc: "Reduce grading time from minutes with bulk processing",
      stat: "70% Faster"
    }
  ];

  return (
    <div className="bg-gradient-to-b mt-10 from-white to-[#f8fafc] py-12 sm:py-16 md:py-20 lg:py-28 font-sans overflow-x-hidden">
      <div className="mx-auto px-4 sm:px-5 max-w-full md:max-w-3xl lg:max-w-5xl xl:max-w-7xl">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16 space-y-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="inline-block bg-gradient-to-r font-sans font-semibold from-green-400 to-green-400 px-4 py-2 rounded-full text-sm text-black shadow-lg mx-auto"
          >
            Intelligent Assessment Solutions
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold text-gray-900 leading-tight px-2"
          >
            Transforming Education Through
            <span className="bg-gradient-to-r from-green-400 to-green-400 bg-clip-text text-transparent block ">
              AI Innovation
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-base text-gray-600 max-w-xl mx-auto mt-4 px-2"
          >
            Empowering educators with enterprise-grade assessment tools powered by machine learning 
            and natural language processing.
          </motion.p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16 sm:mb-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 }
              }}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-100 mx-auto w-full max-w-[300px] md:max-w-none"
            >
              <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                <div className="p-2 bg-green-50 rounded-lg">
                  <feature.icon className="w-6 h-6 text-green-4 00" />
                </div>
                <span className="text-sm  font-sans font-semibold text-green-400">
                  {feature.stat}
                </span>
              </div>
              <h3 className="text-xl font-sans font-bold text-gray-900 mb-3 text-center md:text-left">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-center md:text-left">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Mission Section */}
        <div className="flex flex-col lg:flex-row gap-8 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 max-w-[500px] lg:max-w-none"
          >
            <div className="relative p-8 bg-white rounded-2xl shadow-lg border border-gray-100 text-center md:text-left">
              <h2 className="text-2xl font-sans font-bold text-gray-900 mb-6">
                Our Commitment to Excellence
              </h2>
              <p className="text-gray-600 mb-6">
                At SmartGrade AI, we combine pedagogical expertise with cutting-edge technology 
                to deliver solutions that:
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 justify-center md:justify-start">
                  <CpuChipIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Automate assessment tasks</span>
                </li>
                <li className="flex items-center gap-3 justify-center md:justify-start">
                  <AcademicCapIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Provide learning insights</span>
                </li>
                <li className="flex items-center gap-3 justify-center md:justify-start">
                  <ChartBarIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Enable data-driven decisions</span>
                </li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 max-w-[500px] lg:max-w-none"
          >
            <div className="h-full p-8 bg-green-400 rounded-2xl text-black text-center md:text-left">
              <h3 className="text-2xl font-sans font-bold mb-4">Why Educators Choose Us</h3>
              <p className="text-black leading-relaxed">
                "SmartGrade AI reduced our assessment workload by 60% while improving 
                grading consistency across departments."
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;