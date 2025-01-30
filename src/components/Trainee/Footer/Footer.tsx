import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 py-8 text-gray-700">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        {/* Footer Logo */}
        <div className="mb-2">
          <img
            src="https://teqcertify.com/wp-content/uploads/2024/11/2-300x100.png"
            alt="teqcertify"
            className="w-52 h-16"
          />
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap justify-center md:justify-start space-x-4 mb-4 md:mb-0">
          <a
            href="https://teqcertify.com/"
            className="relative font-metropolis font-semibold text-md hover:text-green-500 transition group"
          >
            Home
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-green-500 transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a
            href="https://teqcertify.com/about-2/"
            className="relative font-metropolis font-semibold text-md hover:text-green-500 transition group"
          >
            About
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-green-500 transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a
            href="https://teqcertify.com/talent-acquisition-partner/"
            className="relative font-metropolis font-semibold text-md hover:text-green-500 transition group"
          >
            Talent Acquisition Partnership
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-green-500 transition-all duration-300 group-hover:w-full"></span>
          </a>

          <a
            href="https://teqcertify.com/contact/"
            className="relative font-metropolis font-semibold text-md hover:text-green-500 transition group"
          >
            Contact
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-green-500 transition-all duration-300 group-hover:w-full"></span>
          </a>
        </div>

        {/* Static Popular Courses List */}
        <div className="flex flex-col md:flex-row justify-center space-x-0 md:space-x-6 mt-6 md:mt-0">
          <h3 className="font-semibold text-lg mb-2">Our Courses</h3>
          <ul className="list-none space-y-2">
            <li>
              <a
                href="https://teqcertify.com/data-analytics-course/"
                className="relative font-metropolis font-semibold text-md hover:text-green-500 transition group"
              >
                Data Analytics
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-green-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </li>
            <li>
              <a
                href="https://teqcertify.com/data-engineering/"
                className="relative font-metropolis font-semibold text-md hover:text-green-500 transition group"
              >
                Data Engineering
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-green-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </li>
            <li>
              <a
                href="https://teqcertify.com/data-science/"
                className="relative font-metropolis font-semibold text-md hover:text-green-500 transition group"
              >
                Data Science
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-green-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </li>
            <li>
              <a
                href="https://teqcertify.com/domo/"
                className="relative font-metropolis font-semibold text-md hover:text-green-500 transition group"
              >
                Domo
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-green-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-6 text-center text-gray-600">
        <p>
          &copy; {new Date().getFullYear()} TeqCertify. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
