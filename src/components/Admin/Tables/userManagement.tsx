import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ColDef } from "ag-grid-community";
import { toast } from "react-toastify";
import { Edit, Eye, Trash } from "lucide-react";
import { Button } from "../../ui/button";
import { format } from "date-fns";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  fetchUsersApi,
  updateUserApi,
  deleteUserApi,
} from "@/helpers/api/userApi";
import { fetchRolesApi } from "@/helpers/api/roleApi";

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

interface Role {
  id: number;
  name: string;
}

const UserManagement: React.FC = () => {
  const { roleName } = useParams(); // Get roleName from the URL
  const [userData, setUserData] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const getToken = () => localStorage.getItem("authToken");

  // Fetch users and roles, filtering by the roleName in the URL
  const fetchUsersAndRoles = async (roleName: string) => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in.");
      return;
    }

    try {
      const response = await fetchUsersApi();
      const responseUsers = response.Users; // Access the `Users` property
      console.log("userResp", responseUsers);

      if (response && Array.isArray(responseUsers)) {
        const filteredUsers = responseUsers.filter(
          (user: { role: any; roleName: string }) =>
            user.role.name.toLowerCase() === roleName.toLowerCase() // Filter by dynamic roleName
        );
        setUserData(filteredUsers);
        console.log("fileterdUsers", filteredUsers);
      } else {
        console.error("Unexpected data format:", response);
        toast.error("Unexpected response format from the server.");
      }

      const roleResponse = await fetchRolesApi();
      console.log("roleResponse", roleResponse);
      setRoles(roleResponse); // Set available roles
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch users or roles.");
    }
  };

  useEffect(() => {
    setSelectedUser(null);
    setFormData(null);
    setIsModalOpen(false);

    if (roleName) {
      fetchUsersAndRoles(roleName); // Fetch filtered users for the role
    }
  }, [roleName]);

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
              className="bg-white text-[#6E2B8B] p-2 rounded hover:bg-white">
              <Eye className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => handleEditClick(data)}
              className="bg-white text-[#6E2B8B] p-2 rounded hover:bg-white"
            >
              <Edit className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => confirmDeleteUser(data)}
              className="bg-white text-red-600 p-2 rounded hover:bg-white"
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
    setFormData({
      ...user,
      dateOfBirth: user.dateOfBirth ? format(new Date(user.dateOfBirth), 'yyyy-MM-dd') : '',
    });
    setIsModalOpen(true); // Open the modal
  };

  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => prev ? { ...prev, [name]: value } : null);
  };

  // Edit user
  const editUser = (userToEdit: User) => {
    if (!formData) {
      toast.error("Form data is missing!");
      return;
    }

    console.log('formdata', formData);
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
        ? format(new Date(formData?.dateOfJoining), "yyyy-MM-dd")
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
        toast.success("User updated successfully!");
        setUserData((prevData) =>
          prevData.map((user) =>
            user.id === userToEdit.id ? { ...user, ...updatedUser } : user
          )
        );
        setSelectedUser(null);
        setIsModalOpen(false); // Close the modal after saving
      })
      .catch((error) => {
        console.error("Error updating user:", error);
        toast.error(error.response?.data?.message || "Failed to update user.");
      });
  };

  // Function to open the delete confirmation modal
  const confirmDeleteUser = (data: User) => {
    const user = userData.find((user) => user.id === data.id);
    if (user) {
      setUserToDelete(user);
      setIsDeleteModalOpen(true);
    }
  };

  // Function to handle the actual deletion
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to delete a user.");
      return;
    }

    try {
      await deleteUserApi(userToDelete.id);
      toast.success("User deleted successfully!");
      setUserData((prev) => prev.filter((user) => user.id !== userToDelete.id));
    } catch (error) {
      console.error("Failed to delete user", error);
      toast.error("Failed to delete the user. Please try again later.");
    } finally {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  // Cancel the deletion
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  return (
    <div className="flex-1 p-4 mt-5 ml-20 w-[1200px] overflow-hidden">
      <div className="flex items-center justify-between bg-[#6E2B8B] text-white px-6 py-4 rounded-lg shadow-lg mb-6">
        <div className="flex flex-col">
          <h2 className="text-2xl font-metropolis font-semibold tracking-wide">
            {roleName
              ? roleName.charAt(0).toUpperCase() +
              roleName.slice(1).toLowerCase()
              : ""}{" "}
            Management
          </h2>
          <p className="text-sm font-metropolis font-medium">
            Easily manage {roleName}. Edit, or delete {roleName} records with
            ease.
          </p>
        </div>
      </div>

      {/* Custom Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[600px]">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (selectedUser) {
                  editUser(selectedUser);
                }
              }}
            >
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="mb-4">
                  <label className="block font-metropolis font-medium">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData?.firstName || ""}
                    onChange={handleInputChange}
                    className="border p-2 rounded w-full font-metropolis text-gray-400 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-metropolis font-medium">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData?.lastName || ""}
                    onChange={handleInputChange}
                    className="border p-2 rounded w-full font-metropolis text-gray-400 font-semibold"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block font-metropolis font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData?.email || ""}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full font-metropolis text-gray-400 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-metropolis font-medium">Role</label>
                  <select
                    name="roleId"
                    value={formData?.roleId || ""}
                    onChange={handleInputChange}
                    className="border p-2 rounded w-full font-metropolis text-gray-400 font-semibold"
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-metropolis font-medium">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData?.dateOfBirth || ""}
                    onChange={handleInputChange}
                    className="border p-2 rounded w-full font-metropolis text-gray-400 font-semibold"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block font-metropolis font-medium">Phone Number</label>
                <input
                  type="number"
                  name="phoneNumber"
                  value={formData?.phoneNumber || ""}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full font-metropolis text-gray-400 font-semibold"
                />
              </div>

              <div className="mb-4">
                <label className="block font-metropolis font-medium">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData?.address || ""}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full font-metropolis text-gray-400 font-semibold"
                />
              </div>

              <div className="mb-4">
                <label className="block font-metropolis font-medium">Qualification</label>
                <input
                  type="text"
                  name="qualification"
                  value={formData?.qualification || ""}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full font-metropolis text-gray-400 font-semibold"
                />
              </div>

              <div className="mb-4">
                <label className="block font-metropolis font-medium">Account Status</label>
                <select
                  name="accountStatus"
                  value={formData?.accountStatus || "active"}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full font-metropolis text-gray-400 font-semibold"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="submit"
                  className="bg-custom-gradient-btn text-white px-4 py-2 
                  transition-all duration-500 ease-in-out 
                  rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
                >
                  Save Changes
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 transition-all duration-500 ease-in-out 
                  rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-auto">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete the user details for</p>
            <strong>
              {roleName
                ? roleName.charAt(0).toUpperCase() +
                roleName.slice(1).toLowerCase()
                : ""}
            </strong>
            ?
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                onClick={handleCancelDelete}
                className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 transition-all duration-500 ease-in-out 
               rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteUser}
                className="bg-custom-gradient-btn text-white px-4 py-2 
                transition-all duration-500 ease-in-out 
               rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Ag-Grid Table */}
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

export default UserManagement;