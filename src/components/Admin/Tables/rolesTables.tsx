import { Button } from "../../ui/button";
import { Badge } from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Edit, Trash } from "lucide-react";
import axios from "axios";
import { 
  createRoleApi, 
  deleteRoleApi, 
  updateRoleApi 
} from "@/helpers/api/roleApi";

// TypeScript interfaces
interface Permission {
  id: number;
  action: string;
}

interface RoleData {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
}

interface RoleTableProps {
  editable?: boolean;
  initialPermissions?: Permission[]; // Passing permissions as a prop
}

// Helper function to get token
const getToken = () => localStorage.getItem("authToken");

const ManageRoles = ({ editable = true }: RoleTableProps) => {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [colDefs, setColDefs] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<RoleData | null>(null);
  const [newRole, setNewRole] = useState<RoleData>({
    id: 0,
    name: "",
    description: "",
    permissions: [],
  });

  const validateFields = () => {
    const newErrors: Record<string, string> = {};
    
    if (!newRole.name) newErrors.name = 'RoleName is required.';
    if (!newRole.description) newErrors.description = 'description is required.';
    if (!newRole.permissions) newErrors.permissions = 'Atleast choose any one Permission';

    setErrors(newErrors);

    Object.entries(newErrors).forEach(([field, message]) => {
      toast.error(`${field}: ${message}`);
    });

    return newErrors;
  }

  const [availablePermissions, setAvailablePermissions] = useState<
    Permission[]
  >([]);

  const fetchPermissions = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to fetch permissions.");
      return;
    }

    try {
      const permissionResponse = await axios.get("/permissions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Check if the response is an array
      if (Array.isArray(permissionResponse.data)) {
        const permissionsData = permissionResponse.data.map((perm: any) => ({
          id: perm.id, // Ensure 'id' exists in the response
          action: perm.action, // Assuming 'action' exists in each permission
        }));
        setAvailablePermissions(permissionsData); // Now the data includes 'id' and 'action'
      } else {
        // If it's not an array, check if it's an object and handle accordingly
        if (permissionResponse.data && permissionResponse.data.permissions) {
          const permissionsData = permissionResponse.data.permissions.map(
            (perm: any) => ({
              id: perm.id, // Ensure 'id' exists in the response
              action: perm.action, // Assuming 'action' exists
            })
          );
          setAvailablePermissions(permissionsData); // Now the data includes 'id' and 'action'
        } else {
          setAvailablePermissions([]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch permissions", error);
      toast.error("Failed to fetch permissions. Please try again later.");
    }
  };

  // Fetch roles - Now only fetching roles, not permissions
  const fetchRoles = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to view roles.");
      return;
    }

    try {
      const rolesResponse = await axios.get(`/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rolesData = rolesResponse.data.map((role: any) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions.map((perm: any) => ({
          groupName: perm.groupName,
          action: perm.action,
        })),
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
    fetchPermissions(); // Fetch the permissions when the component mounts
  }, []);

  // Add new row
  const addNewRow = () => {
    setEditing(false);
    setNewRole({ id: 0, name: "", description: "", permissions: [] });
    setIsModalOpen(true);
  };

  // Function to open the delete confirmation modal
  const confirmDeleteRole = (data: any) => {
    const role = roles.find((role) => role.id === data.data.id);
    if (role) {
      setRoleToDelete(role);
      setIsDeleteModalOpen(true);
    }
  };

  // Function to handle the actual deletion
  const handleDeleteRole = async () => {
    if (!roleToDelete) return;

    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to delete a role.");
      return;
    }

    try {
      await deleteRoleApi(roleToDelete.id);
      setRoles((prev) => prev.filter((role) => role.id !== roleToDelete.id));
      toast.success("Role deleted successfully!");
    } catch (error) {
      console.error("Failed to delete role", error);
      toast.error("Failed to delete the role. Please try again later.");
    } finally {
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
    }
  };

  // Cancel the deletion
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setRoleToDelete(null);
  };

  // Edit a role
  const editRole = (data: any) => {
    const roleToEdit = roles.find((role) => role.id === data.data.id);
    if (roleToEdit) {
      setEditing(true);
      setNewRole(roleToEdit);
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewRole({ id: 0, name: "", description: "", permissions: [] });
  };

  // Submit form data
  const handleFormSubmit = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to perform this action.");
      return;
    }

    const validationErrors = validateFields();
    // Check if there are any validation errors
    if (Object.keys(validationErrors).length > 0) {
      return; // Stop further execution if errors exist
    }

    const payload = {
      ...newRole,
      permissions: newRole.permissions.map((perm) => perm.action),
    };

    try {
      if (editing) {
        const updatedCategory = await updateRoleApi(newRole.id, payload);
        toast.success("Role updated successfully!");
      } else {
        const newRoleData = await createRoleApi(payload);
        toast.success("Role added successfully!");
      }
      await fetchRoles();
    } catch (error) {
      console.error("Failed to save role", error);
      toast.error("Failed to save the role. Please try again later.");
    } finally {
      handleModalClose();
    }
  };

  const getRandomColor = () => {
    // Generate a random vibrant soft light color in HEX format
    const r = Math.floor(Math.random() * 75) + 180; // Generate red in the range of 180-255
    const g = Math.floor(Math.random() * 75) + 180; // Generate green in the range of 180-255
    const b = Math.floor(Math.random() * 75) + 180; // Generate blue in the range of 180-255

    // Return the color in HEX format
    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  // Column definitions
  useEffect(() => {
    setColDefs([
      { headerName: "Role Name", field: "name", editable: false, width: 150 },
      {
        headerName: "Description",
        field: "description",
        editable: false,
        width: 270,
      },
      {
        headerName: "Permissions",
        field: "permissions",
        width: 600,
        cellRenderer: (params: any) => {
          const permissions = Array.isArray(params.value) ? params.value : [];

          return permissions.map((perm: any) => {
            const color = getRandomColor(); // Assign a random color to each permission badge
            const key = perm.id ? perm.id : `${perm.action}-${Math.random()}`;

            return (
              <Badge
                key={key} // Ensure each badge has a unique key using the permission's id
                style={{ backgroundColor: color }} // Apply the random color
                className="rounded-xl mr-1 p-2 text-xs"
              >
                {perm.action}
              </Badge>
            );
          });
        },
        editable: false,
      },

      {
        headerName: "Actions",
        field: "actions",
        width: 200,
        cellRenderer: (params: any) => (
          <div className="flex space-x-2">
            <Button
              onClick={() => editRole(params)}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
            >
              <Edit className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => confirmDeleteRole(params)}
              className="bg-red-500 text-white p-2 rounded hover:bg-red-700"
            >
              <Trash className="h-5 w-5" />
            </Button>
          </div>
        ),
      },
    ]);
  }, [roles]);

  return (
    <div className="flex-1 p-4 mt-10 ml-20">
      <div className="flex items-center justify-between bg-[#6E2B8B] text-white px-6 py-4 rounded-lg shadow-lg mb-6 w-[1165px]">
        <div className="flex flex-col">
          <h2 className="text-2xl font-metropolis font-semibold tracking-wide">
            Roles & Permissions
          </h2>
          <p className="text-sm font-metropolis font-medium">
            Manage roles and permissions easily.
          </p>
        </div>
        <Button
          onClick={addNewRow}
          className="bg-yellow-400 text-gray-900 font-metropolis font-semibold px-5 py-2 rounded-md shadow-lg hover:bg-yellow-500"
        >
          + New Role with Permission
        </Button>
      </div>

      <div
        className="ag-theme-quartz text-left"
        style={{ height: "calc(100vh - 180px)", width: "93%" }}
      >
        <AgGridReact
          rowSelection="multiple"
          suppressRowClickSelection
          loading={loading}
          columnDefs={colDefs}
          rowData={roles}
          defaultColDef={{
            editable,
            sortable: true,
            filter: true,
            resizable: true,
          }}
          animateRows
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-metropolis font-semibold mb-4">
              {editing ? "Edit Role" : "Add New Role"}
            </h2>
            <form>
              <div className="mb-4">
                <label className="block font-metropolis font-medium">Role Name</label>
                <input
                  type="text"
                  className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
                  value={newRole.name}
                  onChange={(e) =>
                    setNewRole({ ...newRole, name: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block font-metropolis font-medium">Description</label>
                <input
                  type="text"
                  className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
                  value={newRole.description}
                  onChange={(e) =>
                    setNewRole({ ...newRole, description: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block font-metropolis font-medium">Permissions</label>
                <select
                  multiple
                  className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
                  value={newRole.permissions.map((perm) => perm.action || "")} // Ensure this is mapped correctly
                  onChange={(e) => {
                    // Get selected option values (action strings)
                    const selectedActions = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    );

                    // Log the selected actions for debugging

                    // Filter available permissions based on the selected actions
                    const selectedPermissions = availablePermissions.filter(
                      (perm) => selectedActions.includes(perm.action)
                    );

                    // Update the role's permissions state
                    setNewRole({
                      ...newRole,
                      permissions: selectedPermissions,
                    });
                  }}
                >
                  {/* Ensure availablePermissions is populated */}
                  {availablePermissions.length === 0 ? (
                    <option disabled>No permissions available</option>
                  ) : (
                    availablePermissions.map((perm) => (
                      <option key={perm.action} value={perm.action}>
                        {" "}
                        {/* Use action as the key */}
                        {perm.action}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={handleModalClose}
                  className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 transition-all duration-500 ease-in-out 
               rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFormSubmit}
                  className="bg-custom-gradient-btn text-white px-4 py-2 
                transition-all duration-500 ease-in-out 
               rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
                >
                  {editing ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && roleToDelete &&(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-auto">
            <h2 className="text-xl font-metropolis font-semibold mb-4">Confirm Delete</h2>
            <p className="font-metropolis font-medium">
              Are you sure you want to delete the Role 
              <strong>
              {roleToDelete?.name?.charAt(0).toUpperCase() + 
              roleToDelete?.name?.slice(1).toLowerCase() || 'this role'}
                </strong>
                ?
                
            </p>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                onClick={handleCancelDelete}
                className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 transition-all duration-500 ease-in-out 
               rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteRole}
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
    </div>
  );
};

export default ManageRoles;
