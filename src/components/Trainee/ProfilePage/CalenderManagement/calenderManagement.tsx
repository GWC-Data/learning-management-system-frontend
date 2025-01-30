// import React, { useEffect, useState } from "react";
// import moment from "moment";
// import { toast } from "sonner";
// import { fetchBatchIdByTraineeIdApi } from "@/api/batchTrainee";
// import { fetchBatchByIdApi } from "@/api/batchApi";
// import { fetchBatchModuleScheduleByBatchIdApi } from "@/api/batchModuleScheduleApi";

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
// }

// interface BatchFilter {
//   id: number;
//   name: string;
// }

// const Calendar: React.FC = () => {
//   const [events, setEvents] = useState<CalendarEvent[]>([]);
//   const [currentMonth, setCurrentMonth] = useState(moment());
//   const [showModal, setShowModal] = useState(false);
//   const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
//     null
//   );
//   const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>(
//     []
//   );

//   const [batchFilters, setBatchFilters] = useState<BatchFilter[]>([]);
//   const [selectedBatch, setSelectedBatch] = useState<number | null>(null);

//   useEffect(() => {
//     fetchBatchesData();
//   }, []);

//   const getToken = () => localStorage.getItem("authToken");

//   const getUserId = () => {
//     const token = getToken();
//     if (token) {
//       const userId = localStorage.getItem("userId");
//       return userId ? parseInt(userId, 10) : null;
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
//       const BatchIds = await fetchBatchIdByTraineeIdApi(userId);
//       console.log("BatchIds", BatchIds);

//       if (BatchIds.length === 0) {
//         toast.error("No batches found for this trainee.");
//         return;
//       }

//       const courseDetails: CalendarEvent[] = [];
//       const filters: BatchFilter[] = [];

//       for (const id of BatchIds) {
//         const data = await fetchBatchByIdApi(id);
//         console.log("dataa", data);

//         // Create an array of dates between start and end
//         const startDate = moment(data.startDate);
//         const endDate = moment(data.endDate);
//         const dates = [];
//         let current = startDate.clone();

//         while (current.isSameOrBefore(endDate)) {
//           if (current.day() !== 0) {
//             // Skip events on Sundays
//             dates.push(current.clone());
//           }
//           current.add(1, "day");
//         }

//         const modules = await fetchBatchModuleScheduleByBatchIdApi(id);

//         console.log("modules", modules); // Log the modules to inspect its structure

//         if (modules) {
//           // Assuming modules.batchModuleSchedule is a single object, not an array
//           const batchSchedule = modules;
//           console.log("data", batchSchedule);

//           // Handling single module data structure
//           // courseDetails.push({
//           //   title: batchSchedule.module.moduleName, // Extract moduleName
//           //   start: new Date(batchSchedule.startDate + " " + batchSchedule.startTime),
//           //   end: new Date(batchSchedule.endDate + " " + batchSchedule.endTime),
//           //   meetingLink: batchSchedule.meetingLink,
//           //   batchId: id,
//           //   duration: batchSchedule.duration,
//           //   trainers: batchSchedule.trainers.map((trainer: any) => trainer.firstName).join(", "), // Join multiple trainers' names if needed
//           // });

//           // Loop over the dates to create events
//           dates.forEach((date) => {
//             courseDetails.push({
//               title: data.batchName,
//               module: batchSchedule.module.moduleName, // Extract moduleName
//               start: date.toDate(),
//               end: date.clone().endOf("day").toDate(),
//               startTime: batchSchedule.startTime,
//               endTime: batchSchedule.endTime,

//               meetingLink: batchSchedule.meetingLink, // Use the meeting link from batchSchedule
//               batchId: id,
//               trainers: batchSchedule.trainers
//                 .map(
//                   (trainer: any) => trainer.firstName + " " + trainer.lastName
//                 )
//                 .join(", "),
//               duration: batchSchedule.duration,
//             });
//           });

//           console.log(courseDetails, "cd");
//         }

//         filters.push({ id, name: data.batchName });
//       }

