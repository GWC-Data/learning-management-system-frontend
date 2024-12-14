import { Button } from "../../components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

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
        const response = await axios.get("/roles", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }); // Endpoint to fetch roles
        setRoles(response.data); // Store the roles
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
      toast.error("Please resolve all validation errors before submitting.");
      return; // Stop further execution if errors exist
    }
    const userData = { ...newUser };
    try {
      const response = await axios.post("/users", userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const createdUser = response.data.newUser;
      toast.success("User added successfully!");
      console.log(createdUser);
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
        <h2 className="text-xl font-bold mb-4">Add New User</h2>
        <form>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">First Name</label>
              <input
                type="text"
                name="firstName"
                className="w-full border rounded p-2"
                value={newUser.firstName}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block font-medium">Last Name</label>
              <input
                type="text"
                name="lastName"
                className="w-full border rounded p-2"
                value={newUser.lastName}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block font-medium">Email</label>
              <input
                type="email"
                name="email"
                className="w-full border rounded p-2"
                value={newUser.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block font-medium">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                className="w-full border rounded p-2"
                value={newUser.phoneNumber}
                onChange={handleInputChange}
              />
            </div>
            <div className="relative">
              <label className="block font-medium">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="w-full border rounded p-2"
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
              <label className="block font-medium">Date of Joining</label>
              <input
                type="date"
                name="dateOfJoining"
                className="w-full border rounded p-2"
                value={newUser.dateOfJoining}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block font-medium">Role</label>
              <select
                name="roleId"
                className="w-full border rounded p-2"
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
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleFormSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
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
