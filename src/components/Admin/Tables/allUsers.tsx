import React, { useEffect, useState } from "react";
import { UserCheck, Users, DollarSign, Shield, PlusCircle } from "lucide-react";
import { useNavigate, Outlet } from "react-router-dom";
import { fetchRolesApi } from "@/helpers/api/roleApi";

type Role = {
  name: string;
  count: number;
};

type SidebarButtonProps = {
  icon: React.ReactNode;
  label: string;
  count: number;
  onClick: () => void;
  borderColor: string;
};

const SidebarButton: React.FC<SidebarButtonProps> = ({
  icon,
  label,
  count,
  onClick,
  borderColor,
}) => (
  <button
    onClick={onClick}
    className={`relative flex flex-col justify-between items-center w-[280px] h-[120px] px-4 py-3 bg-white text-gray-800 font-medium border-4 ${borderColor} hover:opacity-90 rounded-lg shadow-md transition-transform duration-300 transform hover:scale-105 overflow-hidden group`}
  >
    <div className="absolute inset-0 flex justify-center items-center">
      <div className="w-0 h-0 bg-gray-200 rounded-full opacity-20 scale-0 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
    </div>

    {/* Icon */}
    <div className="z-10 text-gray-700">{icon}</div>

    {/* Role Name */}
    <span className="z-10 text-lg font-semibold">{label}</span>

  </button>
);

const AllUsers: React.FC = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);

  const getToken = () => localStorage.getItem("authToken");
  
  const fetchRoles = async () => {
    const token = getToken();
    if (!token) {
      console.error("No token found. User must be logged in.");
      return;
    }
  
    try {
      const roleResponse = await fetchRolesApi();
      console.log("Roles API Response:", roleResponse); // Debugging log
  
      if (roleResponse && Array.isArray(roleResponse.role)) {
        const roleData = roleResponse.role.map((role: { name: string; count?: number }) => ({
          name: role.name.trim().toLowerCase(), // Normalize names
          count: role.count ?? 0, // Ensure count exists, default to 0 if undefined
        }));
        setRoles(roleData);
      } else {
        console.error("Unexpected response structure:", roleResponse);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };
  
  useEffect(() => {
    fetchRoles();
  }, []);
  
  // Role Icons with lowercase keys for better matching
  const roleIcons: Record<string, JSX.Element> = {
    admin: <Shield size={32} />,
    sales: <DollarSign size={32} />,
    trainer: <Users size={32} />,
    trainee: <UserCheck size={32} />,
  };

  // Role Border Colors
  const borderColors: Record<string, string> = {
    admin: "border-purple-500",
    sales: "border-green-500",
    trainer: "border-blue-500",
    trainee: "border-yellow-500",
  };

  return (
    <div className="p-4 flex flex-col items-center">
      <div className="flex justify-between items-center w-full max-w-[1170px] mb-4 mt-10">
        <h1 className="text-2xl font-bold text-gray-600">User Roles</h1>
        <button
          className="flex bg-[#6e2b8b] items-center px-4 py-2 text-white border-2 font-metropolis font-semibold hover:opacity-90 rounded-lg shadow-md transition duration-200"
          onClick={() => navigate("/admin/allUsers/add-user")}
        >
          <PlusCircle className="mr-2" />
          <span> Add User</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-4 font-metropolis font-semibold">
        {roles.map((role) => {
          const normalizedRoleName = role.name.toLowerCase(); // Normalize the role name
          return (
            <SidebarButton
              key={role.name}
              icon={roleIcons[normalizedRoleName] || <UserCheck size={32} />} // Default icon if not found
              label={role.name.charAt(0).toUpperCase() + role.name.slice(1)} // Capitalize first letter
              count={role.count}
              borderColor={borderColors[normalizedRoleName] || "border-gray-500"}
              onClick={() => navigate(`/admin/allUsers/${role.name.toLowerCase()}`)}
            />
          );
        })}
      </div>

      <div className="mt-6 w-full">
        <Outlet />
      </div>
    </div>
  );
};

export default AllUsers;
