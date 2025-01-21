
// import React, { useEffect, useState } from "react";
// import moment from "moment";
// import { toast } from "sonner";
// import { fetchBatchByTraineeIdApi } from "@/api/batchTrainee";
// import { fetchBatchByIdApi } from "@/api/batchApi";

// interface CalendarEvent {
//   title: string;
//   start: Date;
//   end: Date;
//   meetingLink?: string;
// }

// const Calendar: React.FC = () => {
//   const [events, setEvents] = useState<CalendarEvent[]>([]);
//   const [currentMonth, setCurrentMonth] = useState(moment());
//   const [showModal, setShowModal] = useState(false);
//   const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);

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
//       const BatchIds = await fetchBatchByTraineeIdApi(userId);
      
//       if (BatchIds.length === 0) {
//         toast.error("No batches found for this trainee.");
//         return;
//       }

//       const courseDetails: CalendarEvent[] = [];
//       for (const id of BatchIds) {
//         const data = await fetchBatchByIdApi(id);
        
//         // Create an array of dates between start and end
//         const start = moment(data.startDate);
//         const end = moment(data.endDate);
//         const dates = [];
//         let current = start.clone();

//         while (current.isSameOrBefore(end)) {
//           // Skip events on Sundays
//           if (current.day() !== 0) {
//             dates.push(current.clone());
//           }
//           current.add(1, 'day');
//         }

//         // Create separate events for each non-Sunday date
//         dates.forEach(date => {
//           courseDetails.push({
//             title: data.name,
//             start: date.toDate(),
//             end: date.clone().endOf('day').toDate(),
//             meetingLink: "https://meet.example.com/" + data.name.toLowerCase().replace(" ", "-"),
//           });
//         });
//       }

//       setEvents(courseDetails);
//     } catch (error) {
//       toast.error("Error fetching batch schedule.");
//       console.error(error);
//     }
//   };

//   const buildCalendarDays = () => {
//     const startDay = moment(currentMonth).startOf('month').startOf('week');
//     const endDay = moment(currentMonth).endOf('month').endOf('week');
//     const days = [];
//     let day = startDay.clone();

//     while (day.isSameOrBefore(endDay)) {
//       days.push(day.clone());
//       day.add(1, 'day');
//     }

//     return days;
//   };

//   const getEventsForDay = (day: moment.Moment) => {
//     // Don't return any events for Sundays
//     if (day.day() === 0) return [];
    
//     return events.filter(event => 
//       moment(day).isSame(event.start, 'day')
//     );
//   };

//   const handleDayClick = (day: moment.Moment) => {
//     if (day.day() === 0) {
//       toast.info("No events scheduled on Sundays.");
//       return;
//     }
    
//     const dayEvents = getEventsForDay(day);
//     if (dayEvents.length > 0) {
//       setSelectedDayEvents(dayEvents);
//       setShowModal(true);
//     } else {
//       toast.info("No events scheduled for this day.");
//     }
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setSelectedDayEvents([]);
//   };

//   const changeMonth = (offset: number) => {
//     setCurrentMonth(moment(currentMonth).add(offset, 'months'));
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
//             {currentMonth.format('MMMM YYYY')}
//           </h2>
//           <button 
//             onClick={() => changeMonth(1)}
//             className="px-4 py-2 rounded hover:bg-green-700"
//           >
//             Next
//           </button>
//         </div>
        
//         <div className="grid grid-cols-7 gap-px bg-gray-200">
//           {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
//             <div key={day} className="bg-green-50 p-2 text-center font-semibold">
//               {day}
//             </div>
//           ))}
//         </div>

//         <div className="grid grid-cols-7 gap-px bg-gray-200">
//           {buildCalendarDays().map((day, index) => {
//             const dayEvents = getEventsForDay(day);
//             const isCurrentMonth = day.month() === currentMonth.month();
//             const isSunday = day.day() === 0;

//             return (
//               <div
//                 key={index}
//                 onClick={() => handleDayClick(day)}
//                 className={`min-h-[100px] p-2 transition-colors ${
//                   isCurrentMonth ? 'bg-white' : 'bg-gray-50'
//                 } ${isSunday ? 'bg-gray-100' : 'hover:bg-green-50'} cursor-pointer`}
//               >
//                 <div className="font-semibold text-sm mb-1">
//                   {day.format('D')}
//                 </div>
//                 {dayEvents.map((event, eventIndex) => (
//                   <div
//                     key={eventIndex}
//                     className="text-xs p-1 mb-1 rounded bg-green-100 truncate"
//                   >
//                     {event.title}
//                   </div>
//                 ))}
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {showModal && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-6">
//           <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
//             <h2 className="text-2xl font-semibold mb-4">
//               Events for {moment(selectedDayEvents[0]?.start).format('MMMM D, YYYY')}
//             </h2>
//             <div className="space-y-4">
//               {selectedDayEvents.map((event, index) => (
//                 <div key={index} className="border-b pb-4">
//                   <h3 className="font-semibold">{event.title}</h3>
//                   <p className="text-sm text-gray-600">
//                     Time: {moment(event.start).format('h:mm A')} - {moment(event.end).format('h:mm A')}
//                   </p>
//                   {event.meetingLink && (
//                     <a
//                       href={event.meetingLink}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 hover:text-blue-800 text-sm underline"
//                     >
//                       Join Meeting
//                     </a>
//                   )}
//                 </div>
//               ))}
//             </div>
//             <button
//               onClick={handleCloseModal}
//               className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//             >
//               Close
//             </button>
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
import { fetchBatchByTraineeIdApi } from "@/api/batchTrainee";
import { fetchBatchByIdApi } from "@/api/batchApi";

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  meetingLink?: string;
  batchId: number;
}

