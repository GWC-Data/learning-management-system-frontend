import { Button } from "../../ui/button";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import { Edit } from "lucide-react";
import remove from '../../../assets/delete.png';
import { ColDef } from "ag-grid-community";
import Select from 'react-select';
import { format } from "date-fns";
import Breadcrumb from "./breadcrumb";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../../../components/ui/tooltip";
import {
  createBatchModuleScheduleApi,
  fetchBatchModuleScheduleApi,
  updateBatchModuleScheduleApi,
  deleteBatchModuleScheduleApi,
} from "@/helpers/api/batchModuleScheduleApi";
import { fetchBatchApi } from "@/helpers/api/batchApi";
import { fetchCourseModuleApi } from "@/helpers/api/courseModuleApi";
import { fetchUsersApi } from "@/helpers/api/userApi";
import { useSearchParams } from "react-router-dom";

interface BatchModuleScheduleTableProps {
  editable?: boolean;
}

interface ScheduleData {
  id: string;
  batchId: string;
  batchName: string;
  moduleId: string;
  moduleName: string;
  trainerId: string[];
  trainerName: string[];
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  meetingLink: string;
  duration: number;
}

interface Options {
  id: any;
  batchName: any;
  moduleName: any;
  trainerName: string;
}

//get token
const getToken = () => localStorage.getItem("authToken");

