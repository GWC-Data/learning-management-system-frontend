import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ColDef } from "ag-grid-community";
import { toast } from "react-toastify";
import { Edit, Trash } from "lucide-react";
import { Button } from "../../components/ui/button";
import { format } from "date-fns";
import axios from "axios";
 
// Define a type for the trainee user
interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth?: string;
    phoneNumber?: string;
    password?: string;
    address?: string;
    qualification?: string;
    profilePic?: string;
    dateOfJoining?: string;
    accountStatus: "active" | "suspended" | "inactive";
    lastLogin?: string;
    roleId: number;
    roleName: string;
  }
 
 
const TraineePage: React.FC = () => {
  const [userData, setUserData] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // State to hold the selected user for editing
  const [formData, setFormData] = useState<User | null>(null); // State to hold form data
 
  const getToken = () => localStorage.getItem("authToken");
 
 
  const fetchUsers = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in.");
      return;
    }
 
    try {
      const response = await axios.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
 
      if (response.data && Array.isArray(response.data.Users)) {
        const trainees = response.data.Users.filter(
          (user: {
            role: any; roleName: string
}) => user.role.name.toLowerCase() === "trainee"
        );
        setUserData(trainees); // Set only trainee data
        console.log("Filtered trainee data:", trainees);
      } else {
        console.error("Unexpected data format:", response.data);
        toast.error("Unexpected response format from the server.");
      }
    } catch (error: any) {
      if (error.response) {
        console.error("Error Response Data:", error.response.data);
        toast.error(error.response.data.message || "Failed to fetch users.");
      } else {
        toast.error("Unexpected error occurred.");
      }
    }
  };
 
  useEffect(() => {
    fetchUsers();
  }, []);
 
 
  // Column Definitions for AgGridReact
  const colDefs: ColDef[] = [
      { headerName: "First Name", field: "firstName" },
      { headerName: "Last Name", field: "lastName" },
      { headerName: "Email", field: "email" },
      { headerName: "Role", field: "role.name" },
      {
        headerName: "Date of Birth",
        field: "dateOfBirth",
        valueFormatter: (params) =>
          params.value ? format(new Date(params.value), "yyyy-MM-dd") : "",
      },
      { headerName: "Phone Number", field: "phoneNumber" },
      { headerName: "Address", field: "address" },
      { headerName: "Qualification", field: "qualification" },
      {
        headerName: "Date of Joining",
        field: "dateOfJoining",
        valueFormatter: (params) =>
          params.value ? format(new Date(params.value), "yyyy-MM-dd") : "",
      },
      { headerName: "Account Status", field: "accountStatus" },
      { headerName: "Last Login", field: "lastLogin" },
   
    {
      headerName: "Actions",
      editable: false,
      field: "actions",
      cellRenderer: (params: { data: User }) => {
        const { data } = params;
        return (
          <div className="flex space-x-2">
            <Button
              onClick={() => handleEditClick(data)}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
            >
              <Edit className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => deleteUser(data)}
              className="bg-red-500 text-white p-2 rounded hover:bg-red-700"
            >
              <Trash className="h-5 w-5" />
            </Button>
          </div>
        );
      },
    },
  ];
 
    const handleEditClick = (user: User) => {
      setSelectedUser(user);
      setFormData(user);
    };
    // Handle form field changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => prev ? { ...prev, [name]: value } : null);
    };
 
  //edit user
  const editUser = (userToEdit: User) => {
    if (!formData) {
      toast.error("Form data is missing!");
      return;
    }
 
    // Prepare updated user data with the formData
    const updatedUser = {
      ...userToEdit,
      lastName: formData?.lastName || userToEdit.lastName,
      firstName: formData?.firstName || userToEdit.firstName,
      email: formData?.email || userToEdit.email,
      dateOfBirth: formData?.dateOfBirth,
      phoneNumber: formData?.phoneNumber,
      address: formData?.address,
      qualification: formData?.qualification,
      accountStatus: formData?.accountStatus,
      dateOfJoining: formData?.dateOfJoining
        ? format(new Date(formData.dateOfJoining), "yyyy-MM-dd")
        : userToEdit.dateOfJoining,
    };
 
 
    const token = getToken();
    if (!token) {
      toast.error("Authorization token not found!");
      return;
    }
 
    console.log("Updating user with data:", updatedUser);
 
    axios
      .put(`/users/${userToEdit.id}`, updatedUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("User updated:", response.data);
        setUserData((prevData) =>
          prevData.map((user) =>
            user.id === userToEdit.id ? { ...user, ...updatedUser } : user
          )
        );
        toast.success("User updated successfully!");
        setSelectedUser(null); // Optionally close the edit form here
      })
      .catch((error) => {
        console.error("Error updating user:", error);
        toast.error(error.response?.data?.message || "Failed to update user.");
      });
  };
 
 
  // Delete User function with Authorization
  const deleteUser = (userToDelete: User) => {
    const token = localStorage.getItem("authToken");
 
    if (!token) {
      toast.error("Authorization token not found!");
      return;
    }
 
    axios
      .delete(`/users/${userToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
      })
      .then(() => {
        setUserData((prev) => prev.filter((user) => user.id !== userToDelete.id));
        toast.success("User deleted successfully!");
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user.");
      });
  };
 
  return (
    <div className="flex-1 p-4 mt-5 ml-20 w-[1200px]">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 text-white px-6 py-4 rounded-lg shadow-lg mb-6">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold tracking-wide">Trainee Management</h2>
          <p className="text-sm font-light">
            Easily manage your trainees. Edit, or delete trainee records with ease.
          </p>
        </div>
      </div>
 
       {/* Edit Form - Conditional Rendering */}
       {selectedUser && (
        <div className="bg-white p-4 rounded shadow-md mb-6">
          <h3 className="text-xl font-bold mb-4">Edit User</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              editUser(formData!); // Ensure formData is not null
            }}
          >
            <div className="mb-4">
              <label className="block text-sm font-medium">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData?.firstName || ""}
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData?.lastName || ""}
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData?.email || ""}
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData?.dateOfBirth || ""}
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">PhoneNumber</label>
              <input
                type="number"
                name="phoneNumber"
                value={formData?.phoneNumber || ""}
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Address</label>
              <input
                type="text"
                name="address"
                value={formData?.address || ""}
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Qualification</label>
              <input
                type="text"
                name="qualification"
                value={formData?.qualification || ""}
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Account Status</label>
              <select
                name="accountStatus"
                value={formData?.accountStatus || "active"} // Default to "active"
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <Button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
                Save Changes
              </Button>
              <Button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
 
      <div
        className="ag-theme-quartz text-left"
        style={{ height: "calc(100vh - 180px)", width: "100%" }}
      >
        <AgGridReact
          rowSelection="multiple"
          suppressRowClickSelection
          suppressMovableColumns
          loading={userData.length === 0}
          columnDefs={colDefs}
          rowData={userData}
          defaultColDef={{
            editable: false,
            sortable: true,
            filter: true,
            resizable: true,
          }}
          animateRows
        />
      </div>
    </div>
  );
};
 
export default TraineePage;