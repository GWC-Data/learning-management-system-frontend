import { Button } from "../../components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

    if (!newUser.firstName) newErrors.firstName = "First name is required.";
    if (!newUser.lastName) newErrors.lastName = "Last name is required.";
    if (!newUser.email) newErrors.email = "Email is required.";
    if (!newUser.phoneNumber) newErrors.phoneNumber = "Phone number is required.";
    if (!newUser.password) newErrors.password = "Password is required.";
    if (!newUser.dateOfJoining) newErrors.dateOfJoining = "Date of joining is required.";
    if (!newUser.roleId) newErrors.roleId = "Role is required.";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    const validate = validateFields();

    if (!validate) {
      toast.error("Please fill in all required fields.");
    }

    if (!token) {
      toast.error("You must be logged in to add a user.");
      return;
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
        navigate("/allUsers/admin", { state: { user: createdUser } });
      } else if (createdUser.role && createdUser.role.name === "Sales") {
        navigate("/allUsers/sales", { state: { user: createdUser } });
      } else if (createdUser.role && createdUser.role.name === "Trainer") {
        navigate("/allUsers/trainer", { state: { user: createdUser } });
      } else {
        navigate("/allUsers/trainee", { state: { user: createdUser } });
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user. Please try again later.");
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
            <div>
              <label className="block font-medium">Password</label>
              <input
                type="password"
                name="password"
                className="w-full border rounded p-2"
                value={newUser.password}
                onChange={handleInputChange}
              />
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
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button onClick={() => navigate("/allUsers")} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700">
              Cancel
            </Button>
            <Button type="button" onClick={handleFormSubmit} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;