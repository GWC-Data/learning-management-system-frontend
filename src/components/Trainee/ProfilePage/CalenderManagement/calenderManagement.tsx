// import React, { useEffect, useState } from "react";
// import moment from "moment";
// import { toast } from "sonner";
// import { fetchBatchIdByTraineeIdApi } from "@/helpers/api/batchTrainee";
// import { fetchBatchByIdApi } from "@/helpers/api/batchApi";
// import { fetchBatchClassScheduleByBatchIdApi } from "@/helpers/api/batchClassScheduleApi";
// import { fetchUsersbyIdApi } from "@/helpers/api/userApi";
// import { useNavigate } from "react-router-dom";
// import { fetchClassForModuleByModuleIdApi } from "@/helpers/api/classForModuleApi";
// import { getAttendanceByUserIdApi } from "@/helpers/api/attendance";

// interface CalendarEvent {
//   title: string;
//   start: Date;
//   end: Date;
//   meetingLink?: string;
//   batchId: number;
//   trainers: string;
//   duration: number;
//   module: string;
//   startTime: string;
//   endTime: string;
//   startDateModule: string;
//   endDateModule: string;
//   classId: number;
//   classDate: Date;
//   classDescription: string;
//   classRecordedLink: string;
//   classTitle: string;
//   classAssignId: number;
//   isPastEvent?: boolean;
//   attendance?: boolean;
// }

// interface ClassItem {
//   id: number;
//   classId: number;
//   classDate: string;
//   classDescription: string;
//   classRecordedLink: string;
//   classTitle: string;
//   classAssignId: number;
// }

// interface AssignmentEvent {
//   title: string;
//   start: Date;
//   end: Date;
//   batchId: number;
//   trainer: string;
//   assignmentFile: string;
//   id: number;
//   batchName: string;
//   classId: number | string;
//   moduleName: string;
//   assignCompletionId?: string;
//   assignmentTraineeId?: string;
//   obtainedPercentage?: number;
// }

// interface Assignment {
//   id: number;
//   courseAssignmentQuestionFile: string;
//   courseAssignmentQuestionName: string;
//   trainerId: string;
//   trainer: string;
//   assignStartDate: Date;
//   assignEndDate: Date;
// }

// interface BatchFilter {
//   id: number;
//   name: string;
// }

// const Calendar: React.FC = () => {
//   const [events, setEvents] = useState<CalendarEvent[]>([]);
//   const [assignments, setAssignments] = useState<AssignmentEvent[]>([]);
//   const [currentDate, setCurrentDate] = useState(moment()); // Using a single date instead of a week
//   const [showModal, setShowModal] = useState(false);
//   const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
//     null
//   );

//   const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>(
//     []
//   );
//   const [trainerNames, setTrainerNames] = useState<Record<string, string>>({});

//   const [batchFilters, setBatchFilters] = useState<BatchFilter[]>([]);
//   const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [selectedAssignmentId, setSelectedAssignmentId] = useState<
//     number | null
//   >(null);
//   const [batchName, setBatchName] = useState("");
//   const userId = localStorage.getItem("userId");

//   useEffect(() => {
//     fetchBatchesData();
//   }, []);

//   const getToken = () => localStorage.getItem("authToken");

//   const navigate = useNavigate();

//   const getUserId = () => {
//     const token = getToken();
//     if (token) {
//       const userId = localStorage.getItem("userId");
//       return userId;
//     }
//     return null;
//   };

//   const fetchBatchesData = async () => {
//     const token = getToken();
//     const userId = getUserId();

//     if (!token || userId === null) {
//       toast.error("You must be logged in to view batches.");
//       return;
//     }

//     try {
//       console.log("userId", userId);
//       const BatchIds = await fetchBatchIdByTraineeIdApi(String(userId));
//       console.log("BatchIds", BatchIds);

//       const attendanceStatus = await getAttendanceByUserIdApi(String(userId));
//       console.log("attendanceStatus", attendanceStatus);
//       console.log(
//         "Full attendance data structure:",
//         JSON.stringify(attendanceStatus, null, 2)
//       );
//       // Check the first item to understand its structure
//       if (attendanceStatus && attendanceStatus.length > 0) {
//         console.log(
//           "First attendance record properties:",
//           Object.keys(attendanceStatus[0])
//         );
//         console.log(
//           "First attendance record values:",
//           Object.values(attendanceStatus[0])
//         );
//       }

//       if (BatchIds.length === 0) {
//         toast.error("No batches found for this trainee.");
//         return;
//       }

//       const courseDetails: CalendarEvent[] = [];
//       const assignmentDetails: AssignmentEvent[] = [];
//       const filters: BatchFilter[] = [];

//       for (const id of BatchIds) {
//         const batchData = await fetchBatchByIdApi(id);
//         console.log("Batch Data", batchData);
//         console.log("batchNamee", batchData.batchName);
//         setBatchName(batchData.batchName);

//         const batchStart = moment(batchData.startDate);
//         const batchEnd = moment(batchData.endDate);
//         console.log("valuee", batchStart, batchEnd, String(id));

//         const modules = await fetchBatchClassScheduleByBatchIdApi(id);
//         console.log("Modules for Batch", id, modules);

//         const moduleIds = modules.map((module: any) => module.moduleId);
//         console.log("Module IDs", moduleIds);

//         // Fetch classes for each moduleId
//         const classDataArray = await Promise.all(
//           moduleIds.map((moduleId: any) =>
//             fetchClassForModuleByModuleIdApi(moduleId)
//           )
//         );

//         console.log("All Class Data:", classDataArray);

//         const assignmentData: Assignment[] =
//           await fetchCourseAssignmentbybatchIdApi(id);
//         console.log("Assignment Data", assignmentData);

//         let lastModuleEnd = batchStart.clone();

//         // Process module schedules
//         if (modules && Array.isArray(modules)) {
//           modules.forEach((module) => {
//             const moduleStart = moment(module.startDate);
//             console.log(moduleStart, "moduleStart");
//             const moduleEnd = moment(module.endDate);

//             // Find classes for the current module by moduleId
//             const currentModuleClasses: ClassItem[] =
//               classDataArray
//                 .find((classes: any) =>
//                   classes.some((c: any) => c.moduleId === module.moduleId)
//                 )
//                 ?.map(
//                   (classItem: any): ClassItem => ({
//                     classId: classItem?.classId,
//                     // Extract value property if classDate is an object, or use as is
//                     classDate:
//                       classItem?.classDate?.value || classItem?.classDate || "",
//                     classDescription: classItem?.classDescription || "",
//                     classRecordedLink: classItem?.classRecordedLink || "",
//                     classTitle: classItem?.classTitle || "",
//                     classAssignId: classItem?.assignmentId,
//                     id: 0,
//                   })
//                 ) || [];

//             console.log(
//               currentModuleClasses,
//               "Classes for Module",
//               module.module.moduleName
//             );

//             while (moduleStart.isSameOrBefore(moduleEnd)) {
//               const classesForDate = currentModuleClasses.filter((classItem) =>
//                 moment(classItem.classDate).isSame(moduleStart, "day")
//               );

//               console.log(classesForDate, "classesForDate");

//               classesForDate.forEach((classItem) => {
//                 if (moduleStart.day() !== 0) {
//                   // Find this section in your code (around line 280-300)
//                   const attendanceData = attendanceStatus.find(
//                     (att: any) =>
//                       String(att.classId) === String(classItem.classId)
//                   );

