import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import neclogo from './assets/Nec-Logo-White1 (1).png';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { AuthContext } from './AuthContext';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { token, logout } = useContext(AuthContext);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="bg-gradient-to-r px-3.5  from-[#4ebceb] via-[#3aa3d9] to-[#2086ca]   fixed right-0 left-0 top-0 z-[999] shadow-2xl backdrop-blur-sm border-b border-white/10">
      <nav className="mx-auto  flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <div className="p-2">
            <img className="w-[40px]" src={neclogo} alt="NEC Logo" />
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex space-x-8 items-center">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/dates">Important Dates</NavLink>
          <NavLink to="/papers">Call for Papers</NavLink>

          {/* ✅ Enhanced Dropdown Menu */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="relative text-white font-medium text-lg flex items-center gap-2 px-4  rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:scale-105 backdrop-blur-sm"
            >
              <span>Committee</span>
              {/* Enhanced triangle with glow effect */}
              <svg
                className={`w-4 h-4 text-white/80 transform transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''} drop-shadow-sm`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                  clipRule="evenodd"
                />
              </svg>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-300/0 via-blue-200/0 to-purple-200/0 hover:from-blue-300/20 hover:via-blue-200/10 hover:to-purple-200/20 transition-all duration-300 -z-10 blur-sm"></div>
            </button>

            {/* Enhanced dropdown with better animations */}
            <div className={`absolute left-0 mt-9 w-64 bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 transition-all duration-300 origin-top overflow-hidden ${
              isDropdownOpen 
                ? 'opacity-100 scale-100 translate-y-0' 
                : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
            }`}>
              <div className="py-2">
                <Link
                  to="/committee"
                  className="group/item flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 hover:text-blue-800 transition-all duration-300 border-l-4 border-transparent hover:border-blue-400 hover:shadow-sm"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200"></div>
                  <span className="font-medium">Advisory Committee</span>
                </Link>
                {/* <Link
                  to="/committee/organizing"
                  className="group/item flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 hover:text-blue-800 transition-all duration-300 border-l-4 border-transparent hover:border-blue-400 hover:shadow-sm"
                >
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200"></div>
                  <span className="font-medium">Organizing Committee</span>
                </Link> */}
              </div>
            </div>
          </div>

          <NavLink to="/speakers">Speakers</NavLink>
          <NavLink to="/schedule">Schedule</NavLink>
          <NavLink to="/paper-status">Registration</NavLink>
          {token && (
            <button
              onClick={logout}
              className="text-white font-medium text-lg px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="lg:hidden">
          <button
            onClick={toggleMenu}
            className="text-white focus:outline-none p-2"
            aria-label="Toggle menu"
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

       
<div
  className={`bg-gradient-to-b from-[#2086ca]/95 to-[#4ebceb]/95 backdrop-blur-md lg:hidden absolute top-full left-0 right-0 w-full overflow-x-hidden transition-all duration-500 ease-in-out overflow-hidden z-[998] ${
    isOpen ? 'max-h-screen py-4' : 'max-h-0'
  }`}
>
  <div className="flex flex-col space-y-4 px-6">
    <MobileNavLink to="/" onClick={toggleMenu}>
      Home
    </MobileNavLink>
    <MobileNavLink to="/dates" onClick={toggleMenu}>
      Important Dates
    </MobileNavLink>
    <MobileNavLink to="/papers" onClick={toggleMenu}>
      Call for Papers
    </MobileNavLink>
     

    {/* Enhanced Mobile dropdown */}
    <details className="group">
      <summary className="text-white font-medium text-lg cursor-pointer py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/20 hover:border-white/30 hover:shadow-lg list-none flex items-center justify-between">
        <span>Committee</span>
        <svg
          className="w-5 h-5 text-white/80 transform group-open:rotate-180 transition-transform duration-300 drop-shadow-sm"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </summary>

      {/* Enhanced mobile dropdown content */}
      <div className="mt-3 ml-2 space-y-2 animate-fade-in">
        <div className="border-l-2 border-white/30 pl-4 space-y-2">
          <MobileNavLink 
            to="/committee" 
            onClick={toggleMenu}
            className="text-white/90 font-medium text-base py-2 px-4 rounded-lg hover:bg-white/15 hover:shadow-md hover:scale-102 transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/25 block"
          >
            <div className="flex items-center">
              <div className="w-2 h-2 bg-white/60 rounded-full mr-3"></div>
              Advisory Committee
            </div>
          </MobileNavLink>
        </div>
      </div>
    </details>

    <MobileNavLink to="/speakers" onClick={toggleMenu}>
      Speakers
    </MobileNavLink>
    <MobileNavLink to="/schedule" onClick={toggleMenu}>
      Schedule
    </MobileNavLink>
    <MobileNavLink to="/paper-status" onClick={toggleMenu}>
      Registration
    </MobileNavLink>
    {
      token &&(
        <div className='text-white font-medium text-lg py-1 px-4 bg-red-500 rounded-xl hover:bg-white/20 hover:shadow-lg hover:scale-105 transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/30"' >
       
            <button
              onClick={logout}
              className="text-white font-medium text-lg  px-3 py-1 rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              Logout
            </button>
          
     </div>
        
      )

    }
    
  </div>
</div>
</nav>
    </header>
  );
};

const NavLink = ({ to, children }) => (
  <Link
    to={to}
    className="relative text-white font-medium text-lg group px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-300"
  >
    {children}
    <span className="absolute left-1/2 bottom-0 h-0.5 bg-white w-0 transition-all duration-300 group-hover:w-full group-hover:left-0 rounded-full"></span>
  </Link>
);

NavLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};

const MobileNavLink = ({ to, children, onClick, className }) => (
  <Link
    to={to}
    onClick={onClick}
    className={className || "text-white font-medium text-lg py-3 px-4 rounded-xl hover:bg-white/20 hover:shadow-lg hover:scale-105 transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/30"}
  >
    {children}
  </Link>
);

MobileNavLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string
};

MobileNavLink.defaultProps = {
  onClick: () => {},
  className: null
};

export default Header;