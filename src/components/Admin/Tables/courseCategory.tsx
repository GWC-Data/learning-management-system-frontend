import { Button } from "../../ui/button";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { SetStateAction, useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../../../components/ui/tooltip";
import { toast } from "sonner";
import { Edit, Trash, Eye } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { ColDef } from "ag-grid-community";

import { useDispatch, useSelector } from "react-redux";

import {
  fetchCourseCategoryRequest,
  deleteCourseCategoryRequest,
  addCourseCategoryRequest,
  updateCourseCategoryRequest,
} from "@/store/courseCategory/actions";

// TypeScript types for the component props
interface CourseCategoryTableProps {
  editable?: boolean;
}

// TypeScript types for course category data
interface CourseCategoryData {
  id: string;
  coursecategoryName: string;
  description: string;
  coursecategoryImg: File | string;
}

const CourseCategoryTable = ({ editable = true }: CourseCategoryTableProps) => {
  const dispatch = useDispatch();
  // Fetch data from Redux store
  const categoryData = useSelector(
    (state: any) => state.courseCategory.courseCategory
  );
  const loading = useSelector((state: any) => state.courseCategory.loading);

  const [colDefs, setColDefs] = useState<ColDef[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [viewingCategory, setViewingCategory] =
    useState<CourseCategoryData | null>(null);
  const [categoryToDelete, setCategoryToDelete] =
    useState<CourseCategoryData | null>(null);
  const [newCategory, setNewCategory] = useState<CourseCategoryData>({
    id: "",
    coursecategoryName: "",
    description: "",
    coursecategoryImg: "",
  });

  useEffect(() => {
    dispatch(fetchCourseCategoryRequest()); // Dispatches correctly
  }, [dispatch]);

  const validateFields = () => {
    const newErrors: Record<string, string> = {};

    if (!newCategory.coursecategoryName)
      newErrors.courseCategory = "courseCategory is required.";
    if (!newCategory.description)
      newErrors.description = "description is required.";
    if (!newCategory.coursecategoryImg)
      newErrors.coursecategoryImg = "courseCategoryImg is required.";

    setErrors(newErrors);

    Object.entries(newErrors).forEach(([field, message]) => {
      toast.error(`${field}: ${message}`);
    });

    return newErrors;
  };


  // {/* pagination */ }
  // const recordsPerPage = 10;
  // const totalPages = Math.ceil(newCategory.length / recordsPerPage);
  // const startIndex = (currentPage - 1) * recordsPerPage;
  // const currentData = courseCategory.slice(startIndex, startIndex + recordsPerPage);

  // const handlePageChange = (newPage: SetStateAction<number>) => {
  //   setCurrentPage(newPage);
  // };

  //image upload
  console.log("Category Data", categoryData);
  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setUploadedFile(file);
    setNewCategory({ ...newCategory, coursecategoryImg: file });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const addNewRow = () => {
    setEditing(false);
    setUploadedFile(null);
    setNewCategory({
      id: "",
      coursecategoryName: "",
      description: "",
      coursecategoryImg: "",
    });
    setIsModalOpen(true);
  };

  const confirmDeleteCategory = (data: CourseCategoryData) => {
    setCategoryToDelete(data);
    setIsDeleteModalOpen(true);
  };

  // Function to handle viewing a row
  const handleViewCategory = (data: CourseCategoryData) => {
    setViewingCategory(data); // Set the row data to state
    setIsModalOpen(true); // Open the modal
    setIsModalOpen(false); // Close the modal
  };

  const handleDeleteCategoryData = () => {
    if (!categoryToDelete) return;
    dispatch(deleteCourseCategoryRequest(categoryToDelete.id));
    setIsDeleteModalOpen(false);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  const editCategory = (data: any) => {
    setEditing(true);
    setNewCategory(data);
    setNewCategory({
      id: data.id,
      coursecategoryName: data.coursecategoryName,
      description: data.description || "",
      coursecategoryImg: data.coursecategoryImg
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewCategory({
      id: "",
      coursecategoryName: "",
      description: "",
      coursecategoryImg: "",
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevents form from reloading the page

    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (editing) {
      dispatch(updateCourseCategoryRequest(newCategory));
    } else {
      dispatch(addCourseCategoryRequest(newCategory));
    }

    handleModalClose();
  };

  useEffect(() => {
    setColDefs([
      { headerName: "Category Name", field: "coursecategoryName", editable: false },
      {
        headerName: "Description",
        field: "description",
        editable: false,
        width: 460,
      },
      {
        headerName: "Category Image",
        field: "coursecategoryImg",
        cellRenderer: (params: any) => {
          const imageUrl = params.value; // Can be base64 string or object URL
          return imageUrl ? (
            <img
              src={imageUrl}
              alt="Category"
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
          <div className="flex space-x-4">
            <TooltipProvider>
              {/* View Button with Tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => handleViewCategory(params.data)}
                    className="bg-white text-green-500 p-2 rounded hover:bg-white"
                  >
                    <Eye className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Category</TooltipContent>
              </Tooltip>

              {/* Edit Button with Tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => editCategory(params.data)}
                    className="bg-white text-[#6E2B8B] p-2 rounded hover:bg-white"
                  >
                    <Edit className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit Category</TooltipContent>
              </Tooltip>

              {/* Delete Button with Tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => confirmDeleteCategory(params.data)}
                    className="text-red-600 bg-white p-2 rounded hover:bg-white"
                  >
                    <Trash className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete Category</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
        editable: false,
      },
    ]);
  }, [categoryData]);

  return (
    <div className="flex-1 p-4 mt-10 ml-24">
      <div className="flex items-center justify-between bg-[#6E2B8B] text-white px-6 py-4 rounded-lg shadow-lg mb-6 w-[1147px]">
        <div className="flex flex-col">
          <h2 className="text-2xl font-metropolis font-semibold tracking-wide">
            Course Categories
          </h2>
          <p className="text-sm font-metropolis font-medium">
            Manage course categories easily.
          </p>
        </div>
        <Button
          onClick={addNewRow}
          className="bg-yellow-400 text-gray-900 font-metropolis font-semibold px-5 py-2 rounded-md shadow-lg hover:bg-yellow-500 transition duration-300"
        >
          + New Category
        </Button>
      </div>
      <div
        className="ag-theme-quartz text-left font-poppins"
        style={{ height: "calc(100vh - 180px)", width: "88%" }}
      >
        <AgGridReact
          rowSelection="multiple"
          suppressRowClickSelection
          suppressMovableColumns
          loading={loading}
          columnDefs={colDefs}
          rowData={categoryData}
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
      {/* <div className="flex justify-center items-center mt-4">
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
      </div> */}

      {/* {viewingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-metropolis font-semibold mb-4">
              View Category
            </h2>
            <div className="mb-4">
              <label className="block font-metropolis font-medium">
                Category Name
              </label>
              <p className="font-metropolis text-gray-700">
                {viewingCategory.coursecategoryName}
              </p>
            </div>
            <div className="mb-4">
              <label className="block font-metropolis font-medium">
                Description
              </label>
              <p className="font-metropolis text-gray-700">
                {viewingCategory.description}
              </p>
            </div>
            <div className="mb-4">
              <label className="block font-metropolis font-medium">
                Category Image
              </label>
              {viewingCategory.coursecategoryImg ? (
                <img
                  src={viewingCategory.coursecategoryImg}
                  alt="Category"
                  className="w-full h-40 object-cover rounded"
                />
              ) : (
                <p className="text-gray-500">No Image</p>
              )}
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setViewingCategory(null)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )} */}

      {isDeleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-auto">
            <h2 className="text-xl font-metropolis font-semibold mb-4">
              Confirm Delete
            </h2>
            <p className="font-metropolis font-medium">
              Are you sure you want to delete the category{" "}
              <strong>
                {categoryToDelete?.coursecategoryName?.charAt(0).toUpperCase() +
                  categoryToDelete?.coursecategoryName?.slice(1).toLowerCase() ||
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
                onClick={handleDeleteCategoryData}
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
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-metropolis font-semibold mb-4">
              {editing ? "Edit Category" : "Add New Category"}
            </h2>
            <form>
              <div className="mb-4">
                <label className="block font-metropolis font-medium">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
                  value={newCategory.coursecategoryName}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      coursecategoryName: e.target.value,
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
                  className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block font-metropolis font-medium">
                  Category Image <span className="text-red-500">*</span>
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded p-4 mt-2 h-28 text-center cursor-pointer 
      ${isDragActive ? "border-blue-500" : "border-gray-300"}`}
                >
                  <input {...getInputProps()} />
                  {uploadedFile ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={URL.createObjectURL(uploadedFile)}
                        alt="Uploaded Course"
                        className="h-20 w-20 object-cover rounded border"
                      />
                      <p className="text-green-600 font-metropolis font-semibold mt-2">
                        {uploadedFile.name}
                      </p>
                    </div>
                  ) :
                    /* Show Existing Course Image from API (if available) */
                    newCategory.coursecategoryImg ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={typeof newCategory.coursecategoryImg === "string"
                            ? newCategory.coursecategoryImg
                            : URL.createObjectURL(newCategory.coursecategoryImg)}
                          alt="Course"
                          className="h-20 w-20 object-cover rounded border"
                        />
                        <p className="text-gray-500 font-metropolis font-semibold mt-2">
                          Existing Image
                        </p>
                      </div>
                    ) : (
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

export default CourseCategoryTable;