//                   // Log for debugging
//                   console.log(`Looking for classId: ${classItem.classId}`);
//                   console.log(`Attendance found:`, attendanceData);

//                   // Ensure attendance is converted to a boolean
//                   let attendance;
//                   if (attendanceData) {
//                     // Convert "true" or "false" strings to boolean if necessary
//                     if (typeof attendanceData.attendance === "string") {
//                       attendance =
//                         attendanceData.attendance.toLowerCase() === "true";
//                       console.log(
//                         `String attendance converted to:`,
//                         attendance
//                       );
//                     } else {
//                       attendance = Boolean(attendanceData.attendance);
//                       console.log(
//                         `Non-string attendance converted to:`,
//                         attendance
//                       );
//                     }
//                   }

//                   // Make sure to explicitly set it to undefined if no attendance data is found
//                   else {
//                     attendance = undefined;
//                     console.log(
//                       `No attendance data found, setting to undefined`
//                     );
//                   }

//                   courseDetails.push({
//                     title: batchData.batchName,
//                     module: module.module.moduleName,
//                     start: moduleStart.toDate(),
//                     end: moduleStart.clone().endOf("day").toDate(),
//                     startTime: module.startTime,
//                     endTime: module.endTime,
//                     startDateModule: module.startDate,
//                     endDateModule: module.endDate,
//                     meetingLink: module.meetingLink,
//                     batchId: id,
//                     trainers: module.trainers
//                       .map(
//                         (trainer: any) =>
//                           trainer.firstName + " " + trainer.lastName
//                       )
//                       .join(", "),
//                     duration: module.duration,
//                     isPastEvent: moment(moduleStart).isBefore(moment(), "day"),
//                     classId: classItem.classId,
//                     classDate: new Date(classItem.classDate),
//                     classDescription: classItem.classDescription,
//                     classRecordedLink: classItem.classRecordedLink,
//                     classTitle: classItem.classTitle,
//                     classAssignId: classItem.classAssignId,
//                     // Set attendance with proper boolean conversion
//                     attendance: attendance,
//                   });
//                 }
//               });
//               lastModuleEnd = moduleStart.clone();
//               moduleStart.add(1, "day");
//             }
//           });
//         }
//         console.log("coursedetails", courseDetails);

//         // Process course assignments based on classes
//         if (courseDetails && Array.isArray(courseDetails)) {
//           courseDetails.forEach((classEvent) => {
//             // Find the assignment for the current class using assignmentId
//             const matchingAssignment = assignmentData.find(
//               (assignment) => assignment.id === classEvent.classAssignId
//             );

//             console.log("matchingAssignment", matchingAssignment);
//             console.log("attendanceStatus", attendanceStatus);

//             if (matchingAssignment) {
//               // Find assignment completion data for this assignment
//               const assignmentCompletionData = attendanceStatus.find(
//                 (att: any) => {
//                   console.log("haha", att.assignmentClassId); // This will log each assignmentClassId while iterating
//                   console.log("hehe", classEvent.classId);
//                   return att.assignmentClassId === classEvent.classId;
//                 }
//               );

//               console.log("assignmentCompletionData", assignmentCompletionData);
//               assignmentDetails.push({
//                 batchName: batchData.batchName,
//                 id: matchingAssignment.id,
//                 title: matchingAssignment.courseAssignmentQuestionName,
//                 start:
//                   typeof matchingAssignment.assignStartDate === "object" &&
//                   matchingAssignment.assignStartDate !== null &&
//                   "value" in matchingAssignment.assignStartDate
//                     ? new Date(String(matchingAssignment.assignStartDate.value)) // Cast value to string
//                     : classEvent.classDate,
//                 end:
//                   typeof matchingAssignment.assignEndDate === "object" &&
//                   matchingAssignment.assignEndDate !== null &&
//                   "value" in matchingAssignment.assignEndDate
//                     ? new Date(String(matchingAssignment.assignEndDate.value)) // Cast value to string
//                     : classEvent.classDate,
//                 batchId: id,
//                 trainer: String(matchingAssignment.trainerId), // Convert to string explicitly
//                 assignmentFile: matchingAssignment.courseAssignmentQuestionFile,
//                 classId: classEvent.classId,
//                 moduleName: classEvent.module,
//                 // Add assignment completion data
//                 assignCompletionId:
//                   assignmentCompletionData?.assignCompletionId,
//                 assignmentTraineeId:
//                   assignmentCompletionData?.assignmentTraineeId,
//                 obtainedPercentage:
//                   assignmentCompletionData?.obtainedPercentage,
//               });
//             }
//           });
//         }

//         console.log("courseassignments", assignmentDetails);

//         // Ensure events continue until batch end date
//         while (lastModuleEnd.isBefore(batchEnd)) {
//           lastModuleEnd.add(1, "day");
//           if (lastModuleEnd.day() !== 0) {
//             courseDetails.push({
//               title: batchData.batchName + " (No Module Scheduled)",
//               module: "No Module",
//               start: lastModuleEnd.toDate(),
//               end: lastModuleEnd.clone().endOf("day").toDate(),
//               startTime: "",
//               endTime: "",
//               startDateModule: "",
//               endDateModule: "",
//               meetingLink: "",
//               batchId: id,
//               trainers: "No Trainers Assigned",
//               duration: 0,
//               isPastEvent: false,
//               classId: 0,
//               classDate: new Date(),
//               classDescription: "",
//               classRecordedLink: "",
//               classTitle: "",
//               classAssignId: 0,
//               attendance: undefined,
//             });
//           }
//         }

//         filters.push({ id, name: batchData.batchName });
//       }

//       console.log("Processed Assignment Details:", assignmentDetails);

//       setEvents(courseDetails);
//       setAssignments(assignmentDetails);
//       setBatchFilters(filters);
//       setSelectedBatch(BatchIds[0]); // Select the first batch by default
//     } catch (error) {
//       toast.error("Error fetching batch schedule.");
//       console.error(error);
//     }
//   };

//   // Build 3 days instead of a week
//   const buildCalendarDays = () => {
//     const days = [];
//     // Get today and the next 2 days (for a total of 3 days)
//     for (let i = 0; i < 3; i++) {
//       days.push(moment(currentDate).add(i, "days"));
//     }
//     return days;
//   };

//   const getEventsForDay = (day: moment.Moment) => {
//     if (day.day() === 0 || selectedBatch === null) return [];
//     console.log("events", events);

//     console.log(
//       "filter",
//       events.filter((event) => moment(day).isSame(event.start, "day"))
//     );
//     return events.filter((event) => moment(day).isSame(event.start, "day"));
//   };

//   const getAssignmentsForDay = (day: moment.Moment) => {
//     if (day.day() === 0 || selectedBatch === null) return [];

//     // console.log("Checking assignments for:", day.format("YYYY-MM-DD"));
//     console.log("All Assignments:", assignments);

//     console.log(
//       "assign",
//       assignments.filter((assignment) =>
//         moment(day).isSame(assignment.start, "day")
//       )
//     );
//     return assignments.filter((assignment) =>
//       moment(day).isSame(assignment.start, "day")
//     );
//   };

