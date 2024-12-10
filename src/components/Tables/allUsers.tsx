import React, { useEffect, useState } from "react";
import { UserCheck, Users, DollarSign, Shield, PlusCircle } from "lucide-react";
import { useNavigate, Outlet } from "react-router-dom";
import axios from "axios"; // For API calls

type Role = {
  name: string;
};

type SidebarButtonProps = {
  icon: React.ReactNode;
  label: string;
  to: string;
  onClick: () => void;
  gradient: string;
};

const SidebarButton: React.FC<SidebarButtonProps> = ({
  icon,
  label,
  onClick,
  gradient,
}) => (
  <button
    onClick={onClick}
    className={`relative flex items-center w-[280px] h-[100px] px-4 py-2 text-white font-medium ${gradient} hover:opacity-90 rounded-lg shadow-md transition-transform duration-300 transform hover:scale-105 overflow-hidden group`}
  >
    <div className="absolute inset-0 flex justify-center items-center">
      <div className="w-0 h-0 bg-white rounded-full opacity-20 scale-0 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
    </div>
    <div className="z-10 flex items-center mr-3">{icon}</div>
    <span className="z-10">{label}</span>
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
      const response = await axios.get("/roles", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(response.data)) {
        const roleNames = response.data.map((role: { name: string }) => ({
          name: role.name,
        }));
        setRoles(roleNames);
      } else {
        console.error("Unexpected response structure:", response.data);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const generateColorGradient = (index: number) => {
    const colors = [
      ["from-red-400", "via-red-500", "to-red-600"],
      ["from-green-400", "via-green-500", "to-green-600"],
      ["from-blue-400", "via-blue-500", "to-blue-600"],
      ["from-purple-400", "via-purple-500", "to-purple-600"],
      ["from-yellow-400", "via-yellow-500", "to-yellow-600"],
      ["from-pink-400", "via-pink-500", "to-pink-600"],
      ["from-indigo-400", "via-indigo-500", "to-indigo-600"],
    ];
    const colorSet = colors[index % colors.length];
    return `bg-gradient-to-r ${colorSet.join(" ")}`;
  };

  const roleIcons: Record<string, JSX.Element> = {
    Admin: <Shield />,
    Sales: <DollarSign />,
    Trainer: <Users />,
    Trainee: <UserCheck />,
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="flex justify-between items-center w-full max-w-[1150px] mb-4">
        <h1 className="text-2xl font-bold text-gray-600">User Roles</h1>
        <button
          className="flex items-center px-4 py-2 bg-slate-500 text-white border-2 font-bold hover:opacity-90 rounded-lg shadow-md transition duration-200"
          onClick={() => navigate("/allUsers/add-user")}
        >
          <PlusCircle className="mr-2" />
          <span> Add User</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        {roles.map((role, index) => (
          <SidebarButton
            key={role.name}
            icon={roleIcons[role.name]}
            label={role.name}
            to={`/allUsers/${role.name.toLowerCase()}`}
            gradient={generateColorGradient(index)}
            onClick={() => navigate(`/allUsers/${role.name.toLowerCase()}`)}
          />
        ))}
      </div>

      <div className="mt-6 w-full">
        <Outlet />
      </div>
    </div>
  );
};

export default AllUsers;