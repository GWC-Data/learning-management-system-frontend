import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { ColDef } from "ag-grid-community";

interface RolePermission {
  groupName: string;
  action: string;
  permissions: {
    [role: string]: boolean;
  };
}

const initialRoles = ["Admin", "Finance", "Trainer", "Trainee"];
const initialGroups = [
  {
    groupName: "User Management",
    actions: ["Create", "Read", "Update", "Delete"],
  },
];

const RolePermissionManager = () => {
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [roles, setRoles] = useState<string[]>(initialRoles);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeRolePermissions();
  }, []);

  const initializeRolePermissions = () => {
    const permissions: RolePermission[] = [];

    initialGroups.forEach((group) => {
      group.actions.forEach((action) => {
        const rolePerm: RolePermission = {
          groupName: group.groupName,
          action,
          permissions: roles.reduce((acc, role) => {
            acc[role] = false;
            return acc;
          }, {} as Record<string, boolean>),
        };
        permissions.push(rolePerm);
      });
    });

    setRolePermissions(permissions);
  };

  const togglePermission = (groupName: string, action: string, role: string) => {
    setRolePermissions((prev) =>
      prev.map((rolePerm) =>
        rolePerm.groupName === groupName && rolePerm.action === action
          ? {
              ...rolePerm,
              permissions: {
                ...rolePerm.permissions,
                [role]: !rolePerm.permissions[role],
              },
            }
          : rolePerm
      )
    );
  };

  const saveRolePermissions = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "/auth/role-permissions",
        { rolePermissions },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      toast.success("Permissions saved successfully!");
      console.log("Saved permissions:", response.data);
    } catch (error) {
      console.error("Failed to save permissions:", error);
      toast.error("Failed to save permissions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const columnDefs: ColDef[] = [
    { headerName: "Group Name", field: "groupName", rowGroup: true, hide: false },
    { headerName: "Action", field: "action", editable: false, width: 270 },
    ...roles.map((role) => ({
      headerName: role,
      field: undefined, // `field` is not necessary for custom renderers
      cellRenderer: (params: { data: RolePermission }) => {
        const isChecked = params.data?.permissions[role];
        return (
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() =>
              togglePermission(params.data.groupName, params.data.action, role)
            }
          />
        );
      },
      editable: false,
      width: 150,
    })),
  ];

  const defaultColDef = {
    resizable: true,
    sortable: true,
    flex: 1,
  };

  return (
    <div className="p-4 mt-10 ml-10">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 text-white px-6 py-4 rounded-lg shadow-lg mb-6">
        <div>
          <h2 className="text-2xl font-bold">Role Permission Manager</h2>
          <p className="text-sm">Assign permissions to roles effectively.</p>
        </div>
        <Button
          onClick={saveRolePermissions}
          className={`${
            loading ? "bg-gray-400" : "bg-yellow-400"
          } text-gray-900 font-semibold px-5 py-2 rounded-md shadow-lg hover:bg-yellow-500 transition duration-300`}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Permissions"}
        </Button>
      </div>

      <div className="ag-theme-alpine">
        <AgGridReact
          rowData={rolePermissions}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          domLayout="autoHeight" // Automatically adjust height based on content
          groupDefaultExpanded={-1} // Expand all groups by default
        />
      </div>
    </div>
  );
};

export default RolePermissionManager;