//       setEvents(courseDetails);
//       setBatchFilters(filters);
//       setSelectedBatch(BatchIds[0]); // Default to the first batch
//     } catch (error) {
//       toast.error("Error fetching batch schedule.");
//       console.error(error);
//     }
//   };

//   const buildCalendarDays = () => {
//     const startDay = moment(currentMonth).startOf("month").startOf("week");
//     const endDay = moment(currentMonth).endOf("month").endOf("week");
//     const days = [];
//     let day = startDay.clone();

//     while (day.isSameOrBefore(endDay)) {
//       days.push(day.clone());
//       day.add(1, "day");
//     }

//     return days;
//   };

//   const getEventsForDay = (day: moment.Moment) => {
//     if (day.day() === 0 || selectedBatch === null) return []; // No events on Sundays

//     return events.filter((event) => moment(day).isSame(event.start, "day"));
//   };

//   const handleDayClick = (event: any) => {
//     if (event) {
//       setSelectedDayEvents(event);
//       setSelectedEvent(event); // Optionally set the first event for the modal
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

//   const changeMonth = (offset: number) => {
//     setCurrentMonth(moment(currentMonth).add(offset, "months"));
//   };

//   const selectBatch = (batchId: number) => {
//     setSelectedBatch(batchId);
//   };

//   return (
//     <div className="h-screen bg-gradient-to-r from-green-100 to-green-300 p-4">
//       <div className="bg-white shadow-lg rounded-lg overflow-hidden">
//         <div className="p-4 flex justify-between items-center bg-green-600 text-white">
//           <button
//             onClick={() => changeMonth(-1)}
//             className="px-4 py-2 rounded hover:bg-green-700"
//           >
//             Previous
//           </button>
//           <h2 className="text-xl font-bold">
//             {currentMonth.format("MMMM YYYY")}
//           </h2>
//           <button
//             onClick={() => changeMonth(1)}
//             className="px-4 py-2 rounded hover:bg-green-700"
//           >
//             Next
//           </button>
//         </div>

//         <div className="grid grid-cols-7 gap-px bg-gray-200">
//           {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
//             <div
//               key={day}
//               className="bg-green-50 hover:bg-white p-2 text-center font-semibold"
//             >
//               {day}
//             </div>
//           ))}
//         </div>

//         <div className="grid grid-cols-7 gap-px bg-gray-200">
//           {buildCalendarDays().map((day, index) => {
//             const dayEvents = getEventsForDay(day);
//             const isCurrentMonth = day.month() === currentMonth.month();
//             const isSunday = day.day() === 0;
//             const isPastDay = day.isBefore(moment(), "day"); // Check if the day is in the past

//             return (
//               <div
//                 key={index}
//                 className={`min-h-[100px] p-2 transition-colors ${
//                   isCurrentMonth ? "bg-white" : "bg-gray-50"
//                 } ${isSunday ? "bg-gray-100" : "hover:bg-green-50"} cursor-pointer`}
//               >
//                 <div className="font-semibold text-sm mb-1">
//                   {day.format("D")}
//                 </div>
//                 <div className="max-h-24 overflow-y-auto">
//                   {dayEvents.map((event, eventIndex) => {
//                     const isPastEvent = moment(event.start).isBefore(
//                       moment(),
//                       "day"
//                     );

