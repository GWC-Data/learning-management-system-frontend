import { Button } from "../../ui/button";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Edit, Trash, Eye } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { ColDef } from "ag-grid-community";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCompanyInfosRequest,
  addCompanyInfoRequest,
  updateCompanyInfoRequest,
  deleteCompanyInfoRequest,
} from "@/store/companyInfo/actions";

// Interface for company info
interface CompanyInfoData {
  id: number;
  companyName: string;
  companyImg: string;
}

// TypeScript types for the component props
interface CompanyInfoTableProps {
  editable?: boolean;
}

const CompanyInfoTable = ({ editable = true }: CompanyInfoTableProps) => {
  const dispatch = useDispatch();

  // Fetch data from Redux store
  const companyData = useSelector(
    (state: any) => state.companyInfo.companyInfos
  );

  const loading = useSelector((state: any) => state.companyInfo.loading);

  const [colDefs, setColDefs] = useState<ColDef[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [viewingCompanyInfo, setViewingCompanyInfo] =
    useState<CompanyInfoData | null>(null);
  const [companyToDelete, setCompanyToDelete] =
    useState<CompanyInfoData | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [newCompany, setNewCompany] = useState<CompanyInfoData>({
    id: 0,
    companyName: "",
    companyImg: "",
  });

  useEffect(() => {
    dispatch(fetchCompanyInfosRequest()); // Fetch company data on mount
  }, [dispatch]);

  const validateFields = () => {
    const newErrors: Record<string, string> = {};

    if (!newCompany.companyName)
      newErrors.companyName = "companyName is required.";
    if (!newCompany.companyImg)
      newErrors.companyImg = "companyImg is required.";

    setErrors(newErrors);

    Object.entries(newErrors).forEach(([field, message]) => {
      toast.error(`${field}: ${message}`);
    });

    return newErrors;
  };

  // Convert file to Base64
  const convertFileToBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle file drop
  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setUploadedFile(file);
    console.log("file", file);

    convertFileToBase64(file).then((base64) => {
      setNewCompany({ ...newCompany, companyImg: base64 });
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false, // Single file upload
  });

  const addNewRow = () => {
    setEditing(false);
    setUploadedFile(null);
    setNewCompany({
      id: 0,
      companyName: "",
      companyImg: "",
    });
    setIsModalOpen(true);
  };

  const confirmDeleteCompany = (data: CompanyInfoData) => {
    setCompanyToDelete(data);
    setIsDeleteModalOpen(true);
  };

  // Function to handle viewing a row
  const handleViewCompanyInfo = (data: CompanyInfoData) => {
    setViewingCompanyInfo(data); // Set the row data to state
    setIsModalOpen(true); // Open the modal
    setIsModalOpen(false); // Close the modal
  };

  const handleDeleteCompanyData = () => {
    if (!companyToDelete) return;
    dispatch(deleteCompanyInfoRequest(companyToDelete.id));
    setIsDeleteModalOpen(false);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setCompanyToDelete(null);
  };

  const editCompany = (data: CompanyInfoData) => {
    setEditing(true);

    // Ensure companyImg is properly set for preview
    setNewCompany({
      id: data.id,
      companyName: data.companyName,
      companyImg: data.companyImg || "", // Ensure it's set, even if empty
    });

    setUploadedFile(null); // Reset uploaded file
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewCompany({
      id: 0,
      companyName: "",
      companyImg: "",
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevents form from reloading the page

    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (editing) {
      dispatch(updateCompanyInfoRequest(newCompany));
    } else {
      dispatch(addCompanyInfoRequest(newCompany));
    }

    handleModalClose();
  };

  useEffect(() => {
    setColDefs([
      {
        headerName: "Company Name",
        field: "companyName",
        editable: false,
        width: 200,
        cellStyle: { marginTop: "10px", alignItems: "center" }, // Aligns content properly
      },
      {
        headerName: "Company Image",
        field: "companyImg",

        cellRenderer: (params: any) => {
          const imageUrl = params.value;
          return imageUrl ? (
            <img
              src={imageUrl}
              alt="Company"
              style={{
                width: "100px",
                height: "70px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          ) : (
            "No Image"
          );
        },
        editable: false,
        width: 320,
      },
      {
        headerName: "Actions",
        field: "actions",
        cellRenderer: (params: any) => (
          <div className="flex space-x-4 mt-5">
            <Button
              onClick={() => handleViewCompanyInfo(params.data)}
              className="bg-green-500 text-white p-2 rounded hover:bg-green-700"
            >
              <Eye className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => editCompany(params.data)}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
            >
              <Edit className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => confirmDeleteCompany(params.data)}
              className="bg-red-500 text-white p-2 rounded hover:bg-red-700"
            >
              <Trash className="h-5 w-5" />
            </Button>
          </div>
        ),
        editable: false,
        width: 320,
      },
    ]);
  }, [companyData]);

  return (
    <div className="flex-1 p-4 mt-10 ml-10">
      <div className="flex items-center justify-between bg-custom-gradient text-white px-6 py-4 rounded-lg shadow-lg mb-6 w-[820px]">
        <h2 className="text-2xl font-semibold">Company Info</h2>
        <Button
          onClick={addNewRow}
          className="bg-yellow-400 text-gray-900 font-semibold px-5 py-2 rounded-md shadow-lg hover:bg-yellow-500"
        >
          + Add Company
        </Button>
      </div>
      <div
        className="ag-theme-quartz text-left"
        style={{ height: "calc(100vh - 180px)", width: "62%" }}
      >
        <AgGridReact
          rowHeight={80}
          rowSelection="multiple"
          suppressRowClickSelection
          suppressMovableColumns
          loading={loading}
          columnDefs={colDefs}
          rowData={companyData.companyInfo}
          defaultColDef={{
            editable,
            sortable: true,
            filter: true,
            resizable: true,
          }}
          animateRows
        />
      </div>

      {viewingCompanyInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-metropolis font-semibold mb-4">
              View CompanyInfo
            </h2>
            <div className="mb-4">
              <label className="block font-metropolis font-medium">
                Company Name
              </label>
              <p className="font-metropolis text-gray-700">
                {viewingCompanyInfo.companyName}
              </p>
            </div>
            <div className="mb-4">
              <label className="block font-metropolis font-medium">
                Company Image
              </label>
              {viewingCompanyInfo.companyImg ? (
                <img
                  src={viewingCompanyInfo.companyImg}
                  alt="Company"
                  className="w-full h-40 object-cover rounded"
                />
              ) : (
                <p className="text-gray-500">No Image</p>
              )}
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setViewingCompanyInfo(null)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
      {isDeleteModalOpen && companyToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-auto">
            <h2 className="text-xl font-metropolis font-semibold mb-4">
              Confirm Delete
            </h2>
            <p className="font-metropolis font-medium">
              Are you sure you want to delete the category{" "}
              <strong>
                {companyToDelete?.companyName?.charAt(0).toUpperCase() +
                  companyToDelete?.companyName?.slice(1).toLowerCase() ||
                  "this category"}
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
                onClick={handleDeleteCompanyData}
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

      {/* Modal for adding/editing */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">
              {editing ? "Edit Company" : "Add New Company"}
            </h2>
            <form>
              <div className="mb-4">
                <label className="block font-medium">Company Name</label>
                <input
                  type="text"
                  className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
                  value={newCompany.companyName}
                  onChange={(e) =>
                    setNewCompany({
                      ...newCompany,
                      companyName: e.target.value,
                    })
                  }
                />
              </div>

              <div className="mb-4">
                <label className="block font-metropolis font-medium">
                  Company Image
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded p-4 mt-2 h-28 text-center cursor-pointer 
    ${isDragActive ? "border-blue-500" : "border-gray-300"}`}
                >
                  <input {...getInputProps()} />

                  {/* Show the uploaded file name if a new file is uploaded */}
                  {uploadedFile ? (
                    <p className="text-green-600 font-metropolis font-semibold mt-6">
                      {uploadedFile.name}
                    </p>
                  ) : newCompany.companyImg ? (
                    // Show the existing image when editing
                    <img
                      src={newCompany.companyImg}
                      alt="Company"
                      className="w-full h-24 object-cover rounded"
                    />
                  ) : (
                    // Show this message if no image exists
                    <p className="text-gray-400 font-semibold">
                      Drag & drop a file here, or click to select one
                    </p>
                  )}
                </div>
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
                  type="submit"
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
    </div>
  );
};

export default CompanyInfoTable;
