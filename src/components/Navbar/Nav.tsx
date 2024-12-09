import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaSearch } from "react-icons/fa";
import GWClogo from "../../images/gwc.svg";
import GWClogoLight from '../../images/gwc_light.svg'

interface NavProps {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  userName: string;
}

const Nav: React.FC<NavProps> = ({ isAuthenticated, setIsAuthenticated, userName }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Search for: ${searchQuery}`);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    // Clear the authentication data from localStorage
    // localStorage.removeItem('authToken');
    localStorage.clear()
    // localStorage.removeItem('userId');
    setIsAuthenticated(false); // Update authentication state
    navigate('/login'); // Redirect to login
  };
  // bg-gradient-to-r from-green-600 to-blue-600
  return (
    <div className="bg-purple-900 p-4 shadow-lg">
      <div className="flex justify-between items-center max-w-screen-xxl">
        {/* Logo and Branding */}
        <Link to="/" className="text-white text-2xl font-bold">
          <img src={GWClogoLight} alt="GWC Logo" className="w-[190px] " />
          {/* <span className="text-yellow-400">✮✮</span> LMS Admin <span className="text-yellow-400">✮✮</span> */}
        </Link>

        {/* Centered Search Bar */}
        <div className="hidden md:flex items-center">
          <form onSubmit={handleSearchSubmit} className="relative w-[450px]">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search..."
              className="w-full px-4 py-2 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-yellow-400 hover:text-yellow-600"
            >
              <FaSearch />
            </button>
          </form>
        </div>

        {/* Desktop Navigation Buttons */}
        <div className="hidden md:flex items-center space-x-6">
          {!isAuthenticated ? (
            <Link
              to="/login"
            />
          ) : (
            <>
              <span className="text-white font-medium">{`Welcome, ${userName}`}</span>
              <button
                onClick={handleLogout} // Call the logout handler
                className="bg-red-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-red-700 transition duration-300"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden text-white text-2xl focus:outline-none"
        >
          <FaBars />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800 mt-2 rounded-lg p-4">
          <div className="flex flex-col items-center space-y-4">
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-blue-700 transition duration-300"
              >
                Login
              </Link>
            ) : (
              <>
                <span className="text-white font-medium">{`Welcome, ${userName}`}</span>
                <button
                  onClick={handleLogout} // Call the logout handler
                  className="bg-red-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-red-700 transition duration-300"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Nav;