//   const handleDayClick = (event: CalendarEvent) => {
//     if (event) {
//       console.log("calendar", event);

//       setSelectedEvent(event);
//       setShowModal(true);
//     } else {
//       toast.info("No events scheduled for this day.");
//     }
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setSelectedDayEvents([]);
//     setSelectedEvent(null);
//   };

//   // Change the date range by 3 days instead of a week
//   const changeDays = (offset: number) => {
//     setCurrentDate(moment(currentDate).add(offset * 3, "days"));
//   };

//   const fetchTrainerNames = async (trainerId: string) => {
//     if (trainerId in trainerNames) return; // Skip fetching if already cached

//     try {
//       const trainer = await fetchUsersbyIdApi(trainerId); // API Call
//       console.log("Fetched Trainer:", trainer);

//       setTrainerNames((prev) => ({
//         ...prev,
//         [trainerId]: `${trainer.firstName} ${trainer.lastName}`,
//       }));
//     } catch (error) {
//       console.error("Error fetching trainer name:", error);
//     }
//   };

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     if (event.target.files) {
//       const file = event.target.files[0];
//       setSelectedFile(file);

//       const reader = new FileReader();
//       reader.onload = () => {
//         const base64String = reader.result as string;
//         console.log("Base64 String:", base64String);
//       };
//       reader.onerror = (error) => {
//         console.error("Error converting file to Base64:", error);
//       };

//       reader.readAsDataURL(file); // Converts the file to a Base64 string
//     }
//   };

//   useEffect(() => {
//     assignments.forEach((assignment) => {
//       fetchTrainerNames(String(assignment.trainer)); // Fetch trainer for each assignment
//     });
//   }, [assignments]);

//   return (
//     <div className="h-[700px] p-4">
//       <div className="bg-white shadow-lg rounded-lg overflow-hidden w-[1290px]">
//         {/* Calendar Header */}
//         <div className="p-4 flex justify-between items-center bg-[#6e2b8b] text-white">
//           <button
//             onClick={() => changeDays(-1)}
//             className="px-4 py-2 rounded hover:bg-white hover:text-black"
//           >
//             Previous 3 Days
//           </button>
//           <h2 className="text-xl font-bold">
//             {currentDate.format("MMM D")} -{" "}
//             {currentDate.clone().add(2, "days").format("MMM D, YYYY")}
//           </h2>
//           <button
//             onClick={() => changeDays(1)}
//             className="px-4 py-2 rounded hover:bg-white hover:text-black"
//           >
//             Next 3 Days
//           </button>
//         </div>

//         {/* Calendar Days Header - Only 3 columns now */}
//         <div className="grid grid-cols-3 gap-px bg-gray-200">
//           {buildCalendarDays().map((day, index) => (
//             <div
//               key={index}
//               className="bg-[#FAF2FD] hover:bg-white p-2 text-center font-semibold"
//             >
//               {day.format("ddd")}
//             </div>
//           ))}
//         </div>

//         {/* Calendar Grid - Only 3 columns now */}
//         <div className="grid grid-cols-3 gap-px bg-gray-200 h-[calc(75vh-80px)]">
//           {buildCalendarDays().map((day, index) => {
//             const dayEvents = getEventsForDay(day); // Get module events
//             console.log("dayEvents", dayEvents);
//             const dayAssignments = getAssignmentsForDay(day); // Get assignments
//             console.log("dayAssignments", dayAssignments);
//             const isSunday = day.day() === 0;
//             const isPastDay = day.isBefore(moment(), "day");
//             const isToday = day.isSame(moment(), "day");

//             return (
//               <div
//                 key={index}
//                 className={`min-h-[200px] p-2 transition-colors ${
//                   isToday ? "bg-gray-50" : "bg-white"
//                 } ${isSunday ? "bg-gray-100" : "hover:bg-gray-200"} ${
//                   isPastDay ? "bg-gray-50" : ""
//                 }`}
//               >
//                 {/* Display Date */}
//                 <div
//                   className={`font-semibold text-sm mb-1 ${isToday ? "text-[#6E2B8B]" : ""}`}
//                 >
//                   {day.format("D")}
//                 </div>

//                 <div className="max-h-[2000px] overflow-hidden">
//                   {/* === MODULES LIST (EVENTS) === */}
//                   {dayEvents.length > 0 &&
//                     dayEvents.some((event) => event.module !== "No Module") && (
//                       <div className="mb-2">
//                         <div className="text-lg font-semibold text-[#6E2B8B] mb-1 mt-5">
//                           Module
//                         </div>

//                         {dayEvents.map((event, eventIndex) => {
//                           if (event.module === "No Module") return null; // ✅ Skip rendering No Module events

//                           const isPastEvent = moment(event.start).isBefore(
//                             moment(),
//                             "day"
//                           );

//                           console.log("isPastEvent", isPastEvent);

//                           // Debug the actual attendance value
//                           console.log(
//                             `Event ${eventIndex} attendance:`,
//                             event.attendance,
//                             typeof event.attendance
//                           );

//                           // Determine background color based on attendance status
//                           let bgColor = "bg-[#FAF2FD] hover:bg-[#d5afe3]"; // Default color
//                           if (isPastEvent) {
//                             // More robust checking of attendance value
//                             if (event.attendance === true) {
//                               bgColor = "bg-green-200 hover:bg-green-300"; // Green for attended
//                               console.log(
//                                 "Setting GREEN background for event:",
//                                 event.classId
//                               );
//                             } else if (event.attendance === false) {
//                               bgColor = "bg-red-200 hover:bg-red-300"; // Red for absent
//                               console.log(
//                                 "Setting RED background for event:",
//                                 event.classId
//                               );
//                             } else {
//                               bgColor = "bg-gray-200 hover:bg-gray-300"; // Gray for no attendance data
//                               console.log(
//                                 "Setting GRAY background for event:",
//                                 event.classId
//                               );
//                             }
//                           }

//                           return (
//                             <div
//                               key={`event-${eventIndex}`}
//                               onClick={() => handleDayClick(event)}
//                               className={`text-sm p-2 mb-4 mt-4 ml-4 mr-4 rounded w-[380px]  cursor-pointer ${bgColor}`}
//                             >
//                               {/* <div className="font-medium text-lg">
//                                 {event.title}
//                               </div> */}
//                               <div className="font-medium text-lg">
//                                 {event.module}
//                               </div>
//                               <div className="text-sm">
//                                 {event.startTime} - {event.endTime}
//                               </div>

//                               {/* Display attendance status directly for debugging */}
//                               {isPastEvent && (
//                                 <div className="text-sm mt-1 grid grid-cols-[auto,1fr] gap-x-1">
//                                   <strong className="text-[#6E2B8B]">
//                                     Status:
//                                   </strong>
//                                   <span>
//                                     {event.attendance === true
//                                       ? "Present"
//                                       : event.attendance === false
//                                         ? "Absent"
//                                         : "Unknown"}
//                                   </span>
//                                 </div>
//                               )}
//                             </div>
//                           );
//                         })}
//                       </div>
//                     )}

//                   {/* === ASSIGNMENTS LIST === */}
//                   {dayAssignments.length > 0 && (
//                     <div>
//                       <div className="text-lg font-semibold text-[#6E2B8B] ml-1 mb-4 mt-14">
//                         Assignment
//                       </div>
//                       {dayAssignments.map((assignment, assignmentIndex) => {
//                         // // Check if the assignment is in the past
//                         const isPastAssignment = moment(
//                           assignment.start
//                         ).isBefore(moment(), "day");

//                         // Determine background color based on completion status
//                         let bgColor = "bg-yellow-200 hover:bg-yellow-300"; // Default color for not completed

//                         if (assignment.assignCompletionId) {
//                           bgColor = "bg-blue-200 hover:bg-blue-300"; // Blue for completed assignments

//                           // If there's a grade, show green instead
//                           if (assignment.obtainedPercentage !== undefined) {
//                             bgColor = "bg-green-200 hover:bg-green-300"; // Green for graded assignments
//                           }
//                         }

//                         console.log("isPastAssignment", isPastAssignment);
//                         console.log("assignment", assignment.start);
//                         console.log(assignment, "assigg");

//                         return (
//                           <div
//                             key={`assignment-${assignmentIndex}`}
//                             className={`mb-4 mt-4 ml-4 mr-4 rounded cursor-pointer h-[180px] ${bgColor} w-[380px] relative`}
//                           >
//                             <a
//                               href={`http://localhost:5173/#/trainee/enrolledCourses/${encodeURIComponent(assignment.batchName.toLowerCase())}#/${encodeURIComponent(assignment.moduleName)}?classId=${encodeURIComponent(assignment.classId)}`}
//                               className="inline-block px-2 py-2 rounded-lg"
//                             >
//                               {/* Assignment Title */}
//                               <div className="font-semibold text-lg">
//                                 {assignment.title}
//                               </div>

//                               {/* Optional: If you want to display the trainer name */}
//                               <div className="text-sm">
//                                 <div className="grid grid-cols-[auto,1fr] text-sm mt-1">
//                                   <strong className="text-[#6E2B8B]">
//                                     Trainer:&nbsp;
//                                   </strong>
//                                   <p className="text-gray-600">
//                                     {trainerNames[assignment.trainer] ||
//                                       "Loading..."}
//                                   </p>
//                                 </div>
//                               </div>

//                               <div className="text-sm text-gray-600">
//                                 <div className="grid grid-cols-[auto,1fr] gap-x-1">
//                                   <strong className="text-[#6E2B8B] ">
//                                     Start:
//                                   </strong>
//                                   <span>
//                                     {moment(assignment.start).format(
//                                       "MMMM D, YYYY"
//                                     )}
//                                   </span>
//                                 </div>
//                                 <div className="grid grid-cols-[auto,1fr] gap-x-1 mt-1">
//                                   <strong className="text-[#6E2B8B] ">
//                                     End:
//                                   </strong>
//                                   <span>
//                                     {moment(assignment.end).format(
//                                       "MMMM D, YYYY"
//                                     )}
//                                   </span>
//                                 </div>
//                               </div>
//                             </a>

//                             {/* Show obtained percentage if available */}
//                             {assignment.obtainedPercentage !== undefined && (
//                               <div className="text-green-700 px-2 py-1 rounded-full text-sm font-bold">
//                                 Obtained Marks: {assignment.obtainedPercentage}%
//                               </div>
//                             )}
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* Event Modal */}
//         {showModal && selectedEvent && (
//           <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-6">
//             <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md transform transition-all scale-95 hover:scale-100">
//               <div className="flex justify-between items-start mb-4">
//                 <div className="flex flex-col">
//                   <h2 className="text-xl font-semibold text-gray-800">
//                     {selectedEvent.title}
//                   </h2>
//                 </div>
//                 <button
//                   onClick={handleCloseModal}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   <span className="text-2xl">×</span>
//                 </button>
//               </div>

//               <div className="space-y-4">
//                 <div className="bg-[#FAF2FD] p-4 rounded-lg">
//                   <p className="text-sm text-gray-600 mb-2">
//                     <span className="font-semibold">Module:</span>{" "}
//                     {selectedEvent.module}
//                   </p>
//                   <p className="text-sm text-gray-600 mb-2">
//                     <span className="font-semibold">Trainer:</span>{" "}
//                     {selectedEvent.trainers}
//                   </p>
//                   <p className="text-sm text-gray-600 mb-2">
//                     <span className="font-semibold">Date:</span>{" "}
//                     {moment(selectedEvent.start).format("MMMM D, YYYY")}
//                   </p>
//                   <p className="text-sm text-gray-600 mb-2">
//                     <span className="font-semibold">Start Time:</span>{" "}
//                     {selectedEvent.startTime}
//                   </p>
//                   <p className="text-sm text-gray-600 mb-2">
//                     <span className="font-semibold">End Time:</span>{" "}
//                     {selectedEvent.endTime}
//                   </p>
//                   <p className="text-sm text-gray-600 mb-2">
//                     <span className="font-semibold">Duration:</span>{" "}
//                     {selectedEvent.duration + " minutes"}
//                   </p>

//                   <p className="text-sm text-gray-600 mb-2">
//                     <span className="font-semibold">Class Title:</span>{" "}
//                     {selectedEvent.classTitle}
//                   </p>
//                   <p className="text-sm text-gray-600 mb-2">
//                     <span className="font-semibold">Description:</span>{" "}
//                     {selectedEvent.classDescription}
//                   </p>

//                   {/* Add attendance status if available */}
//                   {selectedEvent.isPastEvent && (
//                     <p className="text-sm text-gray-600 mb-2">
//                       <span className="font-semibold">Attendance:</span>{" "}
//                       <span
//                         className={
//                           selectedEvent.attendance === true
//                             ? "text-green-600"
//                             : selectedEvent.attendance === false
//                               ? "text-red-600"
//                               : "text-gray-600"
//                         }
//                       >
//                         {selectedEvent.attendance === true
//                           ? "Present"
//                           : selectedEvent.attendance === false
//                             ? "Absent"
//                             : "Not recorded"}
//                       </span>
//                     </p>
//                   )}

//                   {selectedEvent.isPastEvent ? (
//                     <a
//                       href={`http://localhost:5173/#/trainee/enrolledCourses/${encodeURIComponent(selectedEvent.title.toLowerCase())}#/${encodeURIComponent(selectedEvent.module)}?classId=${encodeURIComponent(selectedEvent.classId)}`}
//                       className="inline-block text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm text-center w-full bg-green-500 hover:bg-green-600"
//                     >
//                       Watch Recording
//                     </a>
//                   ) : (
//                     <a
//                       href={selectedEvent.meetingLink}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="inline-block text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm text-center w-full bg-[#6e2b8b] hover:bg-[#9a5eb5]"
//                     >
//                       Join Meeting
//                     </a>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Calendar;

// // import React, { useEffect, useState } from "react";
// // import moment from "moment";
// // import { toast } from "sonner";
// // import { fetchBatchIdByTraineeIdApi } from "@/helpers/api/batchTrainee";
// // import { fetchBatchByIdApi } from "@/helpers/api/batchApi";
// // import { fetchBatchModuleScheduleByBatchIdApi } from "@/helpers/api/batchModuleScheduleApi";
// // import { fetchCourseAssignmentbybatchIdApi } from "@/helpers/api/courseAssignmentApi";
// // import { fetchUsersbyIdApi } from "@/helpers/api/userApi";
// // import { createAssignmentCompletionsApi } from "@/helpers/api/assignmentCompletionsApi";
// // import { useNavigate } from "react-router-dom";
// // import { fetchClassForModuleByModuleIdApi } from "@/helpers/api/classForModuleApi";
// // import { getAttendanceByUserIdApi } from "@/helpers/api/attendance";

