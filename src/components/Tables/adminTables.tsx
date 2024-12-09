import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ColDef } from "ag-grid-community";
import { toast } from "react-toastify";
import { Edit, Trash } from "lucide-react";
import { Button } from "../../components/ui/button";
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
  }
  

const AdminPage: React.FC = () => {
  const [userData, setUserData] = useState<User[]>([]);

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
  
      console.log("API Response:", response);
  
      if (response.data && Array.isArray(response.data.Users)) {
        // Filter only 'trainee' role users (assume roleId for trainee is known, e.g., 3)
        const trainees = response.data.Users.filter((user: { roleId: number; }) => user.roleId === 1);
        setUserData(trainees); // Set only trainee data
        console.log("Filtered trainee data:", trainees);
      } else {
        console.error("Unexpected data format:", response.data);
        toast.error("Unexpected response format from the server.");
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
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
      { headerName: "Role", field: "roleId" }, 
      { headerName: "Date of Birth", field: "dateOfBirth" },
      { headerName: "Phone Number", field: "phoneNumber" },
      { headerName: "Address", field: "address" },
      { headerName: "Qualification", field: "qualification" },
      { headerName: "Date of Joining", field: "dateOfJoining" },
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
              onClick={() => editUser(data)}
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

  // Edit User function
  const editUser = (userToEdit: User) => {
    const updatedUser = { ...userToEdit, firstName: "Updated Name" }; // Modify as necessary
    axios
      .put(`/users/${userToEdit.id}`, updatedUser)
      .then((response) => {
        console.log("User updated:", response.data); // Debugging: Log updated user
        setUserData((prevData) =>
          prevData.map((user) =>
            user.id === userToEdit.id ? { ...user, ...updatedUser } : user
          )
        );
        toast.success("User updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating user:", error);
        toast.error("Failed to update user.");
      });
  };

  // Delete User function
  const deleteUser = (userToDelete: User) => {
    axios
      .delete(`/users/${userToDelete.id}`)
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
    <div className="flex-1 p-4 mt-5 ml-7 w-[1200px]">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 text-white px-6 py-4 rounded-lg shadow-lg mb-6">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold tracking-wide">Trainee Management</h2>
          <p className="text-sm font-light">
            Easily manage your trainees. Edit, or delete trainee records with ease.
          </p>
        </div>
      </div>

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

export default AdminPage;


