import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ColDef } from "ag-grid-community";
import { toast } from "react-toastify";
import { Edit, Trash } from "lucide-react";
import { Button } from "../../components/ui/button";

// Define a type for the trainee user
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  phone: string;
  qualification: string;
  dateOfJoining: string;
  accountStatus: string;
  role: string;
  lastLogin: string;
}

// TraineePage component
const TraineePage: React.FC = () => {
  const location = useLocation();
  const user = location.state?.user as User | undefined;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newUser, setNewUser] = useState<User>({
    id: 0,
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    phone: "",
    qualification: "",
    dateOfJoining: "",
    accountStatus: "Active",
    role: "Trainee",
    lastLogin: "",
  });

  const [userData, setUserData] = useState<User[]>([
    {
      id: 1,
      firstName: "Alex",
      lastName: "Johnson",
      email: "alex.johnson@example.com",
      role: "Trainee",
      dob: "1998-06-15",
      phone: "321-654-9870",
      qualification: "BSc in Physical Therapy",
      dateOfJoining: "2023-02-10",
      accountStatus: "Active",
      lastLogin: "2023-11-19",
    },
    {
      id: 2,
      firstName: "Emma",
      lastName: "Williams",
      email: "emma.williams@example.com",
      role: "Trainee",
      dob: "2000-05-25",
      phone: "654-321-0987",
      qualification: "BSc in Exercise Science",
      dateOfJoining: "2022-09-18",
      accountStatus: "Inactive",
      lastLogin: "2023-11-15",
    },
  ]);

  // Update the userData when a new user is passed from location
  useEffect(() => {
    if (user) {
      setUserData((prevData) => {
        const existingUserIndex = prevData.findIndex(
          (existingUser) => existingUser.id === user.id
        );
        if (existingUserIndex > -1) {
          const updatedData = [...prevData];
          updatedData[existingUserIndex] = user;
          return updatedData;
        } else {
          return [...prevData, user];
        }
      });
    }
  }, [user]);

  // Column Definitions for AgGridReact
  const colDefs: ColDef[] = [
    { headerName: "First Name", field: "firstName", editable: false },
    { headerName: "Last Name", field: "lastName", editable: false },
    { headerName: "Email", field: "email", editable: false },
    { headerName: "Role", field: "role", editable: false },
    { headerName: "DOB", field: "dob", editable: false },
    { headerName: "Phone", field: "phone", editable: false },
    { headerName: "Qualification", field: "qualification", editable: false },
    { headerName: "Date of Joining", field: "dateOfJoining", editable: false },
    { headerName: "Account Status", field: "accountStatus", editable: false },
    { headerName: "Last Login", field: "lastLogin", editable: false },
    {
      headerName: "Actions",
      editable: false,
      field: "actions",
      cellRenderer: (params: { data: any; }) => {
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
    if (userToEdit) {
      setEditing(true);
      setNewUser(userToEdit);
      setIsModalOpen(true);
    }
  };

  // Delete User function
  const deleteUser = (userToDelete: User) => {
    const userIdToDelete = userToDelete.id;
    setUserData((prev) => prev.filter((user) => user.id !== userIdToDelete));
    toast.success("Trainee deleted successfully!");
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
      role: "Trainee",
      lastLogin: "",
    });
  };

  // Form Submit Handler
  const handleFormSubmit = () => {
    if (editing) {
      setUserData((prev) =>
        prev.map((user) => (user.id === newUser.id ? newUser : user))
      );
      toast.success("Trainee updated successfully!");
    } else {
      setUserData((prev) => [
        ...prev,
        { ...newUser, id: Date.now() },
      ]);
      toast.success("Trainee added successfully!");
    }
    handleModalClose();
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
          loading={false}
          columnDefs={colDefs}
          rowData={userData}
          defaultColDef={{
            editable: true,
            sortable: true,
            filter: true,
            resizable: true,
          }}
          animateRows
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[600px]">
            <h2 className="text-xl font-bold mb-4">
              {editing ? "Edit Trainee" : "Add New Trainee"}
            </h2>
            <form>
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block font-medium">Date of Birth</label>
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
                    type="text"
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
                      setNewUser({
                        ...newUser,
                        qualification: e.target.value,
                      })
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
                      setNewUser({
                        ...newUser,
                        dateOfJoining: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block font-medium">Account Status</label>
                  <select
                    className="w-full border rounded p-2"
                    value={newUser.accountStatus}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        accountStatus: e.target.value,
                      })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <Button
                  onClick={handleModalClose}
                  className="bg-gray-400 text-white p-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFormSubmit}
                  className="bg-green-500 text-white p-2 rounded hover:bg-green-700"
                >
                  {editing ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TraineePage;
