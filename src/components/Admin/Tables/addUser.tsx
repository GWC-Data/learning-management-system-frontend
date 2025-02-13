import { Button } from "../../ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { createUserApi } from "@/helpers/api/userApi";
import { fetchRolesApi } from "@/helpers/api/roleApi";

interface Role {
  id: number;
  name: string;
}

const AddUser = () => {
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    dateOfJoining: "",
    roleId: "",
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Get auth token from localStorage
  const getToken = () => localStorage.getItem("authToken");

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      const token = getToken();
      if (!token) {
        toast.error("You must be logged in to add a user.");
        return;
      }
      try {
        const roleResponse = await fetchRolesApi();
        console.log("roleResponse", roleResponse);
        setRoles(roleResponse); // Store the roles
      } catch (error) {
        toast.error("Failed to load roles.");
      }
    };
    fetchRoles();
  }, []);

  const validateFields = () => {
    const newErrors: Record<string, string> = {};
    // Basic field validations
    if (!newUser.firstName) newErrors.firstName = "First name is required.";
    if (!newUser.lastName) newErrors.lastName = "Last name is required.";
    if (!newUser.email) newErrors.email = "Email is required.";
    if (!newUser.phoneNumber)
      newErrors.phoneNumber = "Phone number is required.";
    if (!newUser.dateOfJoining)
      newErrors.dateOfJoining = "Date of joining is required.";
    if (!newUser.roleId) newErrors.roleId = "Role is required.";
    // Password validation
    if (!newUser.password) {
      newErrors.password = "Password is required.";
    } else {
      const password = newUser.password;
      const hasMinLength = password.length >= 8;
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      if (!hasMinLength) {
        newErrors.password = "Password must be at least 8 characters long.";
      } else if (!hasUpperCase) {
        newErrors.password =
          "Password must contain at least one uppercase letter.";
      } else if (!hasLowerCase) {
        newErrors.password =
          "Password must contain at least one lowercase letter.";
      } else if (!hasNumber) {
        newErrors.password = "Password must contain at least one number.";
      } else if (!hasSpecialChar) {
        newErrors.password =
          "Password must contain at least one special character.";
      }
    }

    setErrors(newErrors);
    // Show errors in toast notifications
    Object.entries(newErrors).forEach(([field, message]) => {
      toast.error(`${field}: ${message}`);
    });
    return newErrors;
  };

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to add a user.");
      return;
    }
    const validationErrors = validateFields();
    // Check if there are any validation errors
    if (Object.keys(validationErrors).length > 0) {
      return; // Stop further execution if errors exist
    }
    const userData = { ...newUser };
    try {
      const response = await createUserApi(userData);
      console.log("Response for creating the new user", response);

      const createdUser = response.newUser;

      toast.success("User added successfully!");
      // Redirect based on the user's role
      if (createdUser.role && createdUser.role.name === "Admin") {
        navigate("/admin/allUsers/admin", { state: { user: createdUser } });
      } else if (createdUser.role && createdUser.role.name === "Sales") {
        navigate("/admin/allUsers/sales", { state: { user: createdUser } });
      } else if (createdUser.role && createdUser.role.name === "Trainer") {
        navigate("/admin/allUsers/trainer", { state: { user: createdUser } });
      } else {
        navigate("/admin/allUsers/trainee", { state: { user: createdUser } });
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user. Please try again later.");
    }
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[600px]">
        <h2 className="text-xl font-metropolis font-semibold mb-4">
          Add New User
        </h2>
        <form>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-metropolis font-medium">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
                value={newUser.firstName}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block font-metropolis font-medium">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
                value={newUser.lastName}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block font-metropolis font-medium">Email</label>
              <input
                type="email"
                name="email"
                className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
                value={newUser.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block font-metropolis font-medium">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
                value={newUser.phoneNumber}
                onChange={handleInputChange}
              />
            </div>
            <div className="relative">
              <label className="block font-metropolis font-medium">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
                value={newUser.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                className="absolute right-2 top-9"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <IoMdEye className="h-5 w-5 text-gray-600" />
                ) : (
                  <IoMdEyeOff className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </div>
            <div>
              <label className="block font-metropolis font-medium">
                Date of Joining
              </label>
              <input
                type="date"
                name="dateOfJoining"
                className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
                value={newUser.dateOfJoining}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block font-metropolis font-medium">Role</label>
              <select
                name="roleId"
                className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
                value={newUser.roleId}
                onChange={handleInputChange}
              >
                <option>Select Role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              onClick={() => navigate("/admin/allUsers")}
              className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 transition-all duration-500 ease-in-out
               rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleFormSubmit}
              className="bg-custom-gradient-btn text-white px-4 py-2
                transition-all duration-500 ease-in-out
               rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
