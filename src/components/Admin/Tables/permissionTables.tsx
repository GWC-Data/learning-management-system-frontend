import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../../../components/ui/tooltip";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import { Edit } from "lucide-react";
import remove from '../../../assets/delete.png';

import {
  fetchPermissionsApi,
  createPermissionApi,
  updatePermissionApi,
  deletePermissionApi,
} from "@/helpers/api/permissionApi";

// TypeScript types for the component props
interface PermissionTableProps {
  editable?: boolean;
}

// TypeScript types for permission data
interface PermissionData {
  id: string;
  action: string;
  description: string;
  groupName: string;
}

// Column definitions type from AG-Grid
import { ColDef } from "ag-grid-community";

// Helper to get token
const getToken = () => localStorage.getItem("authToken");

const ManagePermissions = ({ editable = true }: PermissionTableProps) => {
  const [permissions, setPermissions] = useState<PermissionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [colDefs, setColDefs] = useState<ColDef[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] =
    useState<PermissionData | null>(null);
  const [newPermission, setNewPermission] = useState<PermissionData>({
    id: "",
    action: "",
    description: "",
    groupName: "",
  });

  const validateFields = () => {
    const newErrors: Record<string, string> = {};

    if (!newPermission.action) newErrors.action = "action is required.";
    if (!newPermission.description)
      newErrors.description = "description is required.";
    if (!newPermission.groupName)
      newErrors.groupName = "Group name must be required";

    setErrors(newErrors);

    Object.entries(newErrors).forEach(([field, message]) => {
      toast.error(`${field}: ${message}`);
    });

    return newErrors;
  };


  {/* pagination */ }
  const recordsPerPage = 10;
  const totalPages = Math.ceil(permissions.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentData = permissions.slice(startIndex, startIndex + recordsPerPage);

  const handlePageChange = (newPage: SetStateAction<number>) => {
    setCurrentPage(newPage);
  };

  const fetchPermissionsData = async () => {
    try {
      const permissionsData = await fetchPermissionsApi();
      console.log("Fetched Permissions:", permissionsData);
      if (Array.isArray(permissionsData)) {
        setPermissions([...permissionsData]); // Ensure state updates
        console.log("Updated Permissions State:", permissionsData);
      } else {
        console.error("Invalid permissions format:", permissionsData);
        toast.error("Unexpected response format.");
      }
    } catch (error) {
      console.error("Failed to fetch permissions", error);
      toast.error("Failed to fetch permissions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissionsData();
  }, []);

  useEffect(() => {
    console.log("Rendering PermissionTable with permissions:", permissions);
  }, [permissions]); // Track re-renders when permissions change


  const addNewPermission = () => {
    setEditing(false);
    setNewPermission({
      id: "",
      action: "",
      description: "",
      groupName: "",
    });
    setIsModalOpen(true);
  };

  const deletePermissionData = async () => {
    if (!permissionToDelete) {
      toast.error("No permission selected for deletion.");
      return;
    }

    try {
      await deletePermissionApi(permissionToDelete.action);

      setPermissions((prev) =>
        prev.filter(
          (permission) => permission.action !== permissionToDelete.action
        )
      );
      toast.success("Permission deleted successfully!");
    } catch (error) {
      console.error("Failed to delete permission", error);
      toast.error("Failed to delete the permission. Please try again later.");
    } finally {
      setDeleteModalOpen(false);
      setPermissionToDelete(null);
    }
  };

  const confirmDelete = (params: any) => {
    if (!params || !params.data) {
      console.error("Invalid data passed to confirmDelete:", params);
      toast.error("Permission not found.");
      return;
    }

    const permission = permissions.find(
      (perm) => perm.action === params.data.action
    );
    if (permission) {
      setPermissionToDelete(permission);
      setDeleteModalOpen(true);
    } else {
      console.error("Permission not found for deletion.");
      toast.error("Permission not found.");
    }
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setPermissionToDelete(null);
  };

  const editPermission = (data: any) => {
    const permissionToEdit = permissions.find(
      (permission) => permission.action === data.data.action
    );
    if (permissionToEdit) {
      setEditing(true);
      setNewPermission(permissionToEdit);
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewPermission({
      id: "",
      action: "",
      description: "",
      groupName: "",
    });
  };

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

    if (editing) {
      if (!newPermission.action) {
        console.error("Permission ID is missing for update.");
        toast.error("Permission ID is missing.");
        return;
      }

      try {
        const updatedPermission = await updatePermissionApi(
          newPermission.action,
          newPermission
        );
        setPermissions((prev) =>
          prev.map((permission) =>
            permission.action === newPermission.action
              ? updatedPermission
              : permission
          )
        );

        toast.success("Permission updated successfully!");
      } catch (error) {
        console.error("Failed to update permission", error);
        toast.error("Failed to update the permission. Please try again later.");
      }
    } else {
      try {
        const newPermissionData = await createPermissionApi(newPermission);
        toast.success("Permission added successfully!");
        setPermissions((prev) => [...prev, newPermissionData]);
      } catch (error) {
        console.error("Failed to add permission", error);
        toast.error("Failed to add the permission. Please try again later.");
      }
    }

    await fetchPermissionsData();
    handleModalClose();
  };

  useEffect(() => {
    setColDefs([
      { headerName: "Action", field: "action", editable: false, width: 200 },
      {
        headerName: "Description",
        field: "description",
        editable: false,
        width: 430,
      },
      {
        headerName: "Group Name",
        field: "groupName",
        editable: false,
        width: 350,
      },
      {
        headerName: "Actions",
        field: "actions",
        width: 200,
        cellRenderer: (params: any) => (
          <div className="flex space-x-2">
            <TooltipProvider>
              <div className="flex space-x-2">
                {/* Edit Permission Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => editPermission(params)}
                      className="bg-white text-[#6E2B8B] p-2 rounded hover:bg-white"
                    >
                      <Edit className="h-6 w-6" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit Permission</TooltipContent>
                </Tooltip>

                {/* Delete Permission Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => confirmDelete(params)}
                      className="text-red-600 bg-white p-2 rounded hover:bg-white"
                    >
                       <img src={remove} alt="Remove Icon" className="h-6 w-6 filter fill-current text-[#6E2B8B]" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete Permission</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        ),
        editable: false,
      },
    ]);
  }, [permissions]);

  return (
    <div className="flex-1 p-4 mt-10 ml-20">
      <div className="flex items-center justify-between bg-[#6E2B8B] text-white px-6 py-4 rounded-lg shadow-lg mb-6 w-[1136px]">
        <div className="flex flex-col">
          <h2 className="text-2xl font-metropolis font-semibold tracking-wide">
            Permissions
          </h2>
          <p className="text-sm font-metropolis font-medium">
            Manage permissions easily.
          </p>
        </div>
        <Button
          onClick={addNewPermission}
          className="bg-yellow-400 text-gray-900 font-metropolis font-semibold px-5 py-2 rounded-md shadow-lg hover:bg-yellow-500 transition duration-300"
        >
          + New Permission
        </Button>
      </div>

      <div
        className="ag-theme-quartz text-left font-poppins"
        style={{ height: "calc(100vh - 180px)", width: "89%" }}
      >
        <AgGridReact
          rowSelection="multiple"
          suppressRowClickSelection
          suppressMovableColumns
          loading={loading}
          columnDefs={colDefs}
          rowData={permissions}
          defaultColDef={{
            editable,
            sortable: true,
            filter: true,
            resizable: true,
          }}
          animateRows
        />
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          className={`px-4 py-2 rounded-l-md border bg-gray-300 text-gray-700 hover:bg-gray-400 ${currentPage === 1 && "cursor-not-allowed opacity-50"
            }`}
        >
          Previous
        </button>
        <span className="px-4 py-2 border-t border-b text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          className={`px-4 py-2 rounded-r-md border bg-gray-300 text-gray-700 hover:bg-gray-400 ${currentPage === totalPages && "cursor-not-allowed opacity-50"
            }`}
        >
          Next
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[450px]">
            <h2 className="text-xl font-metropolis font-semibold mb-4">
              {editing ? "Edit Permission" : "Add NewPermission"}
            </h2>
            <form>
              <div className="mb-4">
                <label className="block font-metropolis font-medium">
                  Action <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border rounded font-metropolis mt-1 p-2 text-gray-400 font-semibold"
                  value={newPermission.action}
                  onChange={(e) =>
                    setNewPermission({
                      ...newPermission,
                      action: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block font-metropolis font-medium">
                  Description
                </label>
                <input
                  type="text"
                  className="w-full h-24 border rounded font-metropolis mt-1 p-2 text-gray-400 font-semibold"
                  value={newPermission.description}
                  onChange={(e) =>
                    setNewPermission({
                      ...newPermission,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block font-metropolis font-medium">
                  Group Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border rounded font-metropolis mt-1 p-2 text-gray-400 font-semibold"
                  value={newPermission.groupName}
                  onChange={(e) =>
                    setNewPermission({
                      ...newPermission,
                      groupName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex justify-end space-x-2">
              <Button
                  onClick={handleFormSubmit}
                  className="bg-[#6E2B8B] hover:bg-[#8536a7] text-white px-4 py-2 
                transition-all duration-500 ease-in-out 
               rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
                >
                  {editing ? "Update Permission" : "Create NewPermission"}
                </Button>
                <Button
                  onClick={handleModalClose}
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

      {deleteModalOpen && permissionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-auto">
            <h2 className="text-xl font-metropolis font-semibold mb-4">
              Confirm Delete
            </h2>
            <p className="mb-4 font-metropolis font-medium">
              Are you sure you want to delete the permission{" "}
              <strong>
                {permissionToDelete?.action?.charAt(0).toUpperCase() +
                  permissionToDelete?.action?.slice(1).toLowerCase()}
              </strong>
              ?
            </p>
            <div className="flex justify-end space-x-2">
            <Button
                onClick={deletePermissionData}
                className="bg-[#6E2B8B] hover:bg-[#8536a7] text-white px-4 py-2 
                transition-all duration-500 ease-in-out 
               rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
              >
                Delete
              </Button>
              <Button
                onClick={closeDeleteModal}
                className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 transition-all duration-500 ease-in-out 
               rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePermissions;
