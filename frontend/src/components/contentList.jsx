import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const contentList = [
  { id: 1, text: 'AI Fitness Tracker' },
  { id: 2, text: 'Smart Food Analyzer' },
  { id: 3, text: 'Health Insights' },
  { id: 4, text: 'Daily Task Manager' }
];

const SnakeContentAnimation = () => {
  const [content, setContent] = useState(contentList);

  useEffect(() => {
    const interval = setInterval(() => {
      setContent((prevContent) =>
        prevContent.map((item, index) => ({
          ...item,
          top: 200 + 100 * Math.sin(index + Date.now() / 1000),
          left: 200 + 100 * Math.cos(index + Date.now() / 1000)
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[500px] bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden flex items-center justify-center">
      {content.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute text-2xl font-semibold text-white bg-black bg-opacity-50 p-4 rounded-lg shadow-lg"
          style={{ top: `${content[index].top}px`, left: `${content[index].left}px` }}
        >
          {item.text}
        </motion.div>
      ))}
    </div>
  );
};

export default SnakeContentAnimation;