// // interface CalendarEvent {
// //   title: string;
// //   start: Date;
// //   end: Date;
// //   meetingLink?: string;
// //   batchId: number;
// //   trainers: string;
// //   duration: number;
// //   module: string;
// //   startTime: string;
// //   endTime: string;
// //   startDateModule: string;
// //   endDateModule: string;
// //   classId: number;
// //   classDate: Date;
// //   classDescription: string;
// //   classRecordedLink: string;
// //   classTitle: string;
// //   classAssignId: number;
// //   isPastEvent?: boolean;
// //   attendance?: boolean;
// // }

// // interface ClassItem {
// //   id: number;
// //   classId: number;
// //   classDate: string;
// //   classDescription: string;
// //   classRecordedLink: string;
// //   classTitle: string;
// //   classAssignId: number;
// // }

// // interface AssignmentEvent {
// //   title: string;
// //   start: Date;
// //   end: Date;
// //   batchId: number;
// //   trainer: string;
// //   assignmentFile: string;
// //   id: number;
// //   batchName: string;
// //   classId: number | string;
// //   moduleName: string;
// //   assignCompletionId?: string;
// //   assignmentTraineeId?: string;
// //   obtainedPercentage?: number;
// // }

// // interface Assignment {
// //   id: number;
// //   courseAssignmentQuestionFile: string;
// //   courseAssignmentQuestionName: string;
// //   trainerId: string;
// //   trainer: string;
// //   assignStartDate: Date;
// //   assignEndDate: Date;
// // }

// // interface BatchFilter {
// //   id: number;
// //   name: string;
// // }

// // const Calendar: React.FC = () => {
// //   const [events, setEvents] = useState<CalendarEvent[]>([]);
// //   const [assignments, setAssignments] = useState<AssignmentEvent[]>([]);
// //   const [currentWeek, setCurrentWeek] = useState(moment().startOf("week"));
// //   const [showModal, setShowModal] = useState(false);
// //   const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
// //     null
// //   );

// //   const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>(
// //     []
// //   );
// //   const [trainerNames, setTrainerNames] = useState<Record<string, string>>({});

// //   const [batchFilters, setBatchFilters] = useState<BatchFilter[]>([]);
// //   const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
// //   const [selectedFile, setSelectedFile] = useState<File | null>(null);
// //   const [selectedAssignmentId, setSelectedAssignmentId] = useState<
// //     number | null
// //   >(null);
// //   const [batchName, setBatchName] = useState("");
// //   const userId = localStorage.getItem("userId");

// //   useEffect(() => {
// //     fetchBatchesData();
// //   }, []);

// //   const getToken = () => localStorage.getItem("authToken");

// //   const navigate = useNavigate();

// //   const getUserId = () => {
// //     const token = getToken();
// //     if (token) {
// //       const userId = localStorage.getItem("userId");
// //       return userId;
// //     }
// //     return null;
// //   };

// //   const fetchBatchesData = async () => {
// //     const token = getToken();
// //     const userId = getUserId();

// //     if (!token || userId === null) {
// //       toast.error("You must be logged in to view batches.");
// //       return;
// //     }

// //     try {
// //       console.log("userId", userId);
// //       const BatchIds = await fetchBatchIdByTraineeIdApi(String(userId));
// //       console.log("BatchIds", BatchIds);

// //       const attendanceStatus = await getAttendanceByUserIdApi(String(userId));
// //       console.log("attendanceStatus", attendanceStatus);
// //       console.log(
// //         "Full attendance data structure:",
// //         JSON.stringify(attendanceStatus, null, 2)
// //       );
// //       // Check the first item to understand its structure
// //       if (attendanceStatus && attendanceStatus.length > 0) {
// //         console.log(
// //           "First attendance record properties:",
// //           Object.keys(attendanceStatus[0])
// //         );
// //         console.log(
// //           "First attendance record values:",
// //           Object.values(attendanceStatus[0])
// //         );
// //       }

// //       if (BatchIds.length === 0) {
// //         toast.error("No batches found for this trainee.");
// //         return;
// //       }

// //       const courseDetails: CalendarEvent[] = [];
// //       const assignmentDetails: AssignmentEvent[] = [];
// //       const filters: BatchFilter[] = [];

// //       for (const id of BatchIds) {
// //         const batchData = await fetchBatchByIdApi(id);
// //         console.log("Batch Data", batchData);
// //         console.log("batchNamee", batchData.batchName);
// //         setBatchName(batchData.batchName);

// //         const batchStart = moment(batchData.startDate);
// //         const batchEnd = moment(batchData.endDate);
// //         console.log("valuee", batchStart, batchEnd, String(id));

// //         const modules = await fetchBatchModuleScheduleByBatchIdApi(id);
// //         console.log("Modules for Batch", id, modules);

// //         const moduleIds = modules.map((module: any) => module.moduleId);
// //         console.log("Module IDs", moduleIds);

// //         // Fetch classes for each moduleId
// //         const classDataArray = await Promise.all(
// //           moduleIds.map((moduleId: any) =>
// //             fetchClassForModuleByModuleIdApi(moduleId)
// //           )
// //         );

// //         console.log("All Class Data:", classDataArray);

// //         const assignmentData: Assignment[] =
// //           await fetchCourseAssignmentbybatchIdApi(id);
// //         console.log("Assignment Data", assignmentData);

// //         let lastModuleEnd = batchStart.clone();

// //         // Process module schedules
// //         if (modules && Array.isArray(modules)) {
// //           modules.forEach((module) => {
// //             const moduleStart = moment(module.startDate);
// //             console.log(moduleStart, "moduleStart");
// //             const moduleEnd = moment(module.endDate);

// //             // Find classes for the current module by moduleId
// //             const currentModuleClasses: ClassItem[] =
// //               classDataArray
// //                 .find((classes: any) =>
// //                   classes.some((c: any) => c.moduleId === module.moduleId)
// //                 )
// //                 ?.map(
// //                   (classItem: any): ClassItem => ({
// //                     classId: classItem?.classId,
// //                     // Extract value property if classDate is an object, or use as is
// //                     classDate:
// //                       classItem?.classDate?.value || classItem?.classDate || "",
// //                     classDescription: classItem?.classDescription || "",
// //                     classRecordedLink: classItem?.classRecordedLink || "",
// //                     classTitle: classItem?.classTitle || "",
// //                     classAssignId: classItem?.assignmentId,
// //                     id: 0,
// //                   })
// //                 ) || [];

// //             console.log(
// //               currentModuleClasses,
// //               "Classes for Module",
// //               module.module.moduleName
// //             );

// //             while (moduleStart.isSameOrBefore(moduleEnd)) {
// //               const classesForDate = currentModuleClasses.filter((classItem) =>
// //                 moment(classItem.classDate).isSame(moduleStart, "day")
// //               );

// //               console.log(classesForDate, "classesForDate");

// //               classesForDate.forEach((classItem) => {
// //                 if (moduleStart.day() !== 0) {
// //                   // Find this section in your code (around line 280-300)
// //                   const attendanceData = attendanceStatus.find(
// //                     (att: any) =>
// //                       String(att.classId) === String(classItem.classId)
// //                   );

// //                   // Log for debugging
// //                   console.log(`Looking for classId: ${classItem.classId}`);
// //                   console.log(`Attendance found:`, attendanceData);

// //                   // Ensure attendance is converted to a boolean
// //                   let attendance;
// //                   if (attendanceData) {
// //                     // Convert "true" or "false" strings to boolean if necessary
// //                     if (typeof attendanceData.attendance === "string") {
// //                       attendance =
// //                         attendanceData.attendance.toLowerCase() === "true";
// //                       console.log(
// //                         `String attendance converted to:`,
// //                         attendance
// //                       );
// //                     } else {
// //                       attendance = Boolean(attendanceData.attendance);
// //                       console.log(
// //                         `Non-string attendance converted to:`,
// //                         attendance
// //                       );
// //                     }
// //                   }

// //                   // Make sure to explicitly set it to undefined if no attendance data is found
// //                   else {
// //                     attendance = undefined;
// //                     console.log(
// //                       `No attendance data found, setting to undefined`
// //                     );
// //                   }

// //                   courseDetails.push({
// //                     title: batchData.batchName,
// //                     module: module.module.moduleName,
// //                     start: moduleStart.toDate(),
// //                     end: moduleStart.clone().endOf("day").toDate(),
// //                     startTime: module.startTime,
// //                     endTime: module.endTime,
// //                     startDateModule: module.startDate,
// //                     endDateModule: module.endDate,
// //                     meetingLink: module.meetingLink,
// //                     batchId: id,
// //                     trainers: module.trainers
// //                       .map(
// //                         (trainer: any) =>
// //                           trainer.firstName + " " + trainer.lastName
// //                       )
// //                       .join(", "),
// //                     duration: module.duration,
// //                     isPastEvent: moment(moduleStart).isBefore(moment(), "day"),
// //                     classId: classItem.classId,
// //                     classDate: new Date(classItem.classDate),
// //                     classDescription: classItem.classDescription,
// //                     classRecordedLink: classItem.classRecordedLink,
// //                     classTitle: classItem.classTitle,
// //                     classAssignId: classItem.classAssignId,
// //                     // Set attendance with proper boolean conversion
// //                     attendance: attendance,
// //                   });
// //                 }
// //               });
// //               lastModuleEnd = moduleStart.clone();
// //               moduleStart.add(1, "day");
// //             }
// //           });
// //         }
// //         console.log("coursedetails", courseDetails);

// //         // Process course assignments based on classes
// //         if (courseDetails && Array.isArray(courseDetails)) {
// //           courseDetails.forEach((classEvent) => {
// //             // Find the assignment for the current class using assignmentId
// //             const matchingAssignment = assignmentData.find(
// //               (assignment) => assignment.id === classEvent.classAssignId
// //             );

// //             console.log("matchingAssignment", matchingAssignment);
// //             console.log("attendanceStatus", attendanceStatus);

// //             if (matchingAssignment) {
// //               // Find assignment completion data for this assignment
// //               const assignmentCompletionData = attendanceStatus.find(
// //                 (att: any) => {
// //                   console.log("haha", att.assignmentClassId); // This will log each assignmentClassId while iterating
// //                   console.log("hehe", classEvent.classId);
// //                   return att.assignmentClassId === classEvent.classId;
// //                 }
// //               );

// //               console.log("assignmentCompletionData", assignmentCompletionData);
// //               assignmentDetails.push({
// //                 batchName: batchData.batchName,
// //                 id: matchingAssignment.id,
// //                 title: matchingAssignment.courseAssignmentQuestionName,
// //                 start:
// //                   typeof matchingAssignment.assignStartDate === "object" &&
// //                   matchingAssignment.assignStartDate !== null &&
// //                   "value" in matchingAssignment.assignStartDate
// //                     ? new Date(String(matchingAssignment.assignStartDate.value)) // Cast value to string
// //                     : classEvent.classDate,
// //                 end:
// //                   typeof matchingAssignment.assignEndDate === "object" &&
// //                   matchingAssignment.assignEndDate !== null &&
// //                   "value" in matchingAssignment.assignEndDate
// //                     ? new Date(String(matchingAssignment.assignEndDate.value)) // Cast value to string
// //                     : classEvent.classDate,
// //                 batchId: id,
// //                 trainer: String(matchingAssignment.trainerId), // Convert to string explicitly
// //                 assignmentFile: matchingAssignment.courseAssignmentQuestionFile,
// //                 classId: classEvent.classId,
// //                 moduleName: classEvent.module,
// //                 // Add assignment completion data
// //                 assignCompletionId:
// //                   assignmentCompletionData?.assignCompletionId,
// //                 assignmentTraineeId:
// //                   assignmentCompletionData?.assignmentTraineeId,
// //                 obtainedPercentage:
// //                   assignmentCompletionData?.obtainedPercentage,
// //               });
// //             }
// //           });
// //         }

// //         console.log("courseassignments", assignmentDetails);

// //         // Ensure events continue until batch end date
// //         while (lastModuleEnd.isBefore(batchEnd)) {
// //           lastModuleEnd.add(1, "day");
// //           if (lastModuleEnd.day() !== 0) {
// //             courseDetails.push({
// //               title: batchData.batchName + " (No Module Scheduled)",
// //               module: "No Module",
// //               start: lastModuleEnd.toDate(),
// //               end: lastModuleEnd.clone().endOf("day").toDate(),
// //               startTime: "",
// //               endTime: "",
// //               startDateModule: "",
// //               endDateModule: "",
// //               meetingLink: "",
// //               batchId: id,
// //               trainers: "No Trainers Assigned",
// //               duration: 0,
// //               isPastEvent: false,
// //               classId: 0,
// //               classDate: new Date(),
// //               classDescription: "",
// //               classRecordedLink: "",
// //               classTitle: "",
// //               classAssignId: 0,
// //               attendance: undefined,
// //             });
// //           }
// //         }

// //         filters.push({ id, name: batchData.batchName });
// //       }

// //       console.log("Processed Assignment Details:", assignmentDetails);

// //       setEvents(courseDetails);
// //       setAssignments(assignmentDetails);
// //       setBatchFilters(filters);
// //       setSelectedBatch(BatchIds[0]); // Select the first batch by default
// //     } catch (error) {
// //       toast.error("Error fetching batch schedule.");
// //       console.error(error);
// //     }
// //   };

// //   const buildCalendarDays = () => {
// //     const startDay = moment(currentWeek).startOf("week");
// //     const days = [];

// //     for (let i = 0; i < 7; i++) {
// //       days.push(startDay.clone().add(i, "days"));
// //     }

// //     return days;
// //   };

// //   const getEventsForDay = (day: moment.Moment) => {
// //     if (day.day() === 0 || selectedBatch === null) return [];
// //     console.log("events", events);

// //     console.log(
// //       "filter",
// //       events.filter((event) => moment(day).isSame(event.start, "day"))
// //     );
// //     return events.filter((event) => moment(day).isSame(event.start, "day"));
// //   };

// //   const getAssignmentsForDay = (day: moment.Moment) => {
// //     if (day.day() === 0 || selectedBatch === null) return [];

// //     // console.log("Checking assignments for:", day.format("YYYY-MM-DD"));
// //     console.log("All Assignments:", assignments);

