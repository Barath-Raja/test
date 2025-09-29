import React from 'react';
import Header from './Header'; 
import lung from './assets/lung.png';
import chandra from './assets/chandra.png'; 
import vassil from './assets/vassil.png'; 
import solo from './assets/solo.png';
import xyz from './assets/xyz.png';
import Footer from "./Footer"

const KeynoteSpeakers = () => {
  const speakers = [
    {
      id: 1,
      name: "Dr. Lung-Jieh Yang",
      title: "Professor",
      department: "Department of Mechanical and Electro-Mechanical Engineering",
      institution: "Tamkang University, Taiwan",
      image: lung
    },
    {
      id: 2,
      name: "Prof. Anastasios P. Vassilopoulos",
      title: "EDCE Director",
      department: "Composite Mechanics Group (GR-MeC)",
      institution: "Ecole Polytechnique Fédérale de Lausanne, Lausanne",
      image: vassil
    },
    {
      id: 3,
      name: "Dr. Solomon Raju Kota",
      title: "Chief Scientist & Head, ICTD, CSIR-NAL",
      department: "Professor, Academy of Scientific and Innovative Research (AcSIR)",
      institution: "Bengaluru, Karnataka, Hq: Ghaziabad",
      image: chandra
    },
    {
      id: 4,
      name: "Dr. C. Chandra Shekhar",
      title: "Professor",
      department: "Department of Computer Science & Engineering",
      institution: "IIT Madras, Chennai",
      image: solo
    },
    {
      id: 5,
      name: "Dr. XYZ",
      title: "Senior Technology Leader",
      department: "Senior Technology Leader, Fermi Silicon Designs Pvt Ltd",
      institution: "Kaikondrahalli, Varthur(h)117, Bellandur, Bangalore",
      image: xyz
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Main content */}
      <Header/>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 mt-12">
        {/* Title section */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 lg:mb-8">
            Speakers
          </h1>
        </div>

        {/* Speakers grid - responsive layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 mb-8 sm:mb-12 lg:mb-16">
          {speakers.slice(0, 3).map((speaker) => (
            <div key={speaker.id} className="text-center">
              {/* Circular image - responsive sizing */}
              <div className="mb-4 sm:mb-6 flex justify-center">
                <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden border-4 border-gray-200">
                  <img 
                    src={speaker.image} 
                    alt={speaker.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Speaker info */}
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">
                {speaker.name}
              </h3>
              
              {speaker.title && (
                <p className="text-sm text-gray-600 italic mb-2">
                  {speaker.title}
                </p>
              )}
              
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {speaker.department}
              </p>
              
              {speaker.institution && (
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {speaker.institution}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Fourth and Fifth speakers - responsive layout */}
        {speakers.length > 3 && (
          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 max-w-2xl">
              {speakers.slice(3, 5).map((speaker) => (
                <div key={speaker.id} className="text-center">
                  <div className="mb-4 sm:mb-6 flex justify-center">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden border-4 border-gray-200">
                      <img 
                        src={speaker.image} 
                        alt={speaker.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">
                    {speaker.name}
                  </h3>
                  
                  {speaker.title && (
                    <p className="text-sm text-gray-600 italic mb-2">
                      {speaker.title}
                    </p>
                  )}
                  
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {speaker.department}
                  </p>
                  
                  {speaker.institution && (
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {speaker.institution}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
       
      </div>
      <Footer/>
    </div>
  );
};

export default KeynoteSpeakers;