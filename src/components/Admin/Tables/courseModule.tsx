import { Button } from "../../ui/button";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import { Edit, Trash } from "lucide-react";
import { ColDef } from "ag-grid-community";
import Select from 'react-select';
import Breadcrumb from "./breadcrumb";
import {
  createCourseModuleApi,
  fetchCourseModuleApi,
  updateCourseModuleApi,
  deleteCourseModuleApi,
} from "@/helpers/api/courseModuleApi";
import { fetchCourseApi } from "@/helpers/api/courseApi";
import { useSearchParams } from "react-router-dom";

// TypeScript types for the component props
interface CourseModuleTableProps {
  editable?: boolean;
  courseId?: string; 
}

// TypeScript types for course module data
interface CourseModuleData {
  id: string;
  courseId: string;
  moduleName: string;
  moduleDescription: string;
  courseName?: string;
  createdByUserName: string;
  sequence: number;
}

// TypeScript types for course options
interface CourseOption {
  id: string;
  courseName: string;
}

// Helper to get the token from local storage
const getToken = () => localStorage.getItem("authToken");

const CourseModuleTable = ({ editable = true }: CourseModuleTableProps) => {
  const [courseModules, setCourseModules] = useState<CourseModuleData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [colDefs, setColDefs] = useState<ColDef[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [newModule, setNewModule] = useState<CourseModuleData>({
    id: "",
    courseId: "",
    moduleName: "",
    moduleDescription: "",
    createdByUserName: "",
    sequence: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [moduleToDelete, setModuleToDelete] = useState<CourseModuleData | null>(
    null
  );
  const [searchParams] = useSearchParams();
    const courseId = String(searchParams.get("courseId")); 
  
  const [currentPage, setCurrentPage] = useState(1);

  {/* pagination */ }
  const recordsPerPage = 15;
  const totalPages = Math.ceil(courseModules.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentData = courseModules.slice(startIndex, startIndex + recordsPerPage);

  const handlePageChange = (newPage: SetStateAction<number>) => {
    setCurrentPage(newPage);
  };

  const validateFields = () => {
    const newErrors: Record<string, string> = {};

    if (!newModule.courseId) newErrors.courseId = "Course is required.";
    if (!newModule.moduleName)
      newErrors.moduleName = "Module name is required.";
    if (!newModule.moduleDescription)
      newErrors.moduleDescription = "Module description is required.";

    setErrors(newErrors);

    Object.entries(newErrors).forEach(([field, message]) => {
      toast.error(`${field}: ${message}`);
    });

    return newErrors;
  };

  // Fetch course modules and map course names
  const fetchCourseModules = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to view course modules.");
      return;
    }
  
    setLoading(true); // ✅ Ensure loading state is set before fetching
    
    try {
      // ✅ Fetch courses
      const courses = await fetchCourseApi();
      console.log("Courses API Response:", courses);
  
      if (!Array.isArray(courses)) {
        console.error("Invalid course response format:", courses);
        toast.error("Failed to load courses.");
        return;
      }
  
      // ✅ Convert courses array into a map for easy lookup
      const courseMap = courses.reduce((acc: Record<string, string>, course: any) => {
        acc[course.courseId] = course.courseName; // Ensure correct field names
        return acc;
      }, {});
  
      setCourseOptions(
        courses.map((course: any) => ({
          id: course.courseId,
          courseName: course.courseName,
        }))
      );
  
      // ✅ Fetch modules
      const modules = await fetchCourseModuleApi();
      console.log("Modules API Response:", modules);
  
      if (!Array.isArray(modules)) {
        console.error("Invalid module response format:", modules);
        toast.error("Failed to load modules.");
        return;
      }
  
      const mappedModules = modules.map((module: any) => ({
        id: module.moduleId, 
        courseId: module.courseId,
        moduleName: module.moduleName,
        moduleDescription: module.moduleDescription,
        sequence: module.sequence,
        createdByUserName: module.createdByUserName,
        courseName: courseMap[module.courseId] || "Unknown Course", 
      }));
  
      console.log("Mapped Modules:", mappedModules);
      console.log("courseId",courseId);
  
      const filteredModules = mappedModules.filter((m: any) => m.courseId === courseId)
      console.log("Filtered Modules:", filteredModules);
  
      setCourseModules(filteredModules);
    } catch (error) {
      console.error("Failed to fetch course modules:", error);
      toast.error("Failed to fetch course modules. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  // 🔹 2. Fetch data on mount
  useEffect(() => {
    fetchCourseModules();
  }, []);
  

  // Open modal to add a new course module
  const addNewRow = () => {
    setEditing(false);
    setNewModule({
      id: "",
      courseId: "",
      moduleName: "",
      moduleDescription: "",
      createdByUserName: "",
      sequence: 0
    });
    setIsModalOpen(true);
  };

  const editCourseModule = (module: CourseModuleData) => {
    setEditing(true);
    setNewModule(module);
    setIsModalOpen(true);
  };

  // Close modal
  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewModule({
      id: "",
      courseId: "",
      moduleName: "",
      moduleDescription: "",
      createdByUserName: "",
      sequence: 0
    });
  };

  // Handle form submission (Create or Update)
  const handleFormSubmit = async () => {
    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) return;

    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to Perform this action")
      return;
    }

    try {
      if (editing) {
        await updateCourseModuleApi(newModule.id, {
          courseId: newModule.courseId,
          moduleName: newModule.moduleName,
          moduleDescription: newModule.moduleDescription,
        });
        toast.success("Course module updated successfully!");
      } else {
        await createCourseModuleApi({
          courseId: newModule.courseId,
          moduleName: newModule.moduleName,
          moduleDescription: newModule.moduleDescription,
        });
        toast.success("Course module added successfully!");
      }
      fetchCourseModules();
    } catch (error) {
      console.error("Failed to save course module", error);
      toast.error("Failed to save course module. Please try again later.");
    } finally {
      handleModalClose();
    }
  };

  const confirmDeleteCourseModule = (data: CourseModuleData) => {
    const course = courseModules.find((course) => course.id === data.id);
    if (course) {
      setModuleToDelete(course);
      setIsDeleteModalOpen(true);
    }
  }; 

  const handleDeleteCourseModule = async () => {
    if (!moduleToDelete) {
      toast.error("No courseModule Selected for deletion")
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to delete a course.");
      return;
    }

    try {

      await deleteCourseModuleApi(moduleToDelete.id);
      setCourseModules((prev) => prev.filter((course) => course.id !== moduleToDelete.id));
      toast.success("CourseModule deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete the course. Please try again later.");
    } finally {
      setIsDeleteModalOpen(false);
      setModuleToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setModuleToDelete(null);
  };

  // Define column definitions
  useEffect(() => {
    setColDefs([
      // { headerName: "Course Name", field: "courseName", editable: false, width: 200  },
      { headerName: "Module Name", field: "moduleName", editable: false, width: 300, rowDrag: true },
      {
        headerName: "Description",
        field: "moduleDescription",
        editable: false,
        width: 400
      },
      { headerName: "Sequence", field: "sequence", editable: false, width: 130 },
      { headerName: "Created By", field: "createdByUserName", editable: false, width: 130 },
      {
        headerName: "Actions",
        field: "actions",
        cellRenderer: (params: any) => (
          <div className="flex space-x-2">
            <Button
              onClick={() => editCourseModule(params.data)}
              className="bg-white text-[#6E2B8B] p-2 rounded hover:bg-white"
            >
              <Edit className="h-5 w-4" />
            </Button>
            <Button
              onClick={() => confirmDeleteCourseModule(params.data)}
              className=" text-red-600 bg-white p-2 rounded hover:bg-white"
            >
              <Trash className="h-5 w-4" />
            </Button>
          </div>
        ),
      },
    ]);
  }, [courseModules]);
  

  const onRowDragEnd = async (event: any) => {
    const draggedIndex = event.oldIndex;
    const targetIndex = event.newIndex;
    
    if (draggedIndex === targetIndex) return;
    
    const newModules = [...courseModules];
    const [draggedModule] = newModules.splice(draggedIndex, 1);
    newModules.splice(targetIndex, 0, draggedModule);
    
    // Update sequences
    const updatedModules = newModules.map((module, index) => ({
        ...module,
        sequence: index + 1
    }));

    try {
        // Update frontend state immediately
        setCourseModules(updatedModules);
        
        // Update the dragged module with its new sequence
        const draggedModuleData = updatedModules[targetIndex];
        await updateCourseModuleApi(draggedModuleData.id, {
            courseId: draggedModuleData.courseId,
            moduleName: draggedModuleData.moduleName,
            moduleDescription: draggedModuleData.moduleDescription,
            sequence: draggedModuleData.sequence
        });

        toast.success("Module order updated successfully!");
        
        // Refresh the data
        await fetchCourseModules();
        
    } catch (error) {
        console.error("Failed to update module order:", error);
        toast.error("Failed to update module order. Please try again.");
        await fetchCourseModules(); // Refresh to ensure correct state
    }
};

  return (
    <>
      <div className="flex-1 p-4 mt-10 ml-20">
        <div className="text-gray-600 text-lg mb-4">
              <Breadcrumb />
              </div>
        <div className="flex items-center justify-between bg-[#6E2B8B] text-white px-6 py-4 rounded-lg shadow-lg mb-6 w-[1105px]">
          <div className="flex flex-col">
            <h2 className="text-2xl font-metropolis font-semibold tracking-wide">
              Course Modules
            </h2>
            <p className="text-sm font-metropolis font-medium">
              Manage course modules easily.
            </p>
          </div>
          <Button
            onClick={addNewRow}
            className="bg-yellow-400 text-gray-900 font-metropolis font-semibold px-5 py-2 rounded-md shadow-lg hover:bg-yellow-500 transition duration-300"
          >
            + Add Module
          </Button>
        </div>

        {moduleToDelete && isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-auto">
              <h2 className="text-xl font-metropolis font-semibold mb-4">
                Confirm Delete
              </h2>
              <p className="mb-4 font-metropolis font-medium">
                Are you sure you want to delete the module{" "}
                <strong>{moduleToDelete.moduleName}</strong>?
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
                  onClick={handleDeleteCourseModule}
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

        <div
          className="ag-theme-quartz"
          style={{ height: "70vh", width: "88%" }}
        >
          <AgGridReact
            rowSelection="multiple"
            suppressRowClickSelection
            suppressMovableColumns
            loading={loading}
            columnDefs={colDefs}
            rowData={courseModules}
            defaultColDef={{
              editable,
              sortable: true,
              filter: true,
              resizable: true,
            }}
            animateRows
            onRowDragEnd={onRowDragEnd}
            rowDragManaged={true}
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
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-metropolis font-semibold mb-4 text-center">
                {editing ? "Edit Module" : "Add New Module"}
              </h2>
              <form>
                <div className="mb-4">
                  <label className="block font-metropolis font-medium mb-2">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={courseOptions.map((course) => ({
                      value: course.id,
                      label: course.courseName
                    }))}
                    value={newModule.courseId
                      ? {
                        value: newModule.courseId,
                        label: courseOptions.find((course) => course.id === newModule.courseId)?.courseName || "Unknown",
                      } : null
                    }
                    onChange={(selectedOption) => {
                      setNewModule({
                        ...newModule,
                        courseId: selectedOption ? selectedOption.value : "",
                      });
                    }}
                    className="w-full rounded font-metropolis p-2 text-gray-400 font-semibold"
                    placeholder="Select Course"
                    isSearchable={true}
                  />
                  {errors.courseId && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.courseId}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block font-metropolis font-medium mb-2">
                    Module Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
                    value={newModule.moduleName}
                    onChange={(e) =>
                      setNewModule({
                        ...newModule,
                        moduleName: e.target.value,
                      })
                    }
                  />
                  {errors.moduleName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.moduleName}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block font-metropolis font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
                    value={newModule.moduleDescription}
                    onChange={(e) =>
                      setNewModule({
                        ...newModule,
                        moduleDescription: e.target.value,
                      })
                    }
                  />
                  {errors.moduleDescription && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.moduleDescription}
                    </p>
                  )}
                </div>
                <div className="flex justify-end space-x-4">
                  <Button
                    onClick={handleFormSubmit}
                    className="bg-custom-gradient-btn text-white px-4 py-2 
                transition-all duration-500 ease-in-out 
               rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
                  >
                    {editing ? "Update" : "Create"}
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
      </div>
    </>
  );
};

export default CourseModuleTable;
