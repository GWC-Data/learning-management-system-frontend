import { Button } from "../../components/ui/button";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Edit, Trash } from "lucide-react";
import axios from "axios";

// TypeScript types for the component props
interface RoleTableProps {
  editable?: boolean;
}

// TypeScript types for role data
interface RoleData {
  id: number;
  name: string;
  description: string;
}

// Column definitions type from AG-Grid
import { ColDef } from "ag-grid-community";

// Helper to get token
const getToken = () => localStorage.getItem("authToken");

const ManageRoles = ({ editable = true }: RoleTableProps) => {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [colDefs, setColDefs] = useState<ColDef[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newRole, setNewRole] = useState<RoleData>({
    id: 0,
    name: "",
    description: "",
  });
  

  // Fetch roles
  const fetchRoles = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to view roles.");
      return;
    }

    try {
      const response = await axios.get(`/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Fetched roles:", response.data);

      // Map and transform the roles data
      const rolesData = response.data.map((role: any) => ({
        id: role.id,
        name: role.name,
        description: role.description,
      }));

      setRoles(rolesData || []);
    } catch (error) {
      console.error("Failed to fetch roles", error);
      toast.error("Failed to fetch roles. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const addNewRow = () => {
    setEditing(false);
    setNewRole({
      id: 0,
      name: "",
      description: "",
    });
    setIsModalOpen(true);
  };

  const deleteRole = async (data: any) => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to delete a role.");
      return;
    }

    const roleId = data.data.id;
    try {
      await axios.delete(`/roles/${roleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRoles((prev) => prev.filter((role) => role.id !== roleId));
      toast.success("Role deleted successfully!");
    } catch (error) {
      console.error("Failed to delete role", error);
      toast.error("Failed to delete the role. Please try again later.");
    }
  };

  const editRole = (data: any) => {
    const roleToEdit = roles.find((role) => role.id === data.data.id);
    console.log("Role to edit:", roleToEdit);
    if (roleToEdit) {
      setEditing(true);
      setNewRole(roleToEdit);
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewRole({
      id: 0,
      name: "",
      description: "",
    });
  };

  const handleFormSubmit = async () => {
    const token = getToken();

    if (!token) {
      toast.error("You must be logged in to perform this action.");
      return;
    }

    if (editing) {
      if (!newRole.id) {
        console.error("Role ID is missing for update.");
        toast.error("Role ID is missing.");
        return;
      }

      try {
        const response = await axios.put(`/roles/${newRole.id}`, newRole, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const updatedRole = response.data;
        setRoles((prev) =>
          prev.map((role) => (role.id === newRole.id ? updatedRole : role))
        );

        toast.success("Role updated successfully!");
      } catch (error) {
        console.error("Failed to update role", error);
        toast.error("Failed to update the role. Please try again later.");
      }
    } else {
      try {
        const response = await axios.post(`/roles`, newRole, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const newRoleData = response.data;
        setRoles((prev) => [...prev, newRoleData]);
        toast.success("Role added successfully!");
      } catch (error) {
        console.error("Failed to add role", error);
        toast.error("Failed to add the role. Please try again later.");
      }
    }

    await fetchRoles();
    handleModalClose();
  };

  useEffect(() => {
    setColDefs([
      { headerName: "Role Name", field: "name", editable: false, width: 200 },
      { headerName: "Description", field: "description", editable: false, width: 200 },    
      {
        headerName: "Actions",
        field: "actions",
        width: 250,
        cellRenderer: (params: any) => (
          <div className="flex space-x-2">
            <Button
              onClick={() => editRole(params)}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
            >
              <Edit className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => deleteRole(params)}
              className="bg-red-500 text-white p-2 rounded hover:bg-red-700"
            >
              <Trash className="h-5 w-5" />
            </Button>
          </div>
        ),
        editable: false,
      },
    ]);
  }, [roles]);

  return (
    <div className="flex-1 p-4 mt-10 ml-10">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 text-white px-6 py-4 rounded-lg shadow-lg mb-6 w-[850px]">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold tracking-wide">Roles</h2>
          <p className="text-sm font-light">Manage roles easily.</p>
        </div>
        <Button
          onClick={addNewRow}
          className="bg-yellow-400 text-gray-900 font-semibold px-5 py-2 rounded-md shadow-lg hover:bg-yellow-500 transition duration-300"
        >
          + New Role
        </Button>
      </div>

      <div className="ag-theme-quartz text-left" style={{ height: "calc(100vh - 180px)", width: "68%" }}>
        <AgGridReact
          rowSelection="multiple"
          suppressRowClickSelection
          suppressMovableColumns
          loading={loading}
          columnDefs={colDefs}
          rowData={roles}
          defaultColDef={{ editable, sortable: true, filter: true, resizable: true }}
          animateRows
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">{editing ? "Edit Role" : "Add New Role"}</h2>
            <form>
              <div className="mb-4">
                <label className="block font-medium">Role Name</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium">Description</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                />
              </div>
       
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={handleModalClose}
                  className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFormSubmit}
                  className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-700"
                >
                  {editing ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRoles;
