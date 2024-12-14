import React from 'react';
import teqcertify from '../images/teq-logo.png';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        {/* Footer Logo */}
        <div className="mb-2 bg-white rounded-lg">
            <img src={teqcertify} alt="teqcertify" className='w-full h-28'/>
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap justify-center md:justify-start space-x-4 mb-4 md:mb-0">
          <a href="#" className="hover:text-gray-400">Home</a>
          <a href="#" className="hover:text-gray-400">Courses</a>
          <a href="#" className="hover:text-gray-400">About</a>
          <a href="#" className="hover:text-gray-400">Contact</a>
        </div>

        {/* Static Popular Courses List */}
        <div className="flex flex-col md:flex-row justify-center space-x-0 md:space-x-6 mt-6 md:mt-0">
          <h3 className="font-semibold text-lg mb-2">Popular Courses</h3>
          <ul className="list-none space-y-2">
            <li className="hover:text-gray-400">
              <a href="#">Programming</a>
            </li>
            <li className="hover:text-gray-400">
              <a href="#">Data Analyst</a>
            </li>
            <li className="hover:text-gray-400">
              <a href="#">Full-Stack</a>
            </li>
            <li className="hover:text-gray-400">
              <a href="#">Machine Learning</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-6 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} TeqCertify. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
