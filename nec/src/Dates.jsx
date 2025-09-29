import React from 'react';
import Header from "./Header";
import Footer from "./Footer";
import sigma from './assets/sigma.png';
import thermal from './assets/thermal.png';
import { Calendar, Clock, Award, Users } from 'lucide-react';

const PublicationAndDates = () => {
  const importantDates = [
    {
      title: "Full length paper submission deadline",
      date: "31/12/2025",
      icon: <Calendar className="w-6 h-6" />,
      color: "bg-red-500"
    },
    {
      title: "Notification of final acceptance",
      date: "10/01/2026",
      icon: <Award className="w-6 h-6" />,
      color: "bg-green-500"
    },
    {
      title: "Registration (Early bird) deadline",
      date: "31/01/2026",
      subtitle: "Register before this date for discounted rates",
      icon: <Clock className="w-6 h-6" />,
      color: "bg-blue-500"
    },
    {
      title: "Registration (Regular) deadline",
      date: "14/02/2026",
      subtitle: "Register before this date for regular rates",
      icon: <Users className="w-6 h-6" />,
      color: "bg-orange-500"
    }
  ];

  const publications = [
    {
      title: "Sigma Journal",
      type: "Regular Issue",
      subtitle: "Only for Selected Papers",
      details: "Scopus, ESCI, IF 0.6",
      logo: sigma
    },
    {
      title: "Journal of Thermal Engineering",
      type: "Regular Issue",
      subtitle: "Only for Selected Papers",
      details: "Scopus, ESCI, IF 1.4",
      logo: thermal
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Navigation */}
      <Header/>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Important Dates</h1>
        </div>

        {/* Important Dates Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-sky-500 mb-8 text-center">Important Dates</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {importantDates.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start space-x-4">
                  <div className={`${item.color} text-white p-3 rounded-full`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {item.title}
                    </h3>
                    <div className="text-2xl font-bold text-sky-600 mb-2">
                      {item.date}
                    </div>
                    {item.subtitle && (
                      <p className="text-sm text-gray-600">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Publications Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-sky-500 mb-4 text-center">Publications</h2>
          <p className="text-gray-600 text-center mb-8 max-w-3xl mx-auto">
            All the peer-reviewed accepted papers will be considered for the following Scopus indexed journals based on the quality.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {publications.map((pub, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition-shadow duration-300">
                <div className="mb-6">
                  <img 
                    src={pub.logo} 
                    alt={pub.title}
                    className="mx-auto h-16 object-contain"
                  />
                </div>
                
                <div className="mb-4">
                  <span className="inline-block bg-sky-100 text-sky-700 text-sm font-semibold px-3 py-1 rounded-full mb-2">
                    {pub.type}
                  </span>
                  <div className="text-orange-600 font-medium text-sm mb-2">
                    {pub.subtitle}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {pub.title}
                </h3>
                
                <p className="text-green-600 font-semibold">
                  {pub.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
     <Footer/>
    </div>
  );
};

export default PublicationAndDates;