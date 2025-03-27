import { Button } from "../../ui/button";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import { Edit, Calendar, Users } from "lucide-react";
import remove from '../../../assets/delete.png';
import { ColDef } from "ag-grid-community";
import Select from 'react-select';
import { format } from "date-fns";
import Breadcrumb from "./breadcrumb";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../../ui/tooltip";
import {
  createBatchClassScheduleApi,
  fetchBatchClassScheduleApi,
  updateBatchClassScheduleApi,
  deleteBatchClassScheduleApi,
} from "@/helpers/api/batchClassScheduleApi";
import { fetchBatchApi } from "@/helpers/api/batchApi";
import { fetchCourseModuleApi } from "@/helpers/api/courseModuleApi";
import { fetchUsersApi } from "@/helpers/api/userApi";
import { fetchClassForModuleApi } from "@/helpers/api/classForModuleApi";
import { useSearchParams } from "react-router-dom";

interface BatchClassScheduleTableProps {
  editable?: boolean;
}

interface ScheduleData {
  id: string;
  batchId: string;
  batchName: string;
  moduleId: string;
  moduleName: string;
  classId: string;
  classTitle: string;
  trainerIds: string[];
  trainerName: string[];
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  meetingLink: string;
  assignmentEndDate: string;
  traineeAssignments?: {
    traineeId: string;
    traineeName: string;
    assignmentEndDate: string | Date;
  }[];
}

interface Options {
  id: any;
  batchName: any;
  moduleName: any;
  classTitle: any;
  trainerName: string;
}

interface Trainee {
  id: string;
  firstName: string;
  lastName: string;
}

//get token
const getToken = () => localStorage.getItem("authToken");