const BatchModuleScheduleTable = ({ editable = true }: BatchModuleScheduleTableProps) => {
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [colDefs, setColDefs] = useState<ColDef[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [batches, setBatches] = useState<Options[]>([]);
  const [modules, setModules] = useState<{ id: string; moduleName: string }[]>([]);
  const [trainers, setTrainers] = useState<Options[]>([]);
  const [errors] = useState<Record<string, string>>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<ScheduleData | null>(null);
  const [newSchedule, setNewSchedule] = useState<ScheduleData>({
    id: "",
    batchId: "",
    batchName: "",
    moduleId: "",
    moduleName: "",
    trainerId: [],
    trainerName: [],
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    meetingLink: "",
    duration: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  {/* pagination */ }
  const recordsPerPage = 15;
  const totalPages = Math.ceil(schedules.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentData = schedules.slice(startIndex, startIndex + recordsPerPage);

  const [searchParams] = useSearchParams();
  const batchId = String(searchParams.get("batchId"));


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
      const schedulesResponse = await fetchBatchModuleScheduleApi();
      console.log('schedulesResponse', schedulesResponse);
      // Extract the data array
      const schedulesData = schedulesResponse?.batchModuleSchedule.batchModuleSchedules || [];

      // Safeguard with Array.isArray
      const schedules = Array.isArray(schedulesData)
        ? schedulesData.map((schedule: any) => ({
          id: schedule.id,
          batchId: schedule.batch?.id || 0,
          batchName: schedule.batch?.batchName || "Unknown Batch",
          moduleId: schedule.module?.id || 0,
          moduleName: schedule.module?.moduleName || "Unknown Module",
          trainerId: schedule.trainers ? schedule.trainers.map((trainers: any) => trainers.id) : [],
          trainerName: schedule.trainers ? schedule.trainers.map((trainers: any) =>
            `${trainers.firstName} ${trainers.lastName}`).join(", ") : "Unknown Trainer",
          startDate: schedule.startDate?.value,
          startTime: schedule.startTime?.value,
          endDate: schedule.endDate?.value,
          endTime: schedule.endTime?.value,
          meetingLink: schedule.meetingLink,
          duration: schedule.duration,
        }))
        : [];
      console.log(schedules, 'scheduleresponse')

      const filterSchedule = schedules.filter((sch: any) => sch.batchId === batchId);
      console.log("filterSchedule", filterSchedule);

      const batchResponse = await fetchBatchApi();
      const batchesData = batchResponse?.batch || [];
      const batches = batchesData.map((batch: { id: any; batchName: any; }) => ({
        id: batch.id,
        batchName: batch.batchName,
      }));
      setBatches(batches);
      console.log("shceduleBatchRes", batches);

      const moduleResponse = await fetchCourseModuleApi();

      const modules = Array.isArray(moduleResponse)
        ? moduleResponse.map((module: { moduleId: string; moduleName: string }) => ({
          id: module.moduleId,
          moduleName: module.moduleName ?? "Unknown Module",
        }))
        : [];

      setModules(modules);
      console.log("scheduleModulesRes", modules);

      const responseUser = await fetchUsersApi();
      const trainers = responseUser.users.filter(
        (user: any) => user.roleName === "trainer"
      ).map((trainer: any) => ({
        id: trainer.id,
        trainerName: `${trainer.firstName} ${trainer.lastName}`
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
    setNewSchedule({
      id: "",
      batchId: "",
      batchName: "",
      moduleId: "",
      moduleName: "",
      trainerId: [],
      trainerName: [],
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      meetingLink: "",
      duration: 0,
    });
    setIsModalOpen(true);
  };

  const editSchedule = (schedule: ScheduleData) => {
    console.log("editschedule", schedule);
    setEditing(true);
    setNewSchedule({
      id: schedule.id,
      batchId: schedule.batchId,
      batchName: schedule.batchName,
      moduleId: schedule.moduleId,
      moduleName: schedule.moduleName,
      trainerId: schedule.trainerId,
      trainerName: schedule.trainerName,
      startDate: schedule.startDate,
      startTime: schedule.startTime,
      endDate: schedule.endDate,
      endTime: schedule.endTime,
      meetingLink: schedule.meetingLink,
      duration: schedule.duration,
    });
    setIsModalOpen(true);
  };


  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewSchedule({
      id: "",
      batchId: "",
      batchName: "",
      moduleId: "",
      moduleName: "",
      trainerId: [],
      trainerName: [],
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      meetingLink: "",
      duration: 0,
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
      await deleteBatchModuleScheduleApi(scheduleToDelete.id);

      setBatches((prev) =>
        prev.filter((schedule) => schedule.id !== scheduleToDelete.id));
      toast.success("Schedule deleted successfully!");
      fetchSchedules();
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
        await updateBatchModuleScheduleApi(newSchedule.id, {
          batchId: newSchedule.batchId,
          moduleId: newSchedule.moduleId,
          trainerIds: newSchedule.trainerId,
          startDate: newSchedule.startDate,
          startTime: newSchedule.startTime,
          endDate: newSchedule.endDate,
          endTime: newSchedule.endTime,
          meetingLink: newSchedule.meetingLink,
          duration: newSchedule.duration
        });
        toast.success("Schedule updated successfully!");
      } else {
        await createBatchModuleScheduleApi({
          batchId: newSchedule.batchId,
          moduleId: newSchedule.moduleId,
          trainerIds: newSchedule.trainerId,
          startDate: newSchedule.startDate,
          startTime: newSchedule.startTime,
          endDate: newSchedule.endDate,
          endTime: newSchedule.endTime,
          meetingLink: newSchedule.meetingLink,
          duration: newSchedule.duration
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
        headerName: "Join Link",
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
      { headerName: "Duration(hour)", field: "duration", editable: false },
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
    <div className="flex-1 p-4 mt-10 ml-24">
      <div className="text-gray-600 text-lg mb-4">
        <Breadcrumb />
      </div>
      <div className="flex items-center justify-between bg-[#6E2B8B] text-white px-6 py-4 rounded-lg shadow-lg mb-6 w-[1147px]">
        <div className="flex flex-col">
          <h2 className="text-2xl font-metropolis font-semibold tracking-wide">Batch Module Schedule</h2>
          <p className="text-sm font-metropolis font-medium">Manage batch module schedules easily.</p>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
            <h2 className="text-xl font-metropolis font-semibold mb-4">
              {editing ? "Edit Schedule" : "Add NewSchedule"}</h2>
            <form>
              <div className="flex gap-4 mb-2 mt-2">
                <div className="w-1/2">
                  <label className="block font-metropolis font-medium">Batches <span className="text-red-500">*</span></label>
                  <Select
                    options={batches.map((batch) => ({
                      value: batch.id,
                      label: batch.batchName,
                    }))}
                    value={
                      newSchedule.batchId
                        ? {
                          value: newSchedule.batchId,
                          label: batches.find((batch) => batch.id === newSchedule.batchId)?.batchName,
                        }
                        : null
                    }
                    onChange={(selectedOption) => {
                      setNewSchedule({
                        ...newSchedule,
                        batchId: selectedOption ? selectedOption.value : "", // Default to 0 or an appropriate number if null
                      });
                    }}
                    className="w-full rounded font-metropolis text-gray-700 mt-1"
                    placeholder="Select Batch"
                    isSearchable={true}
                  />
                </div>


                <div>
                  <label className="block font-metropolis font-medium">Modules <span className="text-red-500">*</span></label>                  <Select
                    options={modules.map((module) => ({
                      value: module.id,
                      label: module.moduleName,
                    }))}
                    value={
                      newSchedule.moduleId
                        ? {
                          value: newSchedule.moduleId,
                          label: modules.find((module) => module.id === newSchedule.moduleId)?.moduleName,
                        }
                        : null
                    }
                    onChange={(selectedOption) =>
                      setNewSchedule({
                        ...newSchedule,
                        moduleId: selectedOption ? selectedOption.value : '', // Default to 0 if nothing is selected
                      })
                    }
                    placeholder="Select Module"
                    className="w-52 rounded font-metropolis text-gray-700 mt-1"
                    isSearchable={true} // Enables search functionality
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
                  value={(newSchedule.trainerId || []).map((id) => ({
                    value: id,
                    label: trainers.find((trainer) => trainer.id === id)?.trainerName || "",
                  }))}
                  onChange={(selectedOptions) => {
                    const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
                    const selectedNames = selectedOptions ? selectedOptions.map(option => option.label) : [];
                    setNewSchedule({
                      ...newSchedule,
                      trainerId: selectedIds,
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
                    className="w-full border rounded font-metropolis mt-1 p-2 text-gray-400 font-semibold"
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
                    className="w-full border rounded font-metropolis mt-1 p-2 text-gray-400 font-semibold"
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
                    className="w-full border rounded font-metropolis mt-1 p-2 text-gray-400 font-semibold"
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
                    className="w-full border rounded font-metropolis mt-1 p-2 text-gray-400 font-semibold"
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
                <label className="block font-metropolis font-medium ">
                  Joining Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSchedule.meetingLink}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, meetingLink: e.target.value })
                  }
                  className="w-full border rounded font-metropolis mt-1 p-2 text-gray-400 font-semibold"
                />
                {errors.MeetingLink && (
                  <span className="text-red-500 text-sm">
                    {errors.MeetingLink}
                  </span>
                )}
              </div>

              {/* Duration */}
              <div className="mb-4">
                <label className="block font-metropolis font-medium">
                  Duration (hours) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={newSchedule.duration}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, duration: parseInt(e.target.value) })
                  }
                  className="w-full border rounded font-metropolis mt-1 p-2 text-gray-400 font-semibold"
                />
                {errors.Duration && (
                  <span className="text-red-500 text-sm">
                    {errors.Duration}
                  </span>
                )}
              </div>
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
    </div>
  );
};

export default BatchModuleScheduleTable;

