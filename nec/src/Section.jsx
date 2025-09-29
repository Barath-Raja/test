import './App.css';
function Section() {
  return (
    <div className="bg-white py-12 px-4 md:px-8 lg:px-16">
      
      {/* About Section */}
      <div   className="max-w-6xl mx-auto text-center">
        <h2 
          className="font-bold text-[#4ebceb] text-3xl md:text-5xl mb-6"
          data-aos="fade-up"
          data-aos-duration="800"
        >
          About ICoDSES-2026
        </h2>

        {/* Visitor Counter centered under heading */}
        <div 
          className="mb-10 flex justify-center"
          data-aos="zoom-in"
          data-aos-delay="200"
          data-aos-duration="1000"
        >
         
        </div>
        
        <div className="space-y-6 text-[#2086ca] text-lg md:text-xl leading-relaxed text-justify">
          <p
            data-aos="fade-right"
            data-aos-delay="300"
            data-aos-duration="1000"
          >
            The International Conference on Deep Tech and Sustainable Engineering Solutions (ICoDSES-2026) is set to be a hub of expertise, knowledge sharing, and collaboration in the rapidly evolving fields of Deep Technology and Sustainable Engineering. This peer-reviewed conference will focus on the critically important theme: <strong>Innovating for a Sustainable Future: Bridging Deep Tech and Environmental Impact</strong>.
          </p>
          
          <p
            data-aos="fade-left"
            data-aos-delay="400"
            data-aos-duration="1000"
          >
            As the world faces unprecedented climate change, resource depletion, and sustainability challenges, the need for innovative engineering solutions becomes even more urgent. ICoDSES-2026 will spotlight how deep technologies – including artificial intelligence, robotics, blockchain, and advanced materials – are harnessed to create sustainable, environmentally conscious solutions.
          </p>
          
          <p
            data-aos="fade-right"
            data-aos-delay="500"
            data-aos-duration="1000"
          >
            The core objective of ICoDSES-2026 is to foster a comprehensive dialogue between researchers, industry leaders, and policymakers, encouraging collaborations that prioritize the responsible and ethical deployment of technology. With a strong emphasis on addressing the environmental impact of modern technological advancements, ICoDSES-2026 will provide a unique platform to discuss solutions, share research findings, and build the partnerships necessary to foster a sustainable future for all.
          </p>
        </div>
      </div>

      {/* Publications Section */}
      <div className="max-w-6xl mx-auto mt-16 md:mt-24 text-center">
        <h2 
          className="font-bold text-[#4ebceb] text-3xl md:text-5xl mb-8"
          data-aos="fade-up"
          data-aos-delay="600"
          data-aos-duration="800"
        >
          Previous Conference Publications
        </h2>
        
        <ul className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
          <li
            data-aos="fade-right"
            data-aos-delay="500"
            data-aos-duration="1000"
          >
            <div className="w-full h-20 flex items-center justify-center bg-white border border-gray-200 mx-auto rounded-lg shadow-sm hover:shadow-md hover:border-[#4ebceb] hover:-translate-y-1 transition-all duration-300">
              <a 
                href="https://ieeexplore.ieee.org/xpl/conhome/7589933/proceeding" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#2086ca] font-semibold text-lg md:text-xl px-4 text-center"
              >
                <i className="fas fa-external-link-alt"></i>
                ICCTIDE'16 - IEEE Xplore
              </a>
            </div>
          </li>
          
          <li
            data-aos="fade-right"
            data-aos-delay="500"
            data-aos-duration="1000"
          >
            <div className="w-full h-24 flex items-center justify-center bg-white border border-gray-200 mx-auto rounded-lg shadow-sm hover:shadow-md hover:border-[#4ebceb] hover:-translate-y-1 transition-all duration-300">
              <a 
                href="https://doi.org/10.1063/12.0007300" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#2086ca] font-semibold text-sm md:text-xl px-4 text-center"
              >
                <i className="fas fa-external-link-alt"></i>
                AICTE Sponsored National Online Conference on Data Science and Intelligent Information Technology
              </a>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Section;