//                     return (
//                       <div
//                         key={eventIndex}
//                         onClick={() => handleDayClick(event)}
//                         className={`text-xs p-1 mb-1 rounded truncate ${
//                           isPastEvent
//                             ? "line-through text-gray-400 cursor-not-allowed"
//                             : "bg-green-100 hover:bg-green-300"
//                         }`}
//                         style={isPastEvent ? { pointerEvents: "none" } : {}}
//                       >
//                         {event.title}
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {showModal && selectedEvent && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-6">
//           <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md transform transition-all scale-95 hover:scale-100">
//             <div className="flex justify-between items-start mb-4">
//               <div className="flex flex-col">
//                 <h2 className="text-2xl font-semibold text-gray-800">
//                   {selectedEvent.title}
//                 </h2>
//               </div>

//               <button
//                 onClick={handleCloseModal}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <span className="text-2xl">×</span>
//               </button>
//             </div>

//             <div className="space-y-4">
//               <div className="bg-green-50 p-4 rounded-lg">
//                 <p className="text-sm text-gray-600 mb-2">
//                   <span className="font-semibold">Module:</span>{" "}
//                   {selectedEvent.module}
//                 </p>
//                 <p className="text-sm text-gray-600 mb-2">
//                   <span className="font-semibold">Trainer:</span>{" "}
//                   {selectedEvent.trainers}
//                 </p>

//                 <p className="text-sm text-gray-600 mb-2">
//                   <span className="font-semibold">Date:</span>{" "}
//                   {moment(selectedEvent.start).format("MMMM D, YYYY")}
//                 </p>
//                 <p className="text-sm text-gray-600 mb-2">
//                   <span className="font-semibold">Start Time:</span>{" "}
//                   {selectedEvent.startTime}
//                 </p>
//                 <p className="text-sm text-gray-600 mb-2">
//                   <span className="font-semibold">End Time:</span>{" "}
//                   {selectedEvent.endTime}
//                 </p>
//                 <p className="text-sm text-gray-600 mb-2">
//                   <span className="font-semibold">Duration:</span>{" "}
//                   {selectedEvent.duration + " minutes"}
//                 </p>
//                 {selectedEvent.meetingLink && (
//                   <div className="mt-4">
//                     <a
//                       href={selectedEvent.meetingLink}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg  
//                           hover:bg-green-700 transition-colors duration-200 text-sm text-center w-full"
//                     >
//                       Join Meeting
//                     </a>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Calendar;

import React, { useEffect, useState } from "react";
import moment from "moment";
import { toast } from "sonner";
import { fetchBatchIdByTraineeIdApi } from "@/api/batchTrainee";
import { fetchBatchByIdApi } from "@/api/batchApi";
import { fetchBatchModuleScheduleByBatchIdApi } from "@/api/batchModuleScheduleApi";

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  meetingLink?: string;
  batchId: number;
  trainers: string;
  duration: number;
  module: string;
  startTime: string;
  endTime: string;
  startDateModule: string;
  endDateModule: string;
}

