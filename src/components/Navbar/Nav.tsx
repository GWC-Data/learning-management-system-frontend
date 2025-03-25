import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { MdPersonAddAlt1 } from "react-icons/md";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "../ui/dropdown-menu";

import ProfileSettingsIcon from "../../icons/setting.png";
import LogoutIcon from "../../icons/logout.png";
import LMSLogo from "../../images/Logo.png";
import { fetchUsersbyIdApi } from "@/helpers/api/userApi";

interface NavProps {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

const Nav: React.FC<NavProps> = ({ isAuthenticated, setIsAuthenticated }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profilePic, setProfilePic] = useState(null);

  // Initialize role and name from localStorage or fallback to null
  const [role, setRole] = useState<string | null>(localStorage.getItem("role"));
  const [name, setName] = useState<string | null>(
    localStorage.getItem("userName")
  );

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  console.log(userId);

  useEffect(() => {
    // Listen for manual storage updates in other tabs
    const handleStorageChange = () => {
      setRole(localStorage.getItem("role"));
      setName(localStorage.getItem("userName"));
    };

    // Add event listener for changes in localStorage
    window.addEventListener("storage", handleStorageChange);

    // Clean up the event listener when the component is unmounted
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const fetchProfilePic = async () => {
    if (!userId) return; // Prevent API call if userId is null

    try {
      const response = await fetchUsersbyIdApi(String(userId));
      console.log(response, "respp");

      if (response?.profilePic) {
        setProfilePic(response.profilePic);
      }
      
    } catch (error) {
      console.error("Failed to fetch profile picture:", error);
    }
  };

  useEffect(() => {
    fetchProfilePic();
  }, [userId]); // Ensure `userId` is a valid dependency

  // Toggle the mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.clear(); // Clear localStorage on logout
    setIsAuthenticated(false); // Update authentication state
    setRole(null); // Clear role
    setName(null); // Clear name
    navigate("/login"); // Redirect to login page
    setProfilePic(null);
  };

  useEffect(() => {
    if (isAuthenticated) {
      // After login, update the role and name state
      setRole(localStorage.getItem("role"));
      setName(localStorage.getItem("userName"));
    }
  }, [isAuthenticated]);

  return (
    <div className="bg-[#130342] p-4 shadow-lg text-white">
      <div className="flex justify-between items-center max-w-screen-xxl ml-8">
        <Link
          to={
            role === "admin"
              ? "/admin/dashboard"
              : role === "trainer"
                ? "/trainer"
                : role === "trainee"
                  ? "/trainee/dashboard"
                  : "/"
          }
          className="hover:scale-105 transform transition"
        >
          <img src={LMSLogo} alt="teqcertify" className="w-64 h-14" />
        </Link>

        {/* Navigation Bar */}
        <div className="flex items-center w-full px-6 md:px-12">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center w-full">
            {!isAuthenticated ? (
              <>
                {/* Navigation Links for Unauthenticated Users */}
                <div className="flex flex-1 justify-center items-center space-x-6">
                  <a
                    href="https://teqcertify.com/"
                    className="relative font-metropolis font-semibold text-md hover:text-white transition group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Home
                    <span className="absolute bottom-0 left-0 w-0 h-[0.5px] bg-white transition-all duration-300 group-hover:w-full"></span>
                  </a>
                  <a
                    href="https://teqcertify.com/about-2/"
                    className="relative font-metropolis font-semibold text-md hover:text-white transition group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    About
                    <span className="absolute bottom-0 left-0 w-0 h-[0.5px] bg-white transition-all duration-300 group-hover:w-full"></span>
                  </a>
                  <a
                    href="https://teqcertify.com/talent-acquisition-partner/"
                    className="relative font-metropolis font-semibold text-md hover:text-white transition group"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ wordSpacing: "0.2em" }}
                  >
                    Talent Acquisition Partner
                    <span className="absolute bottom-0 left-0 w-0 h-[0.5px] bg-white transition-all duration-300 group-hover:w-full"></span>
                  </a>
                  <a
                    href="https://teqcertify.com/contact/"
                    className="relative font-metropolis font-semibold text-md hover:text-white transition group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contact
                    <span className="absolute bottom-0 left-0 w-0 h-[0.5px] bg-white transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </div>

                {/* Register Button */}
                <a
                  href="https://teqcertify.com/register/"
                  className="relative flex items-center font-metropolis font-semibold text-md hover:text-white transition group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MdPersonAddAlt1 className="mr-2 text-xl text-gray-600 hover:text-white" />{" "}
                  Register
                </a>
              </>
            ) : (
              <>
                {/* Authenticated User Navigation */}
                <div className="flex flex-1 justify-end items-center space-x-4">
                  <span className="text-white font-medium text-lg">{`Welcome, ${
                    name || "User"
                  }`}</span>

                  {/* Dropdown Menu */}
                  <DropdownMenu
                    open={dropdownOpen}
                    onOpenChange={setDropdownOpen}
                  >
                    <DropdownMenuTrigger>
                      <div className="cursor-pointer">
                        {profilePic ? (
                          <img
                            src={
                              profilePic || "https://via.placeholder.com/150"
                            }
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center text-white">
                            {name?.charAt(0)}
                          </div>
                        )}
                      </div>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="bg-white text-black p-4 rounded-lg shadow-lg w-[300px] mr-10 mt-9">
                      <div className="flex flex-col space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="cursor-pointer">
                            {profilePic ? (
                              <img
                                src={profilePic}
                                alt="Profile"
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center text-white">
                                {name?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="justify-items-center items-center -ml-[210px] mt-2 text-lg">
                            <h1>{name}</h1>
                          </div>
                        </div>
                        <hr />

                        {/* Profile Settings */}

                        {role !== "admin" && (
                          <Link
                            to="/trainee/settings"
                            className="text-black bg-gray-100 py-2.5 px-4 rounded-lg text-center shadow-md transition duration-300 mt-5 hover:bg-slate-200"
                            onClick={() => setDropdownOpen(false)} // Close dropdown when clicked
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={ProfileSettingsIcon}
                                alt="profileSettingIcon"
                                className="w-8 h-8"
                              />
                              <div>Profile Settings</div>
                            </div>
                          </Link>
                        )}

                        {/* Logout */}
                        <button
                          onClick={() => {
                            handleLogout();
                            setDropdownOpen(false); // Close dropdown when logging out
                          }}
                          className="bg-red-500 hover:bg-red-700 text-white py-2.5 px-4 border shadow-md transition duration-300 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={LogoutIcon}
                              alt="LogoutIcon"
                              className="w-8 h-8"
                            />
                            <div>Logout</div>
                          </div>
                        </button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
                <>
                  {/* Navigation Links for Unauthenticated Users */}
                  <a
                    href="https://teqcertify.com/"
                    className="text-white font-metropolis font-semibold text-md hover:text-green-500 transition"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Home
                  </a>
                  <a
                    href="https://teqcertify.com/about-2/"
                    className="text-white font-metropolis font-semibold text-md hover:text-green-500 transition"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    About
                  </a>
                  <a
                    href="https://teqcertify.com/talent-acquisition-partner/"
                    className="text-white font-metropolis font-semibold text-md hover:text-green-500 transition"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Talent Acquisition Partner
                  </a>
                  <a
                    href="https://teqcertify.com/contact/"
                    className="text-white font-metropolis font-semibold text-md hover:text-green-500 transition"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contact
                  </a>
                  <a
                    href="https://teqcertify.com/register/"
                    className="text-white font-metropolis font-semibold text-md hover:text-green-500 transition"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Register
                  </a>
                </>
              ) : (
                <>
                  {/* Authenticated User Details */}
                  <span className="text-white font-medium">{`Welcome, ${
                    name || "User"
                  }`}</span>

                  {/* Avatar and Dropdown Menu for Mobile */}
                  <DropdownMenu
                    open={dropdownOpen}
                    onOpenChange={setDropdownOpen}
                  >
                    <DropdownMenuTrigger>
                      <div className="cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white">
                          {name?.charAt(0)}
                        </div>
                      </div>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="bg-white text-black p-4 rounded-lg shadow-lg w-64">
                      <div className="flex flex-col space-y-4">
                        {/* Profile Settings */}
                        <Link
                          to="/trainee/settings"
                          className="text-black bg-gray-100 py-2.5 px-4 rounded-lg text-center shadow-md transition duration-300 hover:bg-slate-200"
                          onClick={() => setDropdownOpen(false)} // Close dropdown when clicked
                        >
                          User Settings
                        </Link>

                        {/* Logout */}
                        <button
                          onClick={() => {
                            handleLogout();
                            setDropdownOpen(false); // Close dropdown when logging out
                          }}
                          className="bg-red-500 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg shadow-md transition duration-300"
                        >
                          Logout
                        </button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Nav;