// //     console.log(
// //       "assign",
// //       assignments.filter((assignment) =>
// //         moment(day).isSame(assignment.start, "day")
// //       )
// //     );
// //     return assignments.filter((assignment) =>
// //       moment(day).isSame(assignment.start, "day")
// //     );
// //   };

// //   const handleDayClick = (event: CalendarEvent) => {
// //     if (event) {
// //       console.log("calendar", event);

// //       setSelectedEvent(event);
// //       setShowModal(true);
// //     } else {
// //       toast.info("No events scheduled for this day.");
// //     }
// //   };

// //   const handleCloseModal = () => {
// //     setShowModal(false);
// //     setSelectedDayEvents([]);
// //     setSelectedEvent(null);
// //   };

// //   const changeWeek = (offset: number) => {
// //     setCurrentWeek(moment(currentWeek).add(offset, "weeks"));
// //   };

// //     // Change the date range by 3 days instead of a week
// //     // const changeDays = (offset: number) => {
// //     //   setCurrentDate(moment(currentDate).add(offset * 3, "days"));
// //     // };

// //   const fetchTrainerNames = async (trainerId: string) => {
// //     if (trainerId in trainerNames) return; // Skip fetching if already cached

// //     try {
// //       const trainer = await fetchUsersbyIdApi(trainerId); // API Call
// //       console.log("Fetched Trainer:", trainer);

// //       setTrainerNames((prev) => ({
// //         ...prev,
// //         [trainerId]: `${trainer.firstName} ${trainer.lastName}`,
// //       }));
// //     } catch (error) {
// //       console.error("Error fetching trainer name:", error);
// //     }
// //   };

// //   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
// //     if (event.target.files) {
// //       const file = event.target.files[0];
// //       setSelectedFile(file);

// //       const reader = new FileReader();
// //       reader.onload = () => {
// //         const base64String = reader.result as string;
// //         console.log("Base64 String:", base64String);
// //       };
// //       reader.onerror = (error) => {
// //         console.error("Error converting file to Base64:", error);
// //       };

// //       reader.readAsDataURL(file); // Converts the file to a Base64 string
// //     }
// //   };

// //   useEffect(() => {
// //     assignments.forEach((assignment) => {
// //       fetchTrainerNames(String(assignment.trainer)); // Fetch trainer for each assignment
// //     });
// //   }, [assignments]);

// //   return (
// //     <div className="h-[700px] p-4">
// //       <div className="bg-white shadow-lg rounded-lg overflow-hidden w-[1390px]">
// //         {/* Calendar Header */}
// //         <div className="p-4 flex justify-between items-center bg-[#6e2b8b] text-white">
// //           <button
// //             onClick={() => changeWeek(-1)}
// //             className="px-4 py-2 rounded hover:bg-white hover:text-black"
// //           >
// //             Previous Week
// //           </button>
// //           <h2 className="text-xl font-bold">
// //             {currentWeek.format("MMM D")} -{" "}
// //             {currentWeek.clone().endOf("week").format("MMM D, YYYY")}
// //           </h2>
// //           <button
// //             onClick={() => changeWeek(1)}
// //             className="px-4 py-2 rounded hover:bg-white hover:text-black"
// //           >
// //             Next Week
// //           </button>
// //         </div>

// //         {/* Calendar Days Header */}
// //         <div className="grid grid-cols-7 gap-px bg-gray-200">
// //           {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
// //             <div
// //               key={day}
// //               className="bg-[#FAF2FD] hover:bg-white p-2 text-center font-semibold"
// //             >
// //               {day}
// //             </div>
// //           ))}
// //         </div>

// //         {/* Calendar Grid */}
// //         <div className="grid grid-cols-7 gap-px bg-gray-200 h-[calc(75vh-80px)]">
// //           {buildCalendarDays().map((day, index) => {
// //             const dayEvents = getEventsForDay(day); // Get module events
// //             console.log("dayEvents", dayEvents);
// //             const dayAssignments = getAssignmentsForDay(day); // Get assignments
// //             console.log("dayAssignments", dayAssignments);
// //             const isSunday = day.day() === 0;
// //             const isPastDay = day.isBefore(moment(), "day");
// //             const isToday = day.isSame(moment(), "day");

// //             return (
// //               <div
// //                 key={index}
// //                 className={`min-h-[200px] p-2 transition-colors ${
// //                   isToday ? "bg-gray-50" : "bg-white"
// //                 } ${isSunday ? "bg-gray-100" : "hover:bg-gray-200"} ${
// //                   isPastDay ? "bg-gray-50" : ""
// //                 }`}
// //               >
// //                 {/* Display Date */}
// //                 <div
// //                   className={`font-semibold text-sm mb-1 ${isToday ? "text-[#6E2B8B]" : ""}`}
// //                 >
// //                   {day.format("D")}
// //                 </div>

// //                 <div className="max-h-[2000px] overflow-hidden">
// //                   {/* === MODULES LIST (EVENTS) === */}
// //                   {dayEvents.length > 0 &&
// //                     dayEvents.some((event) => event.module !== "No Module") && (
// //                       <div className="mb-2">
// //                         <div className="text-xs font-bold text-[#6E2B8B] mb-1 mt-5">
// //                           Modules
// //                         </div>

// //                         {dayEvents.map((event, eventIndex) => {
// //                           if (event.module === "No Module") return null; // ✅ Skip rendering No Module events

// //                           const isPastEvent = moment(event.start).isBefore(
// //                             moment(),
// //                             "day"
// //                           );

// //                           console.log('isPastEvent',isPastEvent)

// //                           // Debug the actual attendance value
// //                           console.log(
// //                             `Event ${eventIndex} attendance:`,
// //                             event.attendance,
// //                             typeof event.attendance
// //                           );

// //                           // Determine background color based on attendance status
// //                           let bgColor = "bg-[#FAF2FD] hover:bg-[#d5afe3]"; // Default color
// //                           if (isPastEvent) {
// //                             // More robust checking of attendance value
// //                             if (event.attendance === true) {
// //                               bgColor = "bg-green-200 hover:bg-green-300"; // Green for attended
// //                               console.log(
// //                                 "Setting GREEN background for event:",
// //                                 event.classId
// //                               );
// //                             } else if (event.attendance === false) {
// //                               bgColor = "bg-red-200 hover:bg-red-300"; // Red for absent
// //                               console.log(
// //                                 "Setting RED background for event:",
// //                                 event.classId
// //                               );
// //                             } else {
// //                               bgColor = "bg-gray-200 hover:bg-gray-300"; // Gray for no attendance data
// //                               console.log(
// //                                 "Setting GRAY background for event:",
// //                                 event.classId
// //                               );
// //                             }
// //                           }

// //                           return (
// //                             <div
// //                               key={`event-${eventIndex}`}
// //                               onClick={() => handleDayClick(event)}
// //                               className={`text-xs p-2 mb-1 rounded cursor-pointer ${bgColor}`}
// //                             >
// //                               <div className="font-semibold">{event.title}</div>
// //                               <div>
// //                                 {event.startTime} - {event.endTime}
// //                               </div>
// //                               <div className="truncate">{event.module}</div>
// //                               {/* Display attendance status directly for debugging */}
// //                               {isPastEvent && (
// //                                 <div className="text-xs mt-1">
// //                                   Status:{" "}
// //                                   {event.attendance === true
// //                                     ? "Present"
// //                                     : event.attendance === false
// //                                       ? "Absent"
// //                                       : "Unknown"}
// //                                 </div>
// //                               )}
// //                             </div>
// //                           );
// //                         })}
// //                       </div>
// //                     )}

