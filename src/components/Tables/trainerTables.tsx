import { useLocation} from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { useState } from "react";
import { toast } from "react-toastify";
import { Edit, Trash } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useEffect } from "react";

// TrainerPage component
const TrainerPage = () => {
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
    dob: "",
    phone: "",
    qualification: "",
    dateOfJoining: "",
    accountStatus: "Active",
    role: "Trainer",
    lastLogin: "",
  });

  const [userData, setUserData] = useState([
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      role: "Trainer",
      dob: "1985-07-10",
      phone: "123-456-7890",
      qualification: "MSc in Physical Education",
      dateOfJoining: "2020-01-15",
      accountStatus: "Active",
      lastLogin: "2023-11-20",
    },
    {
      id: 2,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      role: "Trainer",
      dob: "1990-03-22",
      phone: "987-654-3210",
      qualification: "BSc in Sports Science",
      dateOfJoining: "2021-03-12",
      accountStatus: "Inactive",
      lastLogin: "2023-11-18",
    },
  ]);

  // Column Definitions for AgGridReact
  const colDefs = [
    { headerName: "First Name", field: "firstName" },
    { headerName: "Last Name", field: "lastName" },
    { headerName: "Email", field: "email" },
    { headerName: "Role", field: "role" },
    { headerName: "DOB", field: "dob" },
    { headerName: "Phone", field: "phone" },
    { headerName: "Qualification", field: "qualification" },
    { headerName: "Date of Joining", field: "dateOfJoining" },
    { headerName: "Account Status", field: "accountStatus" },
    { headerName: "Last Login", field: "lastLogin" },
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

  // Update the userData when a new user is passed from location
  useEffect(() => {
    if (user) {
      // Check if user exists and update or add the user
      setUserData((prevData) => {
        const existingUserIndex = prevData.findIndex(
          (existingUser) => existingUser.id === user.id
        );
        if (existingUserIndex > -1) {
          // If user exists, replace with updated user
          const updatedData = [...prevData];
          updatedData[existingUserIndex] = user;
          return updatedData;
        } else {
          // If it's a new user, add to the list
          return [...prevData, user];
        }
      });
    }
  }, [user]);

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
    const userIdToDelete = params.data.id;
    console.log("Deleting user with id:", userIdToDelete); // Check if this logs the correct user ID

    // Delete the user from userData
    setUserData((prev) => {
      const updatedData = prev.filter((user) => user.id !== userIdToDelete);
      console.log("Updated data after deletion:", updatedData); // Check if the user is correctly removed
      toast.success("Trainee deleted successfully!");
      return updatedData;
    });
  };

  // Modal Close Handler
  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewUser({
      id: 0,
      firstName: "",
      lastName: "",
      email: "",
      dob: "",
      phone: "",
      qualification: "",
      dateOfJoining: "",
      accountStatus: "Active",
      role: "Trainer",
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
        <h2 className="text-2xl font-bold tracking-wide">Trainer Management</h2>
        <p className="text-sm font-light">Easily manage your trainers. Edit, or delete trainer records with ease.</p>
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
          loading={false}
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
                  <label className="block font-medium">DOB</label>
                  <input
                    type="date"
                    className="w-full border rounded p-2"
                    value={newUser.dob}
                    onChange={(e) =>
                      setNewUser({ ...newUser, dob: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block font-medium">Phone</label>
                  <input
                    type="tel"
                    className="w-full border rounded p-2"
                    value={newUser.phone}
                    onChange={(e) =>
                      setNewUser({ ...newUser, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block font-medium">Qualification</label>
                  <input
                    type="text"
                    className="w-full border rounded p-2"
                    value={newUser.qualification}
                    onChange={(e) =>
                      setNewUser({ ...newUser, qualification: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block font-medium">Date of Joining</label>
                  <input
                    type="date"
                    className="w-full border rounded p-2"
                    value={newUser.dateOfJoining}
                    onChange={(e) =>
                      setNewUser({ ...newUser, dateOfJoining: e.target.value })
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

export default TrainerPage;
