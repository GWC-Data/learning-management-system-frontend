import { Button } from "../../ui/button";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import { ColDef } from "ag-grid-community";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../../../components/ui/tooltip";
import remove from '../../../assets/delete.png';
import Breadcrumb from "./breadcrumb";
import {
  createClassForModuleApi,
  updateClassForModuleApi,
  deleteClassForModuleApi,
  fetchClassForModuleApi
} from "@/helpers/api/classForModuleApi";
import { Edit, File } from "lucide-react";
import { AiFillCloseCircle } from "react-icons/ai";
import { fetchCourseModuleApi } from "@/helpers/api/courseModuleApi";
import { useSearchParams } from "react-router-dom";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// TypeScript types for the component props
interface ClassTableProps {
  editable?: true;
}

// TypeScript types for course data
interface ClassData {
  id: string;
  classTitle: string;
  classDescription: string;
  classRecordedLink: string;
  assignmentName: string;
  assignmentFile: string;
  moduleId: string;
  moduleName: string;
  totalMarks: string;
  materialForClass: string;
}


// Helper to get the token from local storage
const getToken = () => localStorage.getItem("authToken");

const ClassTable = ({ editable = true }: ClassTableProps) => {
  const [classData, setClassData] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [colDefs, setColDefs] = useState<ColDef[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfFileUrl, setPdfFileUrl] = useState<string | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)
  const [module, setModule] = useState<{ id: string; moduleName: string }[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAssignmentFile, setSelectedAssignmentFile] = useState<File | null>(null);
  const [selectedMaterialFile, setSelectedMaterialFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [classToDelete, setClassToDelete] = useState<ClassData | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [newClass, setNewClass] = useState<ClassData>({
    id: "",
    classTitle: "",
    classDescription: "",
    classRecordedLink: "",
    assignmentName: "",
    assignmentFile: "",
    moduleId: "",
    moduleName: "",
    totalMarks: "",
    materialForClass: "",
  });

  {/* pagination */ }
  const recordsPerPage = 10;
  const totalPages = Math.ceil(classData.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentData = classData.slice(startIndex, startIndex + recordsPerPage);
  const [searchParams] = useSearchParams();
  const moduleId = String(searchParams.get("moduleId"));
  console.log("moduleId", moduleId);

  const handlePageChange = (newPage: SetStateAction<number>) => {
    setCurrentPage(newPage);
  };

  const fetchClass = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to view courses.");
      return;
    }

    try {
      const response = await fetchClassForModuleApi();
      console.log("responseclass", response);

      const classes = response.classes.map((cls: any) => ({
        id: cls.classId || "",
        classTitle: cls.classTitle,
        classDescription: cls.classDescription,
        classRecordedLink: cls.classRecordedLink || "",
        assignmentName: cls.assignmentName,
        assignmentFile: cls.assignmentFile,
        moduleId: cls.moduleId,
        materialForClass: cls.materialForClass,
        moduleName: cls.moduleName || "No Module Assigned",
        totalMarks: cls.totalMarks
      }));

      console.log("finalized data", classes);

      const filterClass = classes.filter((cls: any) => cls.moduleId === moduleId);
      console.log("filtered data", filterClass);

      const modules = await fetchCourseModuleApi();
      console.log("moduleinClass", modules);

      const moduleData = modules.map((module: any) => ({
        id: module.moduleId, // Standardizing key name to 'id'
        moduleName: module.moduleName,
      }));

      setModule(moduleData);
      console.log("moduleData", moduleData);

      setClassData(filterClass)

    } catch (error) {
      console.error("Failed to fetch classes", error);
      toast.error("Failed to fetch classes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClass();
  }, [moduleId]);


  const handleOpenModal = (url: string) => {
    setVideoUrl(url);
    setIsVideoModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsVideoModalOpen(false);
    setVideoUrl('');
  };


  const addNewRow = () => {
    setEditing(false);

    // Find the module name for the current moduleId
    const currentModule = module.find(m => m.id === moduleId);
    const currentModuleName = currentModule ? currentModule.moduleName : "";

    setNewClass({
      id: "",
      classTitle: "",
      classDescription: "",
      classRecordedLink: "",
      assignmentName: "",
      assignmentFile: "",
      moduleId: moduleId, // Pre-select the current moduleId
      moduleName: currentModuleName, // Include the module name
      totalMarks: "",
      materialForClass: "",
    });
    setIsModalOpen(true);
  };

  const confirmDeleteClass = (data: ClassData) => {
    const classes = classData.find((cls) => cls.id === data.id);
    if (classes) {
      setClassToDelete(classes);
      setIsDeleteModalOpen(true);
    }
  };

  const handleViewFile = (fileUrl: string) => {
    setPdfFileUrl(fileUrl);
    setIsPdfModalOpen(true);
  };

  const closePdfModal = () => {
    setPdfFileUrl(null);
    setIsPdfModalOpen(false); // Close PDF modal
  };

  const handleDeleteClass = async () => {
    if (!classToDelete) {
      toast.error("No class Selected for deletion")
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to delete a class.");
      return;
    }

    try {

      await deleteClassForModuleApi(classToDelete.id);
      setClassData((prev) => prev.filter((cls) => cls.id !== classToDelete.id));
      toast.success("class deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete the class. Please try again later.");
    } finally {
      setIsDeleteModalOpen(false);
      setClassToDelete(null);
    }
  };

  const editClass = (classes: ClassData) => {
    console.log("edited class", classes);
    setEditing(true);
    setNewClass({
      ...classes
    });

    // Reset file inputs
    setSelectedAssignmentFile(null);
    setSelectedMaterialFile(null);

    setIsModalOpen(true);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setClassToDelete(null);
  };

  // Close the modal
  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewClass({
      id: "",
      classTitle: "",
      classDescription: "",
      classRecordedLink: "",
      assignmentName: "",
      assignmentFile: "",
      moduleId: "",
      moduleName: "",
      totalMarks: "",
      materialForClass: "",
    });
  };

  const handleFormSubmit = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to perform this action.");
      return;
    }

    try {
      const formData = new FormData();

      console.log("newClass", newClass);

      // Append all class data to formData
      formData.append('classTitle', newClass.classTitle);
      formData.append('classDescription', newClass.classDescription);
      formData.append('classRecordedLink', newClass.classRecordedLink);
      formData.append('assignmentName', newClass.assignmentName);
      formData.append('assignmentFile', newClass.assignmentFile);
      formData.append('moduleId', newClass.moduleId);
      formData.append('totalMarks', newClass.totalMarks);
      formData.append('materialForClass', newClass.materialForClass);

      // Append the assignment file if it exists
      if (selectedAssignmentFile) {
        formData.append('assignmentFile', selectedAssignmentFile);
      }

      // Append the material file if it exists
      if (selectedMaterialFile) {
        formData.append('materialForClass', selectedMaterialFile);
      }

      if (editing) {
        await updateClassForModuleApi(newClass.id, formData);
        fetchClass();
        toast.success("Class updated successfully!");
        console.log('updated class:', newClass);
      } else {
        await createClassForModuleApi(formData);
        toast.success("Class added successfully!");
      }
      fetchClass();
    } catch (error) {
      console.error("Failed to update class", error);
      toast.error("Failed to update the class. Please try again later.");
    }

    handleModalClose();
  };

  React.useEffect(() => {
    (window as any).openRecordingModal = handleOpenModal;
  }, []);


  function extractYouTubeVideoId(url: string): string {
    // Regular expressions to match different YouTube URL formats
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})/
    ];
  
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
  
    // Fallback or error handling
    console.error('Could not extract YouTube video ID from URL:', url);
    return '';
  }


  useEffect(() => {
    setColDefs([
      { headerName: "Title", field: "classTitle", editable: false, width: 220 },
      {
        headerName: "Recordings",
        field: "classRecordedLink",
        editable: false,
        width: 240,
        cellRenderer: (params: any) => {
          if (!params.value) return 'No Recording';

          return (
            <button
              onClick={() => handleOpenModal(params.value)}
              style={{
                color: 'blue',
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              View Recording
            </button>
          );
        }
      },
      { headerName: "Assignment Name", field: "assignmentName", editable: false, width: 190 },
      {
        headerName: "Assignment File", field: "assignmentFile", editable: false,
        cellRenderer: (params: any) => {
          if (!params.value) return "No File"; // Handle empty values
          return (
            <button
              onClick={() => handleViewFile(params.value)}
              className="text-blue-500 underline"
            >
              <File />
            </button>
          );
        },
        width: 160
      },
      {
        headerName: "Total Marks", field: "totalMarks", editable: false,
        width: 150
      },
      {
        headerName: "ClassMaterial", field: "materialForClass", editable: false,
        cellRenderer: (params: any) => {
          if (!params.value) return "No File";
          return (
            <button
              onClick={() => handleViewFile(params.value)}
              className="text-blue-500 underline"
            >
              <File />
            </button>
          );
        }, width: 150,
      },
      { headerName: "ClassDescription", field: "classDescription", editable: false, width: 290 },
      {
        headerName: "Actions",
        field: "actions",
        width: 180,
        cellRenderer: (params: any) => (
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => editClass(params.data)}
                    className="bg-white text-[#6E2B8B] p-2 rounded hover:bg-white"
                  >
                    <Edit className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit Class</TooltipContent>
              </Tooltip>

              <Button onClick={() => confirmDeleteClass(params.data)} className="text-red-600 bg-white hover:bg-white p-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <img src={remove} alt="Remove Icon" className="h-6 w-6 filter fill-current text-[#6E2B8B]" />
                  </TooltipTrigger>
                  <TooltipContent>Delete Class</TooltipContent>
                </Tooltip>
              </Button>
            </TooltipProvider>
          </div>
        ),
        editable: false,
      },
    ]);
  }, [classData])


  return (

    <div className="flex-1 p-4 mt-5 ml-20">
      <div className="text-gray-600 text-lg mb-4">
        <Breadcrumb />
      </div>
      <div className="flex items-center justify-between bg-[#6E2B8B] text-white px-6 py-4 rounded-lg shadow-lg mb-6 w-[1159px]">
        <div className="flex flex-col">
          <h2 className="text-2xl font-metropolis font-semibold tracking-wide">Class Management</h2>
          <p className="text-sm font-metropolis font-medium">Manage class easily.</p>
        </div>
        <Button onClick={addNewRow}
          className="bg-yellow-400 text-gray-900 font-metropolis font-semibold px-5 py-2 rounded-md shadow-lg hover:bg-yellow-500 transition duration-300">
          + Add Class
        </Button>
      </div>

      {isDeleteModalOpen && classToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-auto">
            <h2 className="text-xl font-medium mb-4">Confirm Delete</h2>
            <p className="mb-4 font-metropolis">
              Are you sure you want to delete the course {" "}
              <strong>
                {classToDelete?.classTitle?.charAt(0).toUpperCase() +
                  classToDelete?.classTitle?.slice(1).toLowerCase() || "this class"}
              </strong>
              ?
            </p>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                onClick={handleDeleteClass}
                className="bg-[#6E2B8B] hover:bg-[#8536a7] text-white px-4 py-2 
                transition-all duration-500 ease-in-out 
               rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
              >
                Delete
              </Button>
              <Button
                onClick={handleCancelDelete}
                className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 transition-all duration-500 ease-in-out 
               rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="ag-theme-quartz font-poppins"
        style={{ height: "70vh", width: "91%" }}>
        <AgGridReact
          rowSelection="multiple"
          suppressRowClickSelection
          suppressMovableColumns
          loading={loading}
          columnDefs={colDefs}
          rowData={classData}
          defaultColDef={{ editable, sortable: true, filter: true, resizable: true }}
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

      {/* PDF Viewer Modal */}
      {isPdfModalOpen && pdfFileUrl && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-7 rounded shadow-lg w-[1300px] h-[700px] relative">
            <button
              onClick={closePdfModal}
              className="absolute top-1 right-1 px-2 py-2 bg-red-500 hover:bg-red-700 text-white rounded-full"
            >
              <AiFillCloseCircle />
            </button>
            <iframe
              src={pdfFileUrl}
              title="PDF Viewer"
              className="w-full h-full border rounded"
            ></iframe>
          </div>
        </div>
      )};

      {/* <Dialog open={isVideoModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[825px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Class Recording</DialogTitle>
          </DialogHeader>
          <div className="w-full aspect-video">
            <video
              controls
              autoPlay
              className="w-full h-full"
              src={videoUrl}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </DialogContent>
      </Dialog> */}


      <Dialog open={isVideoModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[825px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">Class Recording</DialogTitle>
            <DialogDescription className="sr-only">
              Video recording of the class session
            </DialogDescription>
          </DialogHeader>
          <div className="w-full aspect-video bg-black flex items-center justify-center">
            {videoUrl ? (
              <div className="w-full h-full">
                <iframe
                  src={`https://www.youtube.com/embed/${extractYouTubeVideoId(videoUrl)}`}
                  title="YouTube video player"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="text-white">No video URL provided</div>
            )}
          </div>
        </DialogContent>
      </Dialog>


      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[550px]">
            <h2 className="text-xl font-metropolis font-semibold">{editing ? "Edit Class" : "Add NewClass"}</h2>
            <form>
              <div className="mb-4 mt-4">
                <label className="block font-metropolis font-medium">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full border rounded font-metropolis mt-1 p-2 text-gray-400 font-semibold"
                  value={newClass.classTitle}
                  onChange={(e) =>
                    setNewClass({ ...newClass, classTitle: e.target.value })}
                />
                {errors.classTitle && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.classTitle}
                  </p>
                )}
              </div>

              {/* <div className="mb-4">
                <label className="block font-metropolis font-medium">Module Name <span className="text-red-500">*</span></label>
                <Select
                  options={module.map((cls) => ({
                    value: cls.id,
                    label: cls.moduleName,
                  }))}
                  value={
                    newClass.moduleId
                      ? {
                        value: newClass.moduleId,
                        label: module.find((cls) => cls.id === newClass.moduleId)?.moduleName || "Unknown",
                      }
                      : null
                  }
                  onChange={(selectedOption) => {
                    setNewClass({
                      ...newClass,
                      moduleId: selectedOption ? selectedOption.value : "", // Update courseCategoryId with the selected category's id
                    });
                  }}
                  className="w-full rounded mt-1 font-metropolis text-gray-700"
                  placeholder="Select Category"
                  isSearchable={true}
                />
                {errors.moduleName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.moduleName}
                  </p>
                )}
              </div> */}

              {/* <div className="mb-4">
                <label className="block font-metropolis font-medium">Module Name <span className="text-red-500">*</span></label>
                {editing ? (
                  <Select
                    options={module.map((cls) => ({
                      value: cls.id,
                      label: cls.moduleName,
                    }))}
                    value={
                      newClass.moduleId
                        ? {
                          value: newClass.moduleId,
                          label: module.find((cls) => cls.id === newClass.moduleId)?.moduleName || "Unknown",
                        }
                        : null
                    }
                    onChange={(selectedOption) => {
                      setNewClass({
                        ...newClass,
                        moduleId: selectedOption ? selectedOption.value : "",
                      });
                    }}
                    className="w-full rounded mt-1 font-metropolis text-gray-700"
                    placeholder="Select Category"
                    isSearchable={true}
                  />
                ) : (
                  <input
                    type="text"
                    className="w-full border rounded mt-1 p-2 font-metropolis text-gray-400 font-semibold"
                    value={module.find(m => m.id === moduleId)?.moduleName || ""}
                    disabled
                  />
                )}
                {errors.moduleName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.moduleName}
                  </p>
                )}
              </div> */}

              <div className="mb-4 mt-4">
                <label className="block font-metropolis font-medium">Recordings</label>
                <input
                  type="text"
                  placeholder="paste recorded vide link"
                  className="w-full border mt-1 rounded p-2 font-metropolis text-gray-700"
                  value={newClass.classRecordedLink}
                  onChange={(e) => setNewClass({ ...newClass, classRecordedLink: e.target.value })}
                />
              </div>

              <div className="mb-4">
                <label className="block font-metropolis font-medium">Assignment Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full border rounded mt-1 p-2 font-metropolis text-gray-400 font-semibold"
                  value={newClass.assignmentName || ""}
                  onChange={(e) =>
                    setNewClass({ ...newClass, assignmentName: e.target.value })
                  }
                />
                {errors.assignmentName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.assignmentName}
                  </p>
                )}
              </div>

              <div className="mb-4 flex gap-4">
                <div className="w-1/2">
                  <label className="block font-metropolis font-medium">Total Marks <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    className="w-full border rounded mt-1 p-2 font-metropolis text-gray-400 font-semibold"
                    value={newClass.totalMarks || ""}
                    onChange={(e) =>
                      setNewClass({ ...newClass, totalMarks: e.target.value })
                    }
                  />
                  {errors.totalMarks && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.totalMarks}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block font-metropolis font-medium">AssignmentFile</label>
                  <input
                    type="file"
                    className="w-full border rounded mt-1 p-2 font-metropolis text-gray-400"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setNewClass({ ...newClass, assignmentFile: e.target.files[0].name });
                        setSelectedAssignmentFile(e.target.files[0]);
                      }
                    }}
                  />
                  {errors.assignmentFile && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.assignmentFile}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block font-metropolis font-medium">Class Material</label>
                <input
                  type="file"
                  className="w-full border rounded mt-1 p-2 font-metropolis text-gray-400"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setNewClass({ ...newClass, materialForClass: e.target.files[0].name });
                      setSelectedMaterialFile(e.target.files[0]);
                    }
                  }}
                />
                {errors.materialForClass && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.materialForClass}
                  </p>
                )}
              </div>
              {/* </div> */}
              <div className="mb-4">
                <label className="block font-metropolis font-medium">Description <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full border rounded mt-1 p-2 font-metropolis text-gray-400 font-semibold"
                  value={newClass.classDescription}
                  onChange={(e) => setNewClass({ ...newClass, classDescription: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <Button
                  onClick={handleFormSubmit}
                  className="bg-[#6E2B8B] hover:bg-[#8536a7] text-white px-4 py-2 
                transition-all duration-500 ease-in-out 
               rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
                >
                  {editing ? "Update Class" : "Create Class"}
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
  );
};

export default ClassTable;