// //                   {/* === ASSIGNMENTS LIST === */}
// //                   {dayAssignments.length > 0 && (
// //                     <div>
// //                       <div className="text-xs font-bold text-yellow-700 mb-1 mt-10">
// //                         Assignments
// //                       </div>
// //                       {dayAssignments.map((assignment, assignmentIndex) => {
// //                         // // Check if the assignment is in the past
// //                         const isPastAssignment = moment(
// //                           assignment.start
// //                         ).isBefore(moment(), "day");

// //                         // Determine background color based on completion status
// //                         let bgColor = "bg-yellow-200 hover:bg-yellow-300"; // Default color for not completed

// //                         if (assignment.assignCompletionId) {
// //                           bgColor = "bg-blue-200 hover:bg-blue-300"; // Blue for completed assignments

// //                           // If there's a grade, show green instead
// //                           if (assignment.obtainedPercentage !== undefined) {
// //                             bgColor = "bg-green-200 hover:bg-green-300"; // Green for graded assignments
// //                           }
// //                         }

// //                         console.log("isPastAssignment", isPastAssignment);
// //                         console.log("assignment", assignment.start);
// //                         console.log(assignment, "assigg");

// //                         return (
// //                           <div
// //                             key={`assignment-${assignmentIndex}`}
// //                             className={`text-xs mb-1 rounded cursor-pointer ${bgColor} w-[210px] relative`}
// //                           >
// //                             <a
// //                               href={`http://localhost:5173/#/trainee/enrolledCourses/${encodeURIComponent(assignment.batchName.toLowerCase())}#/${encodeURIComponent(assignment.moduleName)}?classId=${encodeURIComponent(assignment.classId)}`}
// //                               className="inline-block px-2 py-2 rounded-lg"
// //                             >
// //                               {/* Assignment Title */}
// //                               <div className="font-semibold">
// //                                 {assignment.title}
// //                               </div>

// //                               {/* Optional: If you want to display the trainer name */}
// //                               <div className="text-sm text-gray-600">
// //                                 <strong>Trainer: </strong>
// //                                 {trainerNames[assignment.trainer] ||
// //                                   "Loading..."}
// //                               </div>

// //                               <div className="text-sm text-gray-600">
// //                                 <strong>Start: </strong>
// //                                 {moment(assignment.start).format(
// //                                   "MMMM D, YYYY"
// //                                 )}
// //                               </div>
// //                               <div className="text-sm text-gray-600">
// //                                 <strong>End: </strong>
// //                                 {moment(assignment.end).format("MMMM D, YYYY")}
// //                               </div>
// //                             </a>

// //                             {/* Show obtained percentage if available */}
// //                             {assignment.obtainedPercentage !== undefined && (
// //                               <div className="text-green-700 px-2 py-1 rounded-full text-xs font-bold">
// //                                 Obtained Marks:{" "}
// //                                 {assignment.obtainedPercentage}%
// //                               </div>
// //                             )}
// //                           </div>
// //                         );
// //                       })}
// //                     </div>
// //                   )}
// //                 </div>
// //               </div>
// //             );
// //           })}
// //         </div>

// //         {/* Event Modal */}
// //         {showModal && selectedEvent && (
// //           <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-6">
// //             <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md transform transition-all scale-95 hover:scale-100">
// //               <div className="flex justify-between items-start mb-4">
// //                 <div className="flex flex-col">
// //                   <h2 className="text-2xl font-semibold text-gray-800">
// //                     {selectedEvent.title}
// //                   </h2>
// //                 </div>
// //                 <button
// //                   onClick={handleCloseModal}
// //                   className="text-gray-500 hover:text-gray-700"
// //                 >
// //                   <span className="text-2xl">×</span>
// //                 </button>
// //               </div>

// //               <div className="space-y-4">
// //                 <div className="bg-[#FAF2FD] p-4 rounded-lg">
// //                   <p className="text-sm text-gray-600 mb-2">
// //                     <span className="font-semibold">Module:</span>{" "}
// //                     {selectedEvent.module}
// //                   </p>
// //                   <p className="text-sm text-gray-600 mb-2">
// //                     <span className="font-semibold">Trainer:</span>{" "}
// //                     {selectedEvent.trainers}
// //                   </p>
// //                   <p className="text-sm text-gray-600 mb-2">
// //                     <span className="font-semibold">Date:</span>{" "}
// //                     {moment(selectedEvent.start).format("MMMM D, YYYY")}
// //                   </p>
// //                   <p className="text-sm text-gray-600 mb-2">
// //                     <span className="font-semibold">Start Time:</span>{" "}
// //                     {selectedEvent.startTime}
// //                   </p>
// //                   <p className="text-sm text-gray-600 mb-2">
// //                     <span className="font-semibold">End Time:</span>{" "}
// //                     {selectedEvent.endTime}
// //                   </p>
// //                   <p className="text-sm text-gray-600 mb-2">
// //                     <span className="font-semibold">Duration:</span>{" "}
// //                     {selectedEvent.duration + " minutes"}
// //                   </p>

// //                   <p className="text-sm text-gray-600 mb-2">
// //                     <span className="font-semibold">Class Title:</span>{" "}
// //                     {selectedEvent.classTitle}
// //                   </p>
// //                   <p className="text-sm text-gray-600 mb-2">
// //                     <span className="font-semibold">Description:</span>{" "}
// //                     {selectedEvent.classDescription}
// //                   </p>

// //                   {/* Add attendance status if available */}
// //                   {selectedEvent.isPastEvent && (
// //                     <p className="text-sm text-gray-600 mb-2">
// //                       <span className="font-semibold">Attendance:</span>{" "}
// //                       <span
// //                         className={
// //                           selectedEvent.attendance === true
// //                             ? "text-green-600"
// //                             : selectedEvent.attendance === false
// //                               ? "text-red-600"
// //                               : "text-gray-600"
// //                         }
// //                       >
// //                         {selectedEvent.attendance === true
// //                           ? "Present"
// //                           : selectedEvent.attendance === false
// //                             ? "Absent"
// //                             : "Not recorded"}
// //                       </span>
// //                     </p>
// //                   )}

// //                   {selectedEvent.isPastEvent ? (
// //                     <a
// //                       href={`http://localhost:5173/#/trainee/enrolledCourses/${encodeURIComponent(selectedEvent.title.toLowerCase())}#/${encodeURIComponent(selectedEvent.module)}?classId=${encodeURIComponent(selectedEvent.classId)}`}
// //                       className="inline-block text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm text-center w-full bg-green-500 hover:bg-green-600"
// //                     >
// //                       Watch Recording
// //                     </a>
// //                   ) : (
// //                     <a
// //                       href={selectedEvent.meetingLink}
// //                       target="_blank"
// //                       rel="noopener noreferrer"
// //                       className="inline-block text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm text-center w-full bg-[#6e2b8b] hover:bg-[#9a5eb5]"
// //                     >
// //                       Join Meeting
// //                     </a>
// //                   )}
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default Calendar;
