import { useLocation } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { useState } from "react";
import { toast } from "react-toastify";
import { Edit, Trash } from "lucide-react";
import { Button } from "../../components/ui/button";

const FinancePage = () => {
  const location = useLocation();
  const user = location.state?.user; // Access the user data passed from UserTable

  // State for modal, editing, and new user data
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newUser, setNewUser] = useState({
    id: 0,
    firstName: "",
    lastName: "",
    email: "",
    accountStatus: "Active",
    role: "Finance",
    lastLogin: "",
  });

  const [userData, setUserData] = useState([
    {
      id: 1,
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
      role: "Finance",
      accountStatus: "Active",
      lastLogin: "2023-11-21",
    },
    {
      id: 2,
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@example.com",
      role: "Finance",
      accountStatus: "Inactive",
      lastLogin: "2023-11-18",
    },
  ]);

  // Column Definitions for AgGridReact
  const colDefs = [
    { headerName: "First Name", field: "firstName", editable: false },
    { headerName: "Last Name", field: "lastName", editable: false },
    { headerName: "Email", field: "email", editable: false },
    { headerName: "Role", field: "role", editable: false },
    { headerName: "Account Status", field: "accountStatus", editable: false },
    { headerName: "Last Login", field: "lastLogin", editable: false },
    {
      headerName: "Actions",
      field: "actions",
      cellRenderer: (params: any) => (
        <div className="flex space-x-2">
          <Button onClick={() => editUser(params)} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700">
            <Edit className="h-5 w-5" />
          </Button>
          <Button onClick={() => deleteUser(params)} className="bg-red-500 text-white p-2 rounded hover:bg-red-700">
            <Trash className="h-5 w-5" />
          </Button>
        </div>
      ),
    },
  ];

  // Append the user data to the dummy data if it's available
  const rowData = user ? [...userData, user] : userData;

  // Edit User function
  const editUser = (params: any) => {
    const userToEdit = userData.find((user) => user.id === params.data.id);
    if (userToEdit) {
      setEditing(true);
      setNewUser(userToEdit);
      setIsModalOpen(true);
    }
  };

  // Delete User function
  const deleteUser = (params: any) => {
    setUserData((prev) => prev.filter((user) => user.id !== params.data.id));
    toast.success("User deleted successfully!");
  };

  // Modal Close Handler
  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewUser({
      id: 0,
      firstName: "",
      lastName: "",
      email: "",
      accountStatus: "Active",
      role: "Finance",
      lastLogin: "",
    });
  };

  // Form Submit Handler
  const handleFormSubmit = () => {
    if (editing) {
      // Update existing user
      setUserData((prev) =>
        prev.map((user) => (user.id === newUser.id ? newUser : user))
      );
      toast.success("User updated successfully!");
    } else {
      // Add new user
      setUserData((prev) => [
        ...prev,
        { ...newUser, id: Date.now() },
      ]);
      toast.success("User added successfully!");
    }

    handleModalClose();
  };

  return (
    <div className="flex-1 p-4 mt-5 ml-7 w-[1200px]">
      
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 text-white px-6 py-4 rounded-lg shadow-lg mb-6">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold tracking-wide">Finance Management</h2>
        <p className="text-sm font-light">Easily manage your financial records. Track, update, and delete transactions with ease.</p>
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
          columnDefs={colDefs}
          rowData={rowData}
          defaultColDef={{ editable: true, sortable: true, filter: true, resizable: true }}
          animateRows
        />
      </div>

      {/* Modal for Editing or Adding User */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[600px]">
            <h2 className="text-xl font-bold mb-4">
              {editing ? "Edit User" : "Add New User"}
            </h2>
            <form>
              <div className="grid grid-cols-2 gap-4">
                {/* Form Fields */}
                <div>
                  <label className="block font-medium">First Name</label>
                  <input
                    type="text"
                    className="w-full border rounded p-2"
                    value={newUser.firstName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, firstName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block font-medium">Last Name</label>
                  <input
                    type="text"
                    className="w-full border rounded p-2"
                    value={newUser.lastName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, lastName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block font-medium">Email</label>
                  <input
                    type="email"
                    className="w-full border rounded p-2"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block font-medium">Account Status</label>
                  <select
                    className="w-full border rounded p-2"
                    value={newUser.accountStatus}
                    onChange={(e) =>
                      setNewUser({ ...newUser, accountStatus: e.target.value })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium">Last Login</label>
                  <input
                    type="date"
                    className="w-full border rounded p-2"
                    value={newUser.lastLogin}
                    onChange={(e) =>
                      setNewUser({ ...newUser, lastLogin: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2 text-center mt-4">
                  <button
                    type="button"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={handleFormSubmit}
                  >
                    {editing ? "Update User" : "Add User"}
                  </button>
                  <button
                    type="button"
                    className="bg-gray-500 text-white px-4 py-2 rounded ml-4 hover:bg-gray-700"
                    onClick={handleModalClose}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancePage;