const BatchClassScheduleTable = ({ editable = true }: BatchClassScheduleTableProps) => {
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [colDefs, setColDefs] = useState<ColDef[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [batches, setBatches] = useState<{ id: string; batchName: string }[]>([]);
  const [modules, setModules] = useState<{ id: string; moduleName: string }[]>([]);
  const [classes, setClasses] = useState<{ id: string; classTitle: string }[]>([]);
  const [trainers, setTrainers] = useState<Options[]>([]);
  const [errors] = useState<Record<string, string>>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<ScheduleData | null>(null);

  // New states for assignment extension functionality
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [selectedTrainees, setSelectedTrainees] = useState<string[]>([]);
  const [newAssignmentEndDate, setNewAssignmentEndDate] = useState("");

  const [newSchedule, setNewSchedule] = useState<ScheduleData>({
    id: "",
    batchId: "",
    batchName: "",
    moduleId: "",
    moduleName: "",
    classId: "",
    classTitle: "",
    trainerIds: [],
    trainerName: [],
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    meetingLink: "",
    assignmentEndDate: "",
    traineeAssignments: []
  });

  const [currentPage, setCurrentPage] = useState(1);
  {/* pagination */ }
  const recordsPerPage = 15;
  const totalPages = Math.ceil(schedules.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentData = schedules.slice(startIndex, startIndex + recordsPerPage);

  const [searchParams] = useSearchParams();
  const batchId = searchParams.get("batchId");
  console.log("batchId", batchId);

  const handlePageChange = (newPage: SetStateAction<number>) => {
    setCurrentPage(newPage);
  };

  const fetchSchedules = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to view schedules.");
      return;
    }

    try {
      const schedulesResponse = await fetchBatchClassScheduleApi();
      console.log("schedulesResponse", schedulesResponse);

      // Extract the data array
      const schedulesData = schedulesResponse?.batchClassSchedule?.batchClassSchedules || [];

      // Safeguard with Array.isArray
      const schedules: ScheduleData[] = Array.isArray(schedulesData)
        ? schedulesData.map((schedule: any) => ({
          id: schedule.id,
          batchId: schedule.batch?.id || "",
          batchName: schedule.batch?.batchName || "Unknown Batch",
          moduleId: schedule.module?.id || "",
          moduleName: schedule.module?.moduleName || "Unknown Module",
          classId: schedule.class?.id || "",
          classTitle: schedule.class?.classTitle || "Unknown Class",
          trainerIds: schedule.trainers ? schedule.trainers.map((trainer: any) => trainer.id) : [],
          trainerName: schedule.trainers
            ? schedule.trainers.map((trainer: any) => `${trainer.firstName} ${trainer.lastName}`)
            : [],
          startDate: schedule.startDate.value || "",
          startTime: schedule.startTime.value || "",
          endDate: schedule.endDate.value || "",
          endTime: schedule.endTime.value || "",
          meetingLink: schedule.meetingLink || "",
          assignmentEndDate: schedule.assignmentEndDate || "",
          traineeAssignments: schedule.assignments
            ? schedule.assignments.map((assignment: any) => ({
              traineeId: assignment.traineeId,
              traineeName: `${assignment.traineeFirstName} ${assignment.traineeLastName}`,
              assignmentEndDate: assignment.assignmentEndDate,
            }))
            : [],
        }))
        : [];

      console.log("scheduleresponse", schedules);

      const filterSchedule = schedules.filter((sch: ScheduleData) => sch.batchId === batchId);
      console.log("filterSchedule", filterSchedule);

      const batchResponse = await fetchBatchApi();
      const batchesData = batchResponse?.batch || [];
      console.log("Fetched Batches Data:", batchesData);

      const batches = batchesData.map((batch: { id: any; batchName: any; trainees: any; }) => ({
        id: batch.id,
        batchName: batch.batchName,
        trainees: batch.trainees || [], // Ensure trainees exists
      }));

      setBatches(batches);
      console.log("Processed Batches:", batches);

      // Check if batchId exists before filtering
      if (!batchId) {
        console.error("batchId is undefined or null!");
        return;
      }

      // Find the batch with the matching ID
      const currentBatch = batches.find((b: { id: string; }) => b.id === batchId);
      console.log("Found Current Batch:", currentBatch);

      if (currentBatch && currentBatch.trainees) {
        setTrainees(
          currentBatch.trainees.map((trainee: { id: any; firstName: any; lastName: any; }) => ({
            id: trainee.id,
            firstName: trainee.firstName || "",
            lastName: trainee.lastName || "",
          }))
        );
      } else {
        console.error("No trainees found for batchId:", batchId);
      }


      const moduleResponse = await fetchCourseModuleApi();
      const modules = Array.isArray(moduleResponse)
        ? moduleResponse.map((module: { moduleId: string; moduleName: string }) => ({
          id: module.moduleId,
          moduleName: module.moduleName ?? "Unknown Module",
        }))
        : [];

      setModules(modules);
      console.log("scheduleModulesRes", modules);

      const classResponse = await fetchClassForModuleApi();
      console.log("classssssss", classResponse);

      const mappedClasses = classResponse.classes.map((cls: { classId: any; classTitle: any; }) => ({
        id: cls.classId,
        classTitle: cls.classTitle,
      }));

      console.log("mappedclassess", mappedClasses);
      setClasses(mappedClasses);

      const responseUser = await fetchUsersApi();
      const trainers = responseUser.users
        .filter((user: any) => user.roleName === "trainer")
        .map((trainer: any) => ({
          id: trainer.id,
          trainerName: `${trainer.firstName} ${trainer.lastName}`,
        }));
      setTrainers(trainers);
      console.log("trainers", trainers);

      setSchedules(filterSchedule);
    } catch (error) {
      console.error("Failed to fetch schedules", error);
      toast.error("Failed to fetch schedules. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const addNewSchedule = () => {
    setEditing(false);

    const currentBatch = batches.find(b => b.id === batchId);
    const currentBatchName = currentBatch ? currentBatch.batchName : "";
    console.log("currentBatches", currentBatchName);

    setNewSchedule({
      id: "",
      batchId: String(batchId),
      batchName: currentBatchName,
      moduleId: "",
      moduleName: "",
      classId: "",
      classTitle: "",
      trainerIds: [],
      trainerName: [],
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      meetingLink: "",
      assignmentEndDate: "",
      traineeAssignments: []
    });
    setIsModalOpen(true);
  };

  const editSchedule = (schedule: ScheduleData) => {
    console.log("editschedule", schedule);
    setEditing(true);
    setNewSchedule({
      ...schedule
    });
    setIsModalOpen(true);
  };

  // Open assignment extension modal
  const openAssignmentModal = () => {
    setNewAssignmentEndDate(newSchedule.assignmentEndDate || "");
    setSelectedTrainees([]);
    setIsAssignmentModalOpen(true);
  };

  // Handle save assignment changes
  const handleSaveAssignmentChanges = () => {
    // Create new trainee assignments or update existing ones
    const updatedTraineeAssignments = [...(newSchedule.traineeAssignments || [])];

    selectedTrainees.forEach(traineeId => {
      const existingIndex = updatedTraineeAssignments.findIndex(
        assignment => assignment.traineeId === traineeId
      );

      const trainee = trainees.find(t => t.id === traineeId);
      const traineeName = trainee ? `${trainee.firstName} ${trainee.lastName}` : "";

      if (existingIndex >= 0) {
        updatedTraineeAssignments[existingIndex].assignmentEndDate = newAssignmentEndDate;
      } else {
        updatedTraineeAssignments.push({
          traineeId,
          traineeName,
          assignmentEndDate: newAssignmentEndDate
        });
      }
    });

    setNewSchedule({
      ...newSchedule,
      traineeAssignments: updatedTraineeAssignments
    });

    setIsAssignmentModalOpen(false);
    toast.success("Assignment end dates updated!");
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewSchedule({
      id: "",
      batchId: "",
      batchName: "",
      moduleId: "",
      moduleName: "",
      classId: "",
      classTitle: "",
      trainerIds: [],
      trainerName: [],
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      meetingLink: "",
      assignmentEndDate: "",
      traineeAssignments: []
    });
  };

  const confirmDeleteSchedule = (data: ScheduleData) => {
    const schedule = schedules.find((schedule) => schedule.id === data.id);
    if (schedule) {
      setScheduleToDelete(schedule);
      setIsDeleteModalOpen(true);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setScheduleToDelete(null);
  };

  const handleDeleteSchedule = async () => {
    if (!scheduleToDelete) {
      toast.error('No schedule selected for deletion.');
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to perform this action.");
      return;
    }

    try {
      await deleteBatchClassScheduleApi(scheduleToDelete.id);

      setBatches((prev) =>
        prev.filter((schedule) => schedule.id !== scheduleToDelete.id));
      toast.success("Schedule deleted successfully!");
      fetchSchedules();
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error("Failed to delete schedule. Please try again later.");
    } finally {
      handleModalClose();
    }
  };

  const handleFormSubmit = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to perform this action.");
      return;
    }

    try {
      if (editing) {
        await updateBatchClassScheduleApi(newSchedule.id, {
          batchId: newSchedule.batchId,
          moduleId: newSchedule.moduleId,
          classId: newSchedule.classId,
          trainerIds: newSchedule.trainerIds,
          startDate: newSchedule.startDate,
          startTime: newSchedule.startTime,
          endDate: newSchedule.endDate,
          endTime: newSchedule.endTime,
          meetingLink: newSchedule.meetingLink,
          traineeAssignments: newSchedule.traineeAssignments,
        });
        toast.success("Schedule updated successfully!");
      } else {
        await createBatchClassScheduleApi({
          batchId: newSchedule.batchId,
          moduleId: newSchedule.moduleId,
          trainerIds: newSchedule.trainerIds,
          classId: newSchedule.classId,
          startDate: newSchedule.startDate,
          startTime: newSchedule.startTime,
          endDate: newSchedule.endDate,
          endTime: newSchedule.endTime,
          meetingLink: newSchedule.meetingLink,
          assignmentEndDate: newSchedule.assignmentEndDate
        });
        toast.success("BatchSchedule created successfully!")
      }
      fetchSchedules();
    } catch (error) {
      console.error("Failed to submit schedule", error);
      toast.error("Failed to submit schedule. Please try again later.");
    }

    handleModalClose();
  };

  useEffect(() => {
    setColDefs([
      { headerName: "Batch Name", field: "batchName", editable: false },
      { headerName: "Module Name", field: "moduleName", editable: false },
      { headerName: "Class Name", field: "classTitle", editable: false },
      { headerName: "Trainers Name", field: "trainerName", editable: false },
      {
        headerName: "Start Date", field: "startDate",
        valueFormatter: (params) =>
          params.value
            ? format(new Date(params.value), "dd-MM-yyyy")
            : "N/A",
        editable: false
      },
      {
        headerName: "Start Time",
        field: "startTime",
        valueGetter: (params) => params.data?.startTime || "N/A",
        editable: false
      },
      {
        headerName: "End Date", field: "endDate",
        valueFormatter: (params) =>
          params.value
            ? format(new Date(params.value), "dd-MM-yyyy")
            : "N/A",
        editable: false
      },
      {
        headerName: "End Time", field: "endTime",
        valueGetter: (params) => params.data?.endTime || "N/A",
        editable: false
      },
      {
        headerName: "Joining Link",
        field: "meetingLink",
        editable: false,
        cellRenderer: (params: any) => {
          // Check if meetingLink exists and return a clickable link
          return params.value ? (
            <a href={params.value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              Joining link
            </a>
          ) : (
            "No Link"
          );
        },
      },
      {
        headerName: "AssignmentEndDate", field: "assignmentEndDate",
        valueFormatter: (params) =>
          params.value
            ? format(new Date(params.value), "dd-MM-yyyy")
            : "N/A",
        editable: false
      },
      {
        headerName: "Actions",
        field: "actions",
        width: 200,
        cellRenderer: (params: any) => {
          return (
            <div className="flex space-x-2">
              <TooltipProvider>
                <div className="flex space-x-2">
                  {/* Edit Schedule Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => editSchedule(params.data)}
                        className="text-[#6E2B8B] bg-white p-2 rounded hover:bg-white"
                      >
                        <Edit className="h-6 w-6" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit Schedule</TooltipContent>
                  </Tooltip>

                  {/* Delete Schedule Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => confirmDeleteSchedule(params.data)}
                        className="bg-white text-red-500 p-2 rounded hover:bg-white"
                      >
                        <img src={remove} alt="Remove Icon" className="h-6 w-6 filter fill-current text-[#6E2B8B]" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete Schedule</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
          );
        },
        editable: false,
      },
    ]);
  }, [schedules]);

  return (
    <div className="flex-1 p-4 mt-5 ml-20">
      <div className="text-gray-600 text-lg mb-4">
        <Breadcrumb />
      </div>
      <div className="flex items-center justify-between bg-[#6E2B8B] text-white px-6 py-4 rounded-lg shadow-lg mb-6 w-[1159px]">
        <div className="flex flex-col">
          <h2 className="text-2xl font-metropolis font-semibold tracking-wide">Batch Class Schedule</h2>
          <p className="text-sm font-metropolis font-medium">Manage batch class schedules easily.</p>
        </div>
        <Button onClick={addNewSchedule} className="bg-yellow-400 text-gray-900 font-metropolis font-semibold px-5 py-2 rounded-md shadow-lg hover:bg-yellow-500 transition duration-300">
          + Add Schedule
        </Button>
      </div>

      {isDeleteModalOpen && scheduleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-auto">
            <h2 className="text-xl font-metropolis font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-4 font-metropolis font-medium">
              Are you sure you want to delete the Batch {" "}
              <strong>
                {scheduleToDelete?.batchName?.charAt(0).toUpperCase() +
                  scheduleToDelete?.batchName?.slice(1).toLowerCase() || "this batchname"}
              </strong>
              ?
            </p>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                onClick={handleDeleteSchedule}
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

      <div
        className="ag-theme-quartz text-left font-poppins"
        style={{ height: "calc(100vh - 180px)", width: "91%" }}
      >
        <AgGridReact
          rowSelection="multiple"
          suppressRowClickSelection
          suppressMovableColumns
          loading={loading}
          columnDefs={colDefs}
          rowData={schedules}
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

      {/* Schedule Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[550px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-metropolis font-semibold mb-4">
              {editing ? "Edit Schedule" : "Add New Schedule"}
            </h2>
            <form>
              {/* Batch and Module Info (Read-only when editing) */}
              {editing && (
                <div className="mb-4 mt-2">
                  <div className="bg-gray-100 p-3 rounded-md">
                    <p className="font-metropolis font-medium text-gray-700">
                      <span className="font-bold">Batch:</span> {newSchedule.batchName}
                    </p>
                    <p className="font-metropolis font-medium text-gray-700 mt-1">
                      <span className="font-bold">Module:</span> {newSchedule.moduleName}
                    </p>
                  </div>
                </div>
              )}

              {!editing && (
              <div className="flex gap-4 mb-2 mt-2">
                <div className="w-full">
                  <label className="block font-metropolis font-medium">
                    Module Name <span className="text-red-500">*</span>
                  </label> 
                    <Select
                      options={modules.map((m) => ({
                        value: m.id,
                        label: m.moduleName,
                      }))}
                      value={
                        newSchedule.moduleId
                          ? {
                            value: newSchedule.moduleId,
                            label: modules.find((m) => m.id === newSchedule.moduleId)?.moduleName,
                          }
                          : null
                      }
                      onChange={(selectedOption) =>
                        setNewSchedule({
                          ...newSchedule,
                          moduleId: selectedOption ? selectedOption.value : "",
                        })
                      }
                      placeholder="Select Module"
                      className="w-full rounded font-metropolis text-gray-700 mt-1"
                      isSearchable={true}
                    />
                </div>
              </div>
                 )}

              <div className="flex gap-4 mb-2 mt-2">
                <div className="w-full">
                  <label className="block font-metropolis font-medium">Class <span className="text-red-500">*</span></label>
                  <Select
                    options={classes.map((cls) => ({
                      value: cls.id,
                      label: cls.classTitle,
                    }))}
                    value={
                      newSchedule.classId
                        ? {
                          value: newSchedule.classId,
                          label: classes.find((cls) => cls.id === newSchedule.classId)?.classTitle,
                        }
                        : null
                    }
                    onChange={(selectedOption) =>
                      setNewSchedule({
                        ...newSchedule,
                        classId: selectedOption ? selectedOption.value : '',
                      })
                    }
                    placeholder="Select Class"
                    className="w-full rounded font-metropolis text-gray-700 mt-1"
                    isSearchable={true}
                  />
                </div>
              </div>

              {/* Trainer Selector */}
              <div className="mb-3 mt-4">
                <label className="block font-metropolis font-medium">Trainers <span className="text-red-500">*</span></label>
                <Select
                  isMulti
                  options={trainers.map((trainer) => ({
                    value: trainer.id,
                    label: trainer.trainerName,
                  }))}
                  value={(newSchedule.trainerIds || []).map((id) => ({
                    value: id,
                    label: trainers.find((trainer) => trainer.id === id)?.trainerName || "",
                  }))}
                  onChange={(selectedOptions) => {
                    const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
                    const selectedNames = selectedOptions ? selectedOptions.map(option => option.label) : [];
                    setNewSchedule({
                      ...newSchedule,
                      trainerIds: selectedIds,
                      trainerName: selectedNames,
                    });
                  }}
                  className="w-full border rounded mt-1 font-metropolis text-gray-700"
                  placeholder="Select Trainers"
                  isSearchable={true}
                />
              </div>

              {/* Start Date and Time */}
              <div className="flex gap-4 mb-4 mt-4">
                <div className="w-1/2">
                  <label className="block font-metropolis font-medium">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newSchedule.startDate}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, startDate: e.target.value })
                    }
                    className="w-full border rounded font-metropolis mt-1 p-2 text-gray-700"
                  />
                  {errors.StartDate && (
                    <span className="text-red-500 text-sm">
                      {errors.StartDate}
                    </span>
                  )}
                </div>
                <div className="w-1/2">
                  <label className="block font-metropolis font-medium">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    step="1"
                    value={newSchedule.startTime || ""}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, startTime: e.target.value })
                    }
                    className="w-full border rounded font-metropolis mt-1 p-2 text-gray-700"
                  />
                  {errors.StartTime && (
                    <span className="text-red-500 text-sm">
                      {errors.StartTime}
                    </span>
                  )}
                </div>
              </div>

              {/* End Date and Time */}
              <div className="flex gap-4 mb-4">
                <div className="w-1/2">
                  <label className="block font-metropolis font-medium">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newSchedule.endDate}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, endDate: e.target.value })
                    }
                    className="w-full border rounded font-metropolis mt-1 p-2 text-gray-700"
                  />
                  {errors.EndDate && (
                    <span className="text-red-500 text-sm">
                      {errors.EndDate}
                    </span>
                  )}
                </div>
                <div className="w-1/2">
                  <label className="block font-metropolis font-medium">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    step="1"
                    value={newSchedule.endTime}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, endTime: e.target.value })
                    }
                    className="w-full border rounded font-metropolis mt-1 p-2 text-gray-700"
                  />
                  {errors.EndTime && (
                    <span className="text-red-500 text-sm">
                      {errors.EndTime}
                    </span>
                  )}
                </div>
              </div>

              {/* Meeting Link */}
              <div className="mb-4">
                <label className="block font-metropolis font-medium">
                  Joining Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSchedule.meetingLink}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, meetingLink: e.target.value })
                  }
                  className="w-full border rounded font-metropolis mt-1 p-2 text-gray-700"
                />
                {errors.MeetingLink && (
                  <span className="text-red-500 text-sm">
                    {errors.MeetingLink}
                  </span>
                )}
              </div>

              {/* Assignment Extension Button */}
              {editing && (
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={openAssignmentModal}
                    className="w-full bg-[#eadcf1] text-black hover:bg-[#6E2B8B] hover:text-white p-2 rounded font-metropolis transition-all duration-300 flex items-center justify-center"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Extend Assignment Deadline
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <Button
                  onClick={handleFormSubmit}
                  className="bg-[#6E2B8B] hover:bg-[#8536a7] text-white px-4 py-2 
             transition-all duration-500 ease-in-out 
             rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
                >
                  {editing ? "Update Schedule" : "Create NewSchedule"}
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

      {/* Assignment Extension Modal */}
      {isAssignmentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-metropolis font-semibold mb-4">
              Extend Assignment Deadline
            </h2>

            <div className="mb-5">
              <div className="bg-gray-100 p-3 rounded-md mb-4">
                <p className="font-metropolis font-medium text-gray-700">
                  <span className="font-bold">Class:</span> {classes.find(cls => cls.id === newSchedule.classId)?.classTitle || ""}
                </p>
                <p className="font-metropolis font-medium text-gray-700 mt-1">
                  <span className="font-bold">Batch:</span> {newSchedule.batchName}
                </p>
                <p className="font-metropolis font-medium text-gray-700 mt-1">
                  <span className="font-bold">Module:</span> {newSchedule.moduleName}
                </p>
              </div>

              <div className="mb-4">
                <label className="block font-metropolis font-medium mb-2">
                  Assignment End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newAssignmentEndDate}
                  onChange={(e) => setNewAssignmentEndDate(e.target.value)}
                  className="w-full border rounded font-metropolis p-2 text-gray-700"
                />
              </div>

              <div className="mb-6">
                <label className="block font-metropolis font-medium mb-2">
                  Select Trainees <span className="text-red-500">*</span>
                </label>

                <div className="mb-2 flex items-center">
                  <input
                    type="checkbox"
                    id="selectAll"
                    className="mr-2"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTrainees(trainees.map(t => t.id));
                      } else {
                        setSelectedTrainees([]);
                      }
                    }}
                    checked={selectedTrainees.length === trainees.length && trainees.length > 0}
                  />
                  <label htmlFor="selectAll" className="font-metropolis font-medium text-gray-700">
                    Select All Trainees
                  </label>
                </div>

                <div className="max-h-48 overflow-y-auto border rounded-md p-2">
                  {trainees.length > 0 ?
                    trainees.map((trainee) => (
                      <div key={trainee.id} className="flex items-center py-1 border-b">
                        <input
                          type="checkbox"
                          id={`trainee-${trainee.id}`}
                          value={trainee.id}
                          checked={selectedTrainees.includes(trainee.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTrainees([...selectedTrainees, trainee.id]);
                            } else {
                              setSelectedTrainees(selectedTrainees.filter(id => id !== trainee.id));
                            }
                          }}
                          className="mr-2"
                        />
                        <label htmlFor={`trainee-${trainee.id}`} className="font-metropolis text-gray-700">
                          {trainee.firstName} {trainee.lastName}
                        </label>
                      </div>
                    )) :
                    <p className="text-gray-500 p-2">No trainees available for this batch</p>
                  }
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Selected: {selectedTrainees.length} of {trainees.length} trainees
                </p>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  onClick={handleSaveAssignmentChanges}
                  disabled={selectedTrainees.length === 0 || !newAssignmentEndDate}
                  className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-all duration-300 ${(selectedTrainees.length === 0 || !newAssignmentEndDate) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  Save Changes
                </Button>
                <Button
                  onClick={() => setIsAssignmentModalOpen(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-all duration-300"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchClassScheduleTable;

