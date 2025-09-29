// VisitorCounter.jsx
import React, { useState, useEffect, useRef } from 'react';

const VisitorCounter = () => {
  const [visitorCount, setVisitorCount] = useState(0);
  const hasIncremented = useRef(false); 

  useEffect(() => {
    if (!hasIncremented.current) {
      const storedCount = localStorage.getItem('visitorCount');
      const initialCount = storedCount ? parseInt(storedCount) : 0;
      const newCount = initialCount + 1;

      setVisitorCount(newCount);
      localStorage.setItem('visitorCount', newCount.toString());

      hasIncremented.current = true;
    }
  }, []);

  const renderDigits = (number) => {
    return number
      .toString()
      .padStart(4, '0')
      .split('')
      .map((digit, index) => (
        <span
          key={index}
          className="bg-cyan-500 text-white font-bold px-6 py-4 m-1 rounded-lg shadow-lg text-4xl"
        >
          {digit}
        </span>
      ));
  };

  return (
    <div data-aos="fade-up"
            data-aos-delay="500"
            data-aos-duration="1000" className="flex flex-col items-center justify-center mb-6">
      <h1 className="text-3xl font-bold text-[#2086ca] mb-4">
         Visitors
      </h1>
      <div className="flex items-center p-4 rounded-xl shadow-xl">
        {renderDigits(visitorCount)}
      </div>
    </div>
  );
};

export default VisitorCounter;