interface BatchFilter {
  id: number;
  name: string;
}

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(moment());
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
      const BatchIds = await fetchBatchByTraineeIdApi(userId);

      if (BatchIds.length === 0) {
        toast.error("No batches found for this trainee.");
        return;
      }

      const courseDetails: CalendarEvent[] = [];
      const filters: BatchFilter[] = [];
      for (const id of BatchIds) {
        const data = await fetchBatchByIdApi(id);

        // Create an array of dates between start and end
        const start = moment(data.startDate);
        const end = moment(data.endDate);
        const dates = [];
        let current = start.clone();

        while (current.isSameOrBefore(end)) {
          if (current.day() !== 0) {
            // Skip events on Sundays
            dates.push(current.clone());
          }
          current.add(1, "day");
        }

        // Create separate events for each non-Sunday date
        const storedMeetingLink = data.meetingLink || "https://meet.google.com/egi-hwzm-ovz";

        dates.forEach((date) => {
          courseDetails.push({
            title: data.name,
            start: date.toDate(),
            end: date.clone().endOf("day").toDate(),
            meetingLink: storedMeetingLink,
            batchId: id,
          });
        });

        filters.push({ id, name: data.name });
      }

      setEvents(courseDetails);
      setBatchFilters(filters);
      setSelectedBatch(BatchIds[0]); // Default to the first batch
    } catch (error) {
      toast.error("Error fetching batch schedule.");
      console.error(error);
    }
  };

  const buildCalendarDays = () => {
    const startDay = moment(currentMonth).startOf("month").startOf("week");
    const endDay = moment(currentMonth).endOf("month").endOf("week");
    const days = [];
    let day = startDay.clone();

    while (day.isSameOrBefore(endDay)) {
      days.push(day.clone());
      day.add(1, "day");
    }

    return days;
  };

  const getEventsForDay = (day: moment.Moment) => {
    if (day.day() === 0 || selectedBatch === null) return []; // No events on Sundays

    return events.filter(
      (event) =>
        moment(day).isSame(event.start, "day") && event.batchId === selectedBatch
    );
  };

  const handleDayClick = (day: moment.Moment) => {
    if (day.day() === 0) {
      toast.info("No events scheduled on Sundays.");
      return;
    }

    const dayEvents = getEventsForDay(day);
    if (dayEvents.length > 0) {
      setSelectedDayEvents(dayEvents);
      setSelectedEvent(dayEvents[0]); // Optionally set the first event for the modal
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

  const changeMonth = (offset: number) => {
    setCurrentMonth(moment(currentMonth).add(offset, "months"));
  };

  const selectBatch = (batchId: number) => {
    setSelectedBatch(batchId);
  };

  return (
    <div className="h-screen bg-gradient-to-r from-green-100 to-green-300 p-4">
      {/* Batch Selector */}
      <div className="flex space-x-2 mb-4">
        {batchFilters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => selectBatch(filter.id)}
            className={`px-4 py-2 rounded ${
              selectedBatch === filter.id
                ? "bg-green-600 text-white"
                : "bg-gray-300 text-gray-800"
            }`}
          >
            {filter.name}
          </button>
        ))}
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-4 flex justify-between items-center bg-green-600 text-white">
          <button
            onClick={() => changeMonth(-1)}
            className="px-4 py-2 rounded hover:bg-green-700"
          >
            Previous
          </button>
          <h2 className="text-xl font-bold">
            {currentMonth.format("MMMM YYYY")}
          </h2>
          <button
            onClick={() => changeMonth(1)}
            className="px-4 py-2 rounded hover:bg-green-700"
          >
            Next
          </button>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="bg-green-50 p-2 text-center font-semibold">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {buildCalendarDays().map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = day.month() === currentMonth.month();
            const isSunday = day.day() === 0;

            return (
              <div
                key={index}
                onClick={() => handleDayClick(day)}
                className={`min-h-[100px] p-2 transition-colors ${
                  isCurrentMonth ? "bg-white" : "bg-gray-50"
                } ${isSunday ? "bg-gray-100" : "hover:bg-green-50"} cursor-pointer`}
              >
                <div className="font-semibold text-sm mb-1">
                  {day.format("D")}
                </div>
                {dayEvents.map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    className="text-xs p-1 mb-1 rounded bg-green-100 truncate"
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {showModal && selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-6">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md transform transition-all scale-95 hover:scale-100">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                {selectedEvent.title}
              </h2>
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
                  <span className="font-semibold">Date:</span>{" "}
                  {moment(selectedEvent.start).format("MMMM D, YYYY")}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Time:</span>{" "}
                  {moment(selectedEvent.start).format("h:mm A")} -{" "}
                  {moment(selectedEvent.end).format("h:mm A")}
                </p>
                {selectedEvent.meetingLink && (
                  <div className="mt-4">
                    <a
                      href={selectedEvent.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg 
                              hover:bg-green-700 transition-colors duration-200 text-sm text-center w-full"
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