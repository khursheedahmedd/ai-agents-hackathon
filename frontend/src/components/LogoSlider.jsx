import React from 'react';
import qauLogo from '../assets/qua1.png';
import lumsLogo from '../assets/LUMS.png';
import comsatsLogo from '../assets/COMSATS-logo.png';
import umtLogo from '../assets/umt1.png';
import fastUniversityLogo from '../assets/NU1.png';
import ibaLogo from '../assets/logo.png';
const LogoSlider = () => {
  const universities = [
    {  logo: qauLogo },
    {  logo: lumsLogo },
    {  logo: comsatsLogo },
    {  logo: umtLogo },
    {  logo: fastUniversityLogo },
    {  logo: ibaLogo },
  ];

  return (
    <section className="w-full h-auto bg-green-100 py-12 overflow-hidden">
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Header */}
        <h2 className="text-3xl sm:text-4xl font-urbanist text-gray-900 leading-tight mb-8">
          <span className="text-green-600">Trusted by</span> Leading Universities Across the <span className="text-green-600">Globe</span>
        </h2>
        {/* Logo Display */}
        <div className="flex flex-row flex-wrap justify-center items-center gap-8">
          {universities.map((university, index) => (
            <div
              key={index}
              className="transition-all duration-300 transform hover:scale-110 hover:opacity-100 opacity-80 flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40"
            >
              <img
                src={university.logo}
                alt={university.name}
                className="text-black hover:text-green-500 text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoSlider;
