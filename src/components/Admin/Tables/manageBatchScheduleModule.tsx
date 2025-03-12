import { Button } from "../../ui/button";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import { Edit, Trash } from "lucide-react";
import { ColDef } from "ag-grid-community";
import Select from 'react-select';
import { format } from "date-fns";
import Breadcrumb from "./breadcrumb";
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
        console.log(schedules,'scheduleresponse')

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
      { headerName: "Start Date", field: "startDate",
         valueFormatter: (params) =>
                  params.value
                    ? format(new Date(params.value), "dd-MM-yyyy") 
                    : "N/A", 
          editable: false },
          {
            headerName: "Start Time",
            field: "startTime",
            valueGetter: (params) => params.data?.startTime || "N/A",          
        editable: false },
      { headerName: "End Date", field: "endDate", 
         valueFormatter: (params) =>
                  params.value
                    ? format(new Date(params.value), "dd-MM-yyyy") 
                    : "N/A",
        editable: false },
      { headerName: "End Time", field: "endTime", 
        valueGetter: (params) => params.data?.endTime || "N/A",
        editable: false },
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
              <Button onClick={() => editSchedule(params.data)} 
              className="text-[#6E2B8B] bg-white p-2 rounded hover:bg-white">
                <Edit className="h-6 w-6" />
              </Button>
              <Button onClick={() => confirmDeleteSchedule(params.data)} 
              className="bg-white text-red-500 p-2 rounded hover:bg-white">
                <Trash className="h-5 w-5" />
              </Button>
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
      <Breadcrumb  />
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
                onClick={handleCancelDelete}
                className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 transition-all duration-500 ease-in-out 
               rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteSchedule}
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
        className="ag-theme-quartz text-left"
        style={{ height: "calc(100vh - 180px)", width: "93%" }}
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
          <div className="bg-white p-6 rounded-lg shadow-lg w-[450px]">
            <h2 className="text-xl font-metropolis font-semibold mb-4">
              {editing ? "Edit Schedule" : "Add New Schedule"}</h2>
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
                    className="w-44 rounded font-metropolis text-gray-700 mt-1"
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
                    className="w-48 rounded font-metropolis text-gray-700 mt-1"
                    isSearchable={true} // Enables search functionality
                  />
                </div>

              </div>
               {/* Trainer Selector */}
               <div className="mb-3">
                <label className="block font-metropolis font-medium mb-2">Trainers <span className="text-red-500">*</span></label>
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
                  className="w-full border rounded font-metropolis text-gray-700"
                  placeholder="Select Trainers"
                  isSearchable={true} 
                />
              </div>

              {/* Start Date and Time */}
              <div className="flex gap-4 mb-4">
                <div className="w-1/2">
                  <label className="block font-metropolis font-medium mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newSchedule.startDate}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, startDate: e.target.value })
                    }
                    className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
                  />
                  {errors.StartDate && (
                    <span className="text-red-500 text-sm">
                      {errors.StartDate}
                    </span>
                  )}
                </div>
                <div className="w-1/2">
                  <label className="block font-metropolis font-medium mb-2">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    step="1"
                    value={newSchedule.startTime || ""}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, startTime: e.target.value })
                    }
                    className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
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
                  <label className="block font-metropolis font-medium mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newSchedule.endDate}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, endDate: e.target.value })
                    }
                    className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
                  />
                  {errors.EndDate && (
                    <span className="text-red-500 text-sm">
                      {errors.EndDate}
                    </span>
                  )}
                </div>
                <div className="w-1/2">
                  <label className="block font-metropolis font-medium mb-2">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    step="1"
                    value={newSchedule.endTime}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, endTime: e.target.value })
                    }
                    className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
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
                <label className="block font-metropolis font-medium mb-2">
                  Joining Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSchedule.meetingLink}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, meetingLink: e.target.value })
                  }
                  className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
                />
                {errors.MeetingLink && (
                  <span className="text-red-500 text-sm">
                    {errors.MeetingLink}
                  </span>
                )}
              </div>

              {/* Duration */}
              <div className="mb-4">
                <label className="block font-metropolis font-medium mb-2">
                  Duration (hours) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={newSchedule.duration}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, duration: parseInt(e.target.value) })
                  }
                  className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
                />
                {errors.Duration && (
                  <span className="text-red-500 text-sm">
                    {errors.Duration}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button
                  onClick={handleFormSubmit}
                  className="bg-custom-gradient-btn text-white px-4 py-2 
                transition-all duration-500 ease-in-out 
               rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
                >
                  {editing ? "Update Schedule" : "Create Schedule"}
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

//   return (
//     <div className="flex-1 p-6 mt-10 ml-16">
//       <div className="relative bg-custom-gradient text-white px-6 py-4 rounded-lg shadow-lg mb-6 w-full">
//         {/* Dropdown Button */}
//         <Button
//           className="w-80 flex justify-between items-center px-4 py-2 border bg-yellow-400"
//           onClick={toggleDropdown}
//         >
//           {selectedSchedules ? selectedSchedules: "Select Schedule"}
//           <ChevronDown className="ml-2 h-5 w-5" />
//         </Button>

//         {/* Dropdown Menu */}
//         {isDropdownOpen && (
//           <ul className="absolute w-80 border bg-white z-10 mt-1 max-h-48 overflow-auto shadow-lg text-black">
//             {/* Add New Course Option */}
//             <li
//               className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//               onClick={() => {
//                 addNewSchedule()
//                 setSelectedSchedules("+New Schedule")
//                 setIsDropdownOpen(false);
//               }}
//             >
//               + New Schedule
//             </li>

//             {/* Course List with Edit Icons */}
//             {schedules.map((schedule) => (
//               <li
//                 key={schedule.id}
//                 className="flex justify-between items-center px-4 py-2 hover:bg-gray-100"
//                 onClick={() => {
//                   setSelectedSchedules(schedule.batchName);
//                   setIsDropdownOpen(false);
//                 }}
//               >
//                 <span>{schedule.batchName}</span>
//                 <Pencil
//                   className="h-4 w-4 text-blue-500 cursor-pointer"
//                   onClick={(e) => {
//                     editSchedule(schedule);
//                     e.stopPropagation();
//                     setIsDropdownOpen(false)
//                   }}
//                 />
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//       <table className="table-auto w-full mt-4 border-collapse border border-gray-300 shadow-lg">
//         <thead>
//           <tr className="bg-gray-200 text-left text-gray-800">
//             <th className="border border-gray-300 px-4 py-2">BatchName</th>
//             <th className="border border-gray-300 px-4 py-2">ModuleName</th>
//             <th className="border border-gray-300 px-4 py-2">Trainers</th>
//             <th className="border border-gray-300 px-4 py-2">ScheduleDateTime</th>
//           </tr>
//         </thead>
//         <tbody>
//           {currentData.map((schedule) => (
//             <tr key={schedule.id} className="hover:bg-gray-100">
//               <td className="border border-gray-300 px-4 py-2">{schedule.batchName}</td>
//               <td className="border border-gray-300 px-4 py-2">{schedule.moduleName}</td>
//               <td className="border border-gray-300 px-4 py-2">{schedule.trainerName}</td>
//               <td className="border border-gray-300 px-4 py-2">{schedule.scheduleDateTime}</td>
//               {/* <td className="border border-gray-300 px-4 py-2 flex space-x-2">
//             <button
//               onClick={() => editCourse(course)}
//               className="text-blue-500 hover:text-blue-700"
//             >
//               <Edit className="inline-block w-5 h-5" />
//             </button>
//             <button
//               onClick={() => deleteCourse(course.id)}
//               className="text-red-500 hover:text-red-700"
//             >
//               <Trash className="inline-block w-5 h-5" />
//             </button>
//           </td> */}
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Pagination Controls */}
//       <div className="flex justify-center items-center mt-4">
//         <button
//           disabled={currentPage === 1}
//           onClick={() => handlePageChange(currentPage - 1)}
//           className={`px-4 py-2 rounded-l-md border bg-gray-300 text-gray-700 hover:bg-gray-400 ${currentPage === 1 && "cursor-not-allowed opacity-50"
//             }`}
//         >
//           Previous
//         </button>
//         <span className="px-4 py-2 border-t border-b text-gray-700">
//           Page {currentPage} of {totalPages}
//         </span>
//         <button
//           disabled={currentPage === totalPages}
//           onClick={() => handlePageChange(currentPage + 1)}
//           className={`px-4 py-2 rounded-r-md border bg-gray-300 text-gray-700 hover:bg-gray-400 ${currentPage === totalPages && "cursor-not-allowed opacity-50"
//             }`}
//         >
//           Next
//         </button>
//       </div>

//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-96">
//             <h2 className="text-xl font-metropolis font-semibold">{editing ? "Edit Schedule" : "Add New Schedule"}</h2>
//             <form>
//               <div className="mb-4 mt-3">
//                 <label className="block font-metropolis font-medium">Batches</label>
//                 <select
//                   className="w-full border rounded p-2 font-metropolis text-gray-700"
//                   value={newSchedule.batchId}
//                   onChange={(e) =>
//                     setNewSchedule({
//                       ...newSchedule,
//                       batchId: parseInt(e.target.value, 10),
//                     })
//                   }
//                 >
//                   <option value="">Select Batches</option>
//                   {batches.map((batch) => (
//                     <option key={batch.id} value={batch.id}>
//                       {batch.batchName}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="mb-4">
//                 <label className="block font-metropolis font-medium">Modules</label>
//                 <select
//                   className="w-full border rounded p-2 font-metropolis text-gray-700"
//                   value={newSchedule.moduleId}
//                   onChange={(e) =>
//                     setNewSchedule({
//                       ...newSchedule,
//                       moduleId: parseInt(e.target.value, 10),
//                     })
//                   }
//                 >
//                   <option value="">Select Modules</option>
//                   {modules.map((module) => (
//                     <option key={module.id} value={module.id}>
//                       {module.moduleName}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               {/* Trainer Selector */}
//               <div className="mb-4">
//                 <label className="block font-metropolis font-medium mb-2">
//                   Trainers
//                 </label>
//                 <select
//                   multiple
//                   value={(newSchedule.trainerId || []).map((id) => id.toString())}
//                   onChange={(e) => {
//                     const selectedOptions = Array.from(e.target.selectedOptions);
//                     const ids = selectedOptions.map((option) => parseInt(option.value));
//                     const names = selectedOptions.map((option) => option.text);
//                     setNewSchedule({
//                       ...newSchedule,
//                       trainerId: ids,
//                       trainerName: names
//                     });
//                   }}
//                   className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
//                 >
//                   {trainers.length === 0 ? (
//                     <option value="">No trainers available</option>
//                   ) : (
//                     <>
//                       <option value="">Select a Trainers</option>
//                       {(trainers || []).map((trainer) => (
//                         <option key={trainer.id} value={trainer.id.toString()}>
//                           {trainer.trainerName}
//                         </option>
//                       ))}
//                     </>
//                   )}
//                 </select>
//               </div>
//               {/* Duration */}
//               <div className="mb-4">
//                 <label className="block font-metropolis font-medium mb-2">
//                   Duration (hours)
//                 </label>
//                 <input
//                   type="number"
//                   value={newSchedule.duration}
//                   onChange={(e) =>
//                     setNewSchedule({ ...newSchedule, duration: parseInt(e.target.value) })
//                   }
//                   className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
//                 />
//                 {errors.endDate && (
//                   <span className="text-red-500 text-sm">
//                     {errors.Duration}
//                   </span>
//                 )}
//               </div>
//               <div className="flex space-x-4">
//                 <Button
//                   onClick={handleFormSubmit}
//                   className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//                 >
//                   {editing ? "Update Batch" : "Create Batch"}
//                 </Button>
//                 <Button
//                   onClick={handleModalClose}
//                   className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//                 >
//                   Cancel
//                 </Button>
//                 {editing && (
//                   <Button onClick={handleDeleteScheduleModule} className="bg-red-500">
//                     Delete
//                   </Button>
//                 )}
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
// export default BatchModuleScheduleTable;


// import { Button } from "../ui/button";
// import { SetStateAction, useEffect, useState } from "react";
// import { toast } from "sonner";
// import { ChevronDown, Pencil } from "lucide-react";
// import Select from 'react-select';


// import {
//   createBatchModuleScheduleApi,
//   fetchBatchModuleScheduleApi,
//   updateBatchModuleScheduleApi,
//   deleteBatchModuleScheduleApi,
// } from "@/api/batchModuleScheduleApi";
// import { fetchBatchApi } from "@/api/batchApi";
// import { fetchCourseModuleApi } from "@/api/courseModuleApi";
// import { fetchUsersApi } from "@/api/userApi";

// interface BatchModuleScheduleTableProps {
//   selectedBatch: string | null;
//   onBatchScheduleSelect: (batchName: string) => void;
// }

// interface ScheduleData {
//   id: number;
//   batchId: number;
//   batchName: string;
//   moduleId: number;
//   moduleName: string;
//   trainerId: number[];
//   trainerName: string[];
//   startDate: string;
//   startTime: string;
//   endDate: string;
//   endTime: string;
//   meetingLink: string;
//   duration: number;
// }

// interface Options {
//   id: any;
//   batchName: any;
//   moduleName: any;
//   trainerName: any;
// }

// const getToken = () => localStorage.getItem("authToken");

// const BatchModuleScheduleTable = ({ selectedBatch, onBatchScheduleSelect }: BatchModuleScheduleTableProps) => {
//   const [schedules, setSchedules] = useState<ScheduleData[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   // const [colDefs, setColDefs] = useState<ColDef[]>([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editing, setEditing] = useState(false);
//   const [batches, setBatches] = useState<Options[]>([]);
//   const [modules, setModules] = useState<Options[]>([]);
//   const [searchTerm, setSearchTerm] = useState<string>("");
//   const [trainers, setTrainers] = useState<Options[]>([]);
//   const [schedule, setSchedule] = useState<any[]>([]);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [errors] = useState<Record<string, string>>({});

//   const [selectedSchedules, setSelectedSchedules] = useState("")
//   const [newSchedule, setNewSchedule] = useState<ScheduleData>({
//     id: 0,
//     batchId: 0,
//     batchName: "",
//     moduleId: 0,
//     moduleName: "",
//     trainerId: [],
//     trainerName: [],
//     startDate: "",
//     startTime: "",
//     endDate: "",
//     endTime: "",
//     meetingLink: "",
//     duration: 0,
//   });

//   const [currentPage, setCurrentPage] = useState(1);

//   {/* pagination */ }
//   const recordsPerPage = 15;
//   const totalPages = Math.ceil(schedules.length / recordsPerPage);
//   const startIndex = (currentPage - 1) * recordsPerPage;
//   const currentData = schedules.slice(startIndex, startIndex + recordsPerPage);

//   const handlePageChange = (newPage: SetStateAction<number>) => {
//     setCurrentPage(newPage);
//   };

//   const toggleDropdown = () => {
//     setIsDropdownOpen(!isDropdownOpen);
//   };

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchTerm(e.target.value);
//   };

//   const filteredSchedules = schedule.filter((sch) =>
//     sch.batchName.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   useEffect(() => {
//     console.log("Selected batch:", selectedBatch);
//     if (selectedBatch) {
//       const filteredScheduleModule = schedules.filter(sch =>
//         sch.batchName === selectedBatch
//       );
//       console.log("Filtered CourseModules:", filteredScheduleModule);  // Check the filtered courses
//       setSchedule(filteredScheduleModule);
//     } else {
//       setSchedule(schedules);
//     }
//   }, [selectedBatch, schedules]);

//   const fetchSchedules = async () => {
//     const token = getToken();
//     if (!token) {
//       toast.error("You must be logged in to view schedules.");
//       return;
//     }

//     try {
//       const schedulesResponse = await fetchBatchModuleScheduleApi();
//       // Extract the data array
//       const schedulesData = schedulesResponse?.data || [];

//       // // Function to format time in AM/PM
//       // const formatTime = (time: string | null) => {
//       //   if (!time) return "Unknown Time";
//       //   const [hour, minute] = time.split(":").map(Number);
//       //   const period = hour >= 12 ? "PM" : "AM";
//       //   const formattedHour = hour % 12 || 12; // Convert 0 to 12 for AM/PM format
//       //   return `${formattedHour}:${minute.toString().padStart(2, "0")} ${period}`;
//       // };

//       const schedules = Array.isArray(schedulesData)
//         ? schedulesData.map((schedule: any) => ({
//           id: schedule.id,
//           batchId: schedule.batch?.id || 0,
//           batchName: schedule.batch?.batchName || "Unknown Batch",
//           moduleId: schedule.module?.id || 0,
//           moduleName: schedule.module?.moduleName || "Unknown Module",
//           trainerId: schedule.trainers ? schedule.trainers.map((trainers: any) => trainers.id) : [],
//           trainerName: schedule.trainers ? schedule.trainers.map((trainers: any) =>
//             `${trainers.firstName} ${trainers.lastName}`).join(", ") : "Unknown Trainer",
//           startDate: schedule.startDate,
//           startTime: schedule.startTime,
//           endDate: schedule.endDate,
//           endTime: schedule.endTime,
//           meetingLink: schedule.meetingLink,
//           duration: schedule.duration,
//         }))
//         : [];

//       console.log('Parsed schedules:', schedules);

//       const batchResponse = await fetchBatchApi();
//       const batches = batchResponse.map((batch: { id: any; batchName: any; }) => ({
//         id: batch.id,
//         batchName: batch.batchName,
//       }));
//       setBatches(batches);

//       const moduleResponse = await fetchCourseModuleApi();
//       const modules = moduleResponse.map((module: { id: any; moduleName: any; }) => ({
//         id: module.id,
//         moduleName: module.moduleName,
//       }));
//       setModules(modules);

//       const responseUser = await fetchUsersApi();
//       const trainers = responseUser.Users.filter(
//         (user: any) => user.role.name === "trainer"
//       ).map((trainer: any) => ({
//         id: trainer.id,
//         trainerName: `${trainer.firstName} ${trainer.lastName}`
//       }));
//       setTrainers(trainers);
//       setSchedules(schedules);

//     } catch (error) {
//       console.error("Failed to fetch schedules", error);
//       toast.error("Failed to fetch schedules. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSchedules();
//   }, []);

//   const addNewSchedule = () => {
//     setEditing(false);
//     setNewSchedule({
//       id: 0,
//       batchId: 0,
//       batchName: "",
//       moduleId: 0,
//       moduleName: "",
//       trainerId: [],
//       trainerName: [],
//       startDate: "",
//       startTime: "",
//       endDate: "",
//       endTime: "",
//       meetingLink: "",
//       duration: 0,
//     });
//     setIsModalOpen(true);
//   };

//   const editSchedule = (schedule: ScheduleData) => {
//     setEditing(true);
//     setNewSchedule({
//       id: schedule.id,
//       batchId: schedule.batchId,
//       batchName: schedule.batchName,
//       moduleId: schedule.moduleId,
//       moduleName: schedule.moduleName,
//       trainerId: schedule.trainerId,
//       trainerName: schedule.trainerName,
//       startDate: schedule.startDate,
//       startTime: schedule.startTime,
//       endDate: schedule.endDate,
//       endTime: schedule.endTime,
//       meetingLink: schedule.meetingLink,
//       duration: schedule.duration,
//     });
//     setIsModalOpen(true);
//   };


//   const handleModalClose = () => {
//     setIsModalOpen(false);
//     setNewSchedule({
//       id: 0,
//       batchId: 0,
//       batchName: "",
//       moduleId: 0,
//       moduleName: "",
//       trainerId: [],
//       trainerName: [],
//       startDate: "",
//       startTime: "",
//       endDate: "",
//       endTime: "",
//       meetingLink: "",
//       duration: 0,
//     });
//   };

//   const handleFormSubmit = async () => {
//     const token = getToken();
//     if (!token) {
//       toast.error("You must be logged in to perform this action.");
//       return;
//     }

//     // const formatTime = (time: string | null) => {
//     //   if (!time) return "Unknown Time";
//     //   const [hour, minute] = time.split(":").map(Number);
//     //   const period = hour >= 12 ? "PM" : "AM";
//     //   const formattedHour = hour % 12 || 12; // Convert 0 to 12 for AM/PM format
//     //   return `${formattedHour}:${minute.toString().padStart(2, "0")} ${period}`;
//     // };

//     try {
//       if (editing) {
//         await updateBatchModuleScheduleApi(newSchedule.id, {
//           batchId: newSchedule.batchId,
//           moduleId: newSchedule.moduleId,
//           trainerIds: newSchedule.trainerId,
//           startDate: newSchedule.startDate,
//           startTime: newSchedule.startTime,
//           endDate: newSchedule.endDate,
//           endTime: newSchedule.endTime,
//           meetingLink: newSchedule.meetingLink,
//           duration: newSchedule.duration
//         });
//         toast.success("Schedule updated successfully!");
//       } else {
//         await createBatchModuleScheduleApi({
//           batchId: newSchedule.batchId,
//           moduleId: newSchedule.moduleId,
//           trainerIds: newSchedule.trainerId,
//           startDate: newSchedule.startDate,
//           startTime: newSchedule.startTime,
//           endDate: newSchedule.endDate,
//           endTime: newSchedule.endTime,
//           meetingLink: newSchedule.meetingLink,
//           duration: newSchedule.duration
//         });
//         toast.success("BatchSchedule created successfully!")
//       }
//       fetchSchedules();
//     } catch (error) {
//       console.error("Failed to submit schedule", error);
//       toast.error("Failed to submit schedule. Please try again later.");
//     }

//     handleModalClose();
//   };

//   const handleDeleteScheduleModule = async () => {
//     const token = getToken();
//     if (!token) {
//       toast.error("You must be logged in to delete a scheduleModule.");
//       return;
//     }

//     try {
//       await deleteBatchModuleScheduleApi(newSchedule.id);
//       toast.success('Batch deleted successfully!');
//       fetchSchedules();
//       handleModalClose();
//       setLoading(true)
//     } catch (error) {
//       toast.error('Failed to delete the batch. Please try again later.');
//     }
//   }
//   return (
//     <div className="flex-1 p-6 mt-10 ml-16">
//       <div>
//         {/* Dropdown Button */}
//         <Button
//           className="w-72 flex justify-between items-center px-4 py-2 border bg-custom-gradient"
//           onClick={toggleDropdown}
//         >
//           {selectedSchedules ? selectedSchedules : "Schedule"}
//           <ChevronDown className="ml-2 h-5 w-5" />
//         </Button>

//         {/* Dropdown Menu */}
//         {isDropdownOpen && (
//           <ul className="absolute w-72 border bg-white z-10 mt-1 max-h-48 overflow-auto shadow-lg text-black">
//             {/* Search Input */}
//             <li className="px-4 py-2">
//               <input
//                 type="text"
//                 className="w-full border p-2 rounded"
//                 placeholder="Search..."
//                 value={searchTerm}
//                 onChange={handleSearchChange}
//               />
//             </li>
//             {/* Add New Course Option */}
//             <li
//               className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//               onClick={() => {
//                 addNewSchedule()
//                 setSelectedSchedules("+New Schedule")
//                 setIsDropdownOpen(false);
//               }}
//             >
//               + New Schedule
//             </li>

//             {/* Course List with Edit Icons */}
//             {filteredSchedules.map((schedule) => (
//               <li
//                 key={schedule.id}
//                 className="flex justify-between items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                 onClick={() => {
//                   onBatchScheduleSelect(schedule.batchName)
//                   setSelectedSchedules(schedule.batchName);
//                   setIsDropdownOpen(false);
//                 }}
//               >
//                 <span>{schedule.batchName}</span>
//                 <Pencil
//                   className="h-4 w-4 text-blue-500 cursor-pointer"
//                   onClick={(e) => {
//                     editSchedule(schedule);
//                     e.stopPropagation();
//                     setIsDropdownOpen(false)
//                   }}
//                 />
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//       {/* <table className="table-auto w-full mt-4 border-collapse border border-gray-300 shadow-lg">
//         <thead>
//           <tr className="bg-gray-200 text-left text-gray-800">
//             <th className="border border-gray-300 px-4 py-2">BatchName</th>
//             <th className="border border-gray-300 px-4 py-2">ModuleName</th>
//             <th className="border border-gray-300 px-4 py-2">Trainers</th>
//             <th className="border border-gray-300 px-4 py-2">StartDate</th>
//             <th className="border border-gray-300 px-4 py-2">StartTime</th>
//             <th className="border border-gray-300 px-4 py-2">endDate</th>
//             <th className="border border-gray-300 px-4 py-2">endTime</th>
//             <th className="border border-gray-300 px-4 py-2">MeetingLink</th>
//             <th className="border border-gray-300 px-4 py-2">Duration</th>
//           </tr>
//         </thead>
//         <tbody >
//           {currentData.map((schedule) => (
//             <tr key={schedule.id} className="hover:bg-gray-100">
//               <td className="border border-gray-300 px-4 py-2">{schedule.batchName}</td>
//               <td className="border border-gray-300 px-4 py-2">{schedule.moduleName}</td>
//               <td className="border border-gray-300 px-4 py-2">{schedule.trainerName}</td>
//               <td className="border border-gray-300 px-4 py-2">{schedule.startDate}</td>
//               <td className="border border-gray-300 px-4 py-2">{schedule.startTime}</td>
//               <td className="border border-gray-300 px-4 py-2">{schedule.endDate}</td>
//               <td className="border border-gray-300 px-4 py-2">{schedule.endTime}</td>
//               <td className="border border-gray-300 px-4 py-2">
//                 {schedule.meetingLink ? (
//                   <a
//                     href={schedule.meetingLink}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-500 underline"
//                   >
//                     Open Link
//                   </a>
//                 ) : (
//                   <span className="text-gray-400">No Link</span>
//                 )}
//               </td>
//               <td className="border border-gray-300 px-4 py-2">{schedule.duration}</td> */}

//               {/* <td className="border border-gray-300 px-4 py-2 flex space-x-2">
//             <button
//               onClick={() => editCourse(course)}
//               className="text-blue-500 hover:text-blue-700"
//             >
//               <Edit className="inline-block w-5 h-5" />
//             </button>
//             <button
//               onClick={() => deleteCourse(course.id)}
//               className="text-red-500 hover:text-red-700"
//             >
//               <Trash className="inline-block w-5 h-5" />
//             </button>
//           </td>  */}
//             {/* </tr>
//           ))}
//         </tbody>
//       </table> */}

//       {/* Pagination Controls */}
//       {/* <div className="flex justify-center items-center mt-4">
//         <button
//           disabled={currentPage === 1}
//           onClick={() => handlePageChange(currentPage - 1)}
//           className={`px-4 py-2 rounded-l-md border bg-gray-300 text-gray-700 hover:bg-gray-400 ${currentPage === 1 && "cursor-not-allowed opacity-50"
//             }`}
//         >
//           Previous
//         </button>
//         <span className="px-4 py-2 border-t border-b text-gray-700">
//           Page {currentPage} of {totalPages}
//         </span>
//         <button
//           disabled={currentPage === totalPages}
//           onClick={() => handlePageChange(currentPage + 1)}
//           className={`px-4 py-2 rounded-r-md border bg-gray-300 text-gray-700 hover:bg-gray-400 ${currentPage === totalPages && "cursor-not-allowed opacity-50"
//             }`}
//         >
//           Next
//         </button>
//       </div>  */}

//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-[450px]">
//             <h2 className="text-xl font-metropolis font-semibold">{editing ? "Edit Schedule" : "Add New Schedule"}</h2>
//             <form>
//               <div className="flex gap-4 mb-2 mt-2">
//                 <div className="w-1/2">
//                   <label className="block font-metropolis font-medium">Batches</label>
//                   <Select
//                     options={batches.map((batch) => ({
//                       value: batch.id,
//                       label: batch.batchName,
//                     }))}
//                     value={
//                       newSchedule.batchId
//                         ? {
//                           value: newSchedule.batchId,
//                           label: batches.find((batch) => batch.id === newSchedule.batchId)?.batchName,
//                         }
//                         : null
//                     }
//                     onChange={(selectedOption) => {
//                       setNewSchedule({
//                         ...newSchedule,
//                         batchId: selectedOption ? selectedOption.value : 0, // Default to 0 or an appropriate number if null
//                       });
//                     }}
//                     className="w-40 rounded font-metropolis text-gray-700 mt-1"
//                     placeholder="Select Batch"
//                     isSearchable={true}
//                   />
//                 </div>

//                 <div>
//                   <label className="block font-metropolis font-medium">Modules</label>
//                   <Select
//                     options={modules.map((module) => ({
//                       value: module.id,
//                       label: module.moduleName,
//                     }))}
//                     value={
//                       newSchedule.moduleId
//                         ? {
//                           value: newSchedule.moduleId,
//                           label: modules.find((module) => module.id === newSchedule.moduleId)?.moduleName,
//                         }
//                         : null
//                     }
//                     onChange={(selectedOption) =>
//                       setNewSchedule({
//                         ...newSchedule,
//                         moduleId: selectedOption ? selectedOption.value : 0, // Default to 0 if nothing is selected
//                       })
//                     }
//                     placeholder="Select Module"
//                     className="w-56 rounded font-metropolis text-gray-700 mt-1"
//                     isSearchable={true} // Enables search functionality
//                   />
//                 </div>

//               </div>
//               {/* Trainer Selector */}
//               <div className="mb-3">
//                 <label className="block font-metropolis font-medium mb-2">Trainers</label>
//                 <Select
//                   isMulti
//                   options={trainers.map((trainer) => ({
//                     value: trainer.id,
//                     label: trainer.trainerName,
//                   }))}
//                   value={newSchedule.trainerId.map((id) => ({
//                     value: id,
//                     label: trainers.find((trainer) => trainer.id === id)?.trainerName,
//                   }))}
//                   onChange={(selectedOptions) => {
//                     const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
//                     const selectedNames = selectedOptions ? selectedOptions.map(option => option.label) : [];
//                     setNewSchedule({
//                       ...newSchedule,
//                       trainerId: selectedIds,
//                       trainerName: selectedNames,
//                     });
//                   }}
//                   className="w-full border rounded font-metropolis text-gray-700"
//                   placeholder="Select Trainers"
//                   isSearchable={true} // Enables search functionality
//                 />
//               </div>
//               <div className="flex gap-4 mb-4">
//                 <div className="w-1/2">
//                   <label className="block font-metropolis font-medium mb-2">
//                     StartDate
//                   </label>
//                   <input
//                     type="date"
//                     value={newSchedule.startDate}
//                     onChange={(e) =>
//                       setNewSchedule({ ...newSchedule, startDate: e.target.value })
//                     }
//                     className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
//                   />
//                   {errors.StartDate && (
//                     <span className="text-red-500 text-sm">
//                       {errors.StartDate}
//                     </span>
//                   )}
//                 </div>
//                 <div className="w-1/2">
//                   <label className="block font-metropolis font-medium mb-2">
//                     StartTime
//                   </label>
//                   <input
//                     type="time"
//                     value={newSchedule.startTime || ""}
//                     onChange={(e) =>
//                       setNewSchedule({ ...newSchedule, startTime: e.target.value })
//                     }
//                     className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
//                   />
//                   {errors.StartTime && (
//                     <span className="text-red-500 text-sm">
//                       {errors.StartTime}
//                     </span>
//                   )}
//                 </div>
//               </div>

//               <div className="flex gap-4 mb-4">
//                 <div className="w-1/2">
//                   <label className="block font-metropolis font-medium mb-2">
//                     EndDate
//                   </label>
//                   <input
//                     type="date"
//                     value={newSchedule.endDate}
//                     onChange={(e) =>
//                       setNewSchedule({ ...newSchedule, endDate: e.target.value })
//                     }
//                     className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
//                   />
//                   {errors.EndDate && (
//                     <span className="text-red-500 text-sm">
//                       {errors.EndDate}
//                     </span>
//                   )}
//                 </div>
//                 <div className="w-1/2">
//                   <label className="block font-metropolis font-medium mb-2">
//                     EndTime
//                   </label>
//                   <input
//                     type="time"
//                     value={newSchedule.endTime}
//                     onChange={(e) =>
//                       setNewSchedule({ ...newSchedule, endTime: e.target.value })
//                     }
//                     className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
//                   />
//                   {errors.EndTime && (
//                     <span className="text-red-500 text-sm">
//                       {errors.EndTime}
//                     </span>
//                   )}
//                 </div>
//               </div>
//               <div className="mb-4">
//                 <label className="block font-metropolis font-medium mb-2">
//                   MeetingLink
//                 </label>
//                 <input
//                   type="text"
//                   value={newSchedule.meetingLink}
//                   onChange={(e) =>
//                     setNewSchedule({ ...newSchedule, meetingLink: e.target.value })
//                   }
//                   className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
//                 />
//                 {errors.MeetingLink && (
//                   <span className="text-red-500 text-sm">
//                     {errors.MeetingLink}
//                   </span>
//                 )}
//               </div>
//               {/* Duration */}
//               <div className="mb-4">
//                 <label className="block font-metropolis font-medium mb-2">
//                   Duration (hours)
//                 </label>
//                 <input
//                   type="number"
//                   value={newSchedule.duration}
//                   onChange={(e) =>
//                     setNewSchedule({ ...newSchedule, duration: parseInt(e.target.value) })
//                   }
//                   className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
//                 />
//                 {errors.Duration && (
//                   <span className="text-red-500 text-sm">
//                     {errors.Duration}
//                   </span>
//                 )}
//               </div>
//               <div className="flex space-x-4">
//                 <Button
//                   onClick={handleFormSubmit}
//                   className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//                 >
//                   {editing ? "Update Batch" : "Create Batch"}
//                 </Button>
//                 <Button
//                   onClick={handleModalClose}
//                   className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//                 >
//                   Cancel
//                 </Button>
//                 {editing && (
//                   <Button onClick={handleDeleteScheduleModule} className="bg-red-500">
//                     Delete
//                   </Button>
//                 )}
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
// export default BatchModuleScheduleTable;