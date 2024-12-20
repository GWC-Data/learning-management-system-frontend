import React, { useState } from "react";
import { Users, Grid, Shield, ChevronDown, ChevronUp, Layers } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Sidebar: React.FC = () => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const location = useLocation(); // To determine the current active route

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200">
      <div className="flex flex-col w-64 bg-gray-800 shadow-lg">
        <nav className="flex-1 p-4 space-y-2">
          {/* Admin Section with collapsible menu */}
          <button
            onClick={() => setIsAdminOpen(!isAdminOpen)}
            className={`relative flex items-center w-full p-3 text-sm font-medium rounded-md transition-all duration-300 border-b-2 border-gray-200 ${
              isAdminOpen
                ? "bg-gray-300 text-gray-800"
                : "bg-gray-100 text-gray-800"
            } hover:bg-gray-200 hover:shadow-md`}
          >
            {/* Icon */}
            <div
              className={`mr-3 text-blue-500 transition-transform duration-300 ${
                isAdminOpen ? "rotate-12 scale-110" : ""
              }`}
            >
              <Shield />
            </div>

            {/* Label */}
            <span className="flex-1 flex flex-col">
              <span className="text-lg font-semibold">Admin</span>
            </span>

            {/* Chevron Icon */}
            <div
              className={`ml-auto transform transition-transform duration-300 ${
                isAdminOpen ? "rotate-180 text-blue-400" : "text-gray-500"
              }`}
            >
              {isAdminOpen ? <ChevronUp /> : <ChevronDown />}
            </div>

            {/* Glow Effect (Optional Decoration) */}
            <div
              className={`absolute inset-0 rounded-md bg-gradient-to-r from-blue-400 via-blue-500 to-purple-600 opacity-0 transition-opacity duration-300 ${
                isAdminOpen ? "opacity-20" : ""
              }`}
            ></div>
          </button>

          {isAdminOpen && (
            <div className="ml-6 space-y-2 transition-all duration-300">
              <SidebarButton
                icon={<Grid />}
                label="Courses"
                to="/courses"
                isActive={location.pathname === "/courses"}
              />

              <SidebarButton
                icon={<Users />}
                label="Users"
                to="/allUsers"
                isActive={location.pathname === "/allUsers"}
              />

              {/* New Sidebar Button for Course Category */}
              <SidebarButton
                icon={<Layers />}
                label="Course Category"
                to="/course-category"
                isActive={location.pathname === "/course-category"}
              />

            </div>
          )}
        </nav>
      </div>
    </div>
  );
};

type SidebarButtonProps = {
  icon: React.ReactNode;
  label: string;
  to: string;
  isActive?: boolean;
};

const SidebarButton: React.FC<SidebarButtonProps> = ({
  icon,
  label,
  to,
  isActive,
}) => (
  <Link
    to={to}
    className={`flex items-center w-full p-2 text-sm font-medium rounded-md transition-colors duration-200 ${
      isActive ? "bg-blue-600 text-white" : "hover:bg-gray-700"
    }`}
  >
    <div className={`mr-3 ${isActive ? "text-white" : "text-blue-400"}`}>
      {icon}
    </div>
    <span>{label}</span>
  </Link>
);

export default Sidebar;