interface BatchFilter {
  id: number;
  name: string;
}

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentWeek, setCurrentWeek] = useState(moment().startOf('week'));
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);
  const [batchFilters, setBatchFilters] = useState<BatchFilter[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);

  useEffect(() => {
    fetchBatchesData();
  }, []);

  const getToken = () => localStorage.getItem("authToken");

  const getUserId = () => {
    const token = getToken();
    if (token) {
      const userId = localStorage.getItem("userId");
      return userId ? parseInt(userId, 10) : null;
    }
    return null;
  };

  const fetchBatchesData = async () => {
    const token = getToken();
    const userId = getUserId();
  
    if (!token || userId === null) {
      toast.error("You must be logged in to view batches.");
      return;
    }
  
    try {
      const BatchIds = await fetchBatchIdByTraineeIdApi(userId);
      console.log("BatchIds", BatchIds);
  
      if (BatchIds.length === 0) {
        toast.error("No batches found for this trainee.");
        return;
      }
  
      const courseDetails: CalendarEvent[] = [];
      const filters: BatchFilter[] = [];
  
      for (const id of BatchIds) {
        const batchData = await fetchBatchByIdApi(id);
        console.log("Batch Data", batchData);
  
        const batchStart = moment(batchData.startDate);
        const batchEnd = moment(batchData.endDate);
        const modules = await fetchBatchModuleScheduleByBatchIdApi(id);
  
        console.log("Modules for Batch", id, modules);
  
        let lastModuleEnd = batchStart.clone(); // Keep track of last module end date
  
        if (modules && Array.isArray(modules)) {
          modules.forEach((module) => {
            const moduleStart = moment(module.startDate);
            const moduleEnd = moment(module.endDate);
            
            while (moduleStart.isSameOrBefore(moduleEnd)) {
              if (moduleStart.day() !== 0) {
                // Skip Sundays
                courseDetails.push({
                  title: batchData.batchName,
                  module: module.module.moduleName,
                  start: moduleStart.toDate(),
                  end: moduleStart.clone().endOf("day").toDate(),
                  startTime: module.startTime,
                  endTime: module.endTime,
                  startDateModule: module.startDate,
                  endDateModule: module.endDate,
                  meetingLink: module.meetingLink,
                  batchId: id,
                  trainers: module.trainers
                    .map((trainer: any) => trainer.firstName + " " + trainer.lastName)
                    .join(", "),
                  duration: module.duration,
                });
              }
              lastModuleEnd = moduleStart.clone(); // Update last module end date
              moduleStart.add(1, "day");
            }
          });
        }
  
        // **Ensure events continue until batch end date**
        while (lastModuleEnd.isBefore(batchEnd)) {
          lastModuleEnd.add(1, "day");
          if (lastModuleEnd.day() !== 0) { // Skip Sundays
            courseDetails.push({
              title: batchData.batchName + " (No Module Scheduled)", // Indicate no module
              module: "No Module",
              start: lastModuleEnd.toDate(),
              end: lastModuleEnd.clone().endOf("day").toDate(),
              startTime: "",
              endTime: "",
              startDateModule: "",
              endDateModule: "",
              meetingLink: "",
              batchId: id,
              trainers: "No Trainers Assigned",
              duration: 0,
            });
          }
        }
  
        filters.push({ id, name: batchData.batchName });
      }
  
      setEvents(courseDetails);
      setBatchFilters(filters);
      setSelectedBatch(BatchIds[0]); // Select the first batch by default
    } catch (error) {
      toast.error("Error fetching batch schedule.");
      console.error(error);
    }
  };
  
  
  // const fetchBatchesData = async () => {
  //   const token = getToken();
  //   const userId = getUserId();

  //   if (!token || userId === null) {
  //     toast.error("You must be logged in to view batches.");
  //     return;
  //   }

  //   try {
  //     const BatchIds = await fetchBatchIdByTraineeIdApi(userId);
  //     console.log("BatchIds", BatchIds);

  //     if (BatchIds.length === 0) {
  //       toast.error("No batches found for this trainee.");
  //       return;
  //     }

  //     const courseDetails: CalendarEvent[] = [];
  //     const filters: BatchFilter[] = [];

  //     for (const id of BatchIds) {
  //       const data = await fetchBatchByIdApi(id);
  //       console.log("dataa", data);

  //       const startDate = moment(data.startDate);
  //       const endDate = moment(data.endDate);
  //       const dates = [];
  //       let current = startDate.clone();

  //       while (current.isSameOrBefore(endDate)) {
  //         if (current.day() !== 0) {
  //           dates.push(current.clone());
  //         }
  //         current.add(1, "day");
  //       }

  //       const modules = await fetchBatchModuleScheduleByBatchIdApi(id);
  //       console.log("modules", modules);

        

  //       if (modules) {
  //         const batchSchedule = modules;
  //         console.log("data", batchSchedule);

  //         dates.forEach((date) => {
  //           courseDetails.push({
  //             title: data.batchName,
  //             module: batchSchedule.module.moduleName,
  //             start: date.toDate(),
  //             end: date.clone().endOf("day").toDate(),
  //             startTime: batchSchedule.startTime,
  //             endTime: batchSchedule.endTime,
  //             startDateModule: batchSchedule.startDate,
  //             endDateModule: batchSchedule.endDate,
  //             meetingLink: batchSchedule.meetingLink,
  //             batchId: id,
  //             trainers: batchSchedule.trainers
  //               .map((trainer: any) => trainer.firstName + " " + trainer.lastName)
  //               .join(", "),
  //             duration: batchSchedule.duration,
  //           });
  //         });
  //       }

  //       console.log('CourseDetails')

  //       filters.push({ id, name: data.batchName });
  //     }

  //     setEvents(courseDetails);
  //     setBatchFilters(filters);
  //     setSelectedBatch(BatchIds[0]);
  //   } catch (error) {
  //     toast.error("Error fetching batch schedule.");
  //     console.error(error);
  //   }
  // };

  const buildCalendarDays = () => {
    const startDay = moment(currentWeek).startOf('week');
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      days.push(startDay.clone().add(i, 'days'));
    }

    return days;
  };

  const getEventsForDay = (day: moment.Moment) => {
    if (day.day() === 0 || selectedBatch === null) return [];

    return events.filter((event) => moment(day).isSame(event.start, "day"));
  };

  const handleDayClick = (event: CalendarEvent) => {
    if (event) {
      setSelectedEvent(event);
      setShowModal(true);
    } else {
      toast.info("No events scheduled for this day.");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDayEvents([]);
    setSelectedEvent(null);
  };

  const changeWeek = (offset: number) => {
    setCurrentWeek(moment(currentWeek).add(offset, 'weeks'));
  };

  const selectBatch = (batchId: number) => {
    setSelectedBatch(batchId);
  };

  return (
    <div className="h-screen bg-gradient-to-r from-green-100 to-green-300 p-4">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Batch Filter Section */}
        {/* <div className="p-4 bg-green-50">
          <div className="flex gap-2">
            {batchFilters.map((batch) => (
              <button
                key={batch.id}
                onClick={() => selectBatch(batch.id)}
                className={`px-4 py-2 rounded-full text-sm ${
                  selectedBatch === batch.id
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-green-600 border border-green-600'
                }`}
              >
                {batch.name}
              </button>
            ))}
          </div>
        </div> */}

        {/* Calendar Header */}
        <div className="p-4 flex justify-between items-center bg-green-600 text-white">
          <button
            onClick={() => changeWeek(-1)}
            className="px-4 py-2 rounded hover:bg-green-700"
          >
            Previous Week
          </button>
          <h2 className="text-xl font-bold">
            {currentWeek.format('MMM D')} - {currentWeek.clone().endOf('week').format('MMM D, YYYY')}
          </h2>
          <button
            onClick={() => changeWeek(1)}
            className="px-4 py-2 rounded hover:bg-green-700"
          >
            Next Week
          </button>
        </div>

        {/* Calendar Days Header */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="bg-green-50 hover:bg-white p-2 text-center font-semibold"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 h-[calc(100vh-220px)]">
          {buildCalendarDays().map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const isSunday = day.day() === 0;
            const isPastDay = day.isBefore(moment(), 'day');
            const isToday = day.isSame(moment(), 'day');

            return (
              <div
                key={index}
                className={`min-h-[200px] p-2 transition-colors ${
                  isToday ? 'bg-green-50' : 'bg-white'
                } ${isSunday ? 'bg-gray-100' : 'hover:bg-green-50'} ${
                  isPastDay ? 'bg-gray-50' : ''
                }`}
              >
                <div className={`font-semibold text-sm mb-1 ${
                  isToday ? 'text-green-600' : ''
                }`}>
                  {day.format('D')}
                </div>
                <div className="max-h-[180px] overflow-y-auto">
                  {dayEvents.map((event, eventIndex) => {
                    const isPastEvent = moment(event.start).isBefore(moment(), 'day');

                    return (
                      <div
                        key={eventIndex}
                        onClick={() => handleDayClick(event)}
                        className={`text-xs p-2 mb-1 rounded cursor-pointer ${
                          isPastEvent
                            ? 'line-through text-gray-400 cursor-not-allowed'
                            : 'bg-green-100 hover:bg-green-300'
                        }`}
                        style={isPastEvent ? { pointerEvents: 'none' } : {}}
                      >
                        <div className="font-semibold">{event.title}</div>
                        <div>{event.startTime} - {event.endTime}</div>
                        <div className="truncate">{event.module}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Modal */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-6">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md transform transition-all scale-95 hover:scale-100">
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {selectedEvent.title}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Module:</span>{" "}
                  {selectedEvent.module}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Trainer:</span>{" "}
                  {selectedEvent.trainers}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Date:</span>{" "}
                  {moment(selectedEvent.start).format("MMMM D, YYYY")}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Start Time:</span>{" "}
                  {selectedEvent.startTime}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">End Time:</span>{" "}
                  {selectedEvent.endTime}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Duration:</span>{" "}
                  {selectedEvent.duration + " minutes"}
                </p>
                {selectedEvent.meetingLink && (
                  <div className="mt-4">
                    <a
                      href={selectedEvent.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm text-center w-full"
                    >
                      Join Meeting
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;