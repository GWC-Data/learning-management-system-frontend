import React, { useEffect, useState } from "react";
import { toast } from "react-toastify"; // For error handling
import { getAttendanceByUserIdApi } from "../../../../../helpers/api/attendance"; // Import your API function

interface EventData {
  id: string | number; // Ensures unique key
  className: string;
  moduleName: string;
  date: string;
  attendanceStatus: string;
  inMeetingDuration: string;
  assignmentStatus: string;
}

const EventSection: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchEventsData = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("User ID not found. Please log in again.");
        return;
      }

      const response = await getAttendanceByUserIdApi(userId);
      console.log("API Response:", response); // Debugging log ✅

      // Validate response
      if (!Array.isArray(response)) {
        console.error("Unexpected API response format", response);
        toast.error("Invalid data received from server.");
        setEvents([]);
        return;
      }

      // Transform API response into EventData format
      const eventDetails: EventData[] = response.map((item, index) => ({
        id: item.id || index, // Use ID if available; fallback to index
        moduleName: item.moduleName ?? "N/A",
        className: item.classTitle ?? "N/A",
        date: formatDateToDDMMYYYY(item.attendanceCreatedAt),
        inMeetingDuration: item.duration ? formatDuration(item.duration) : "0m",
        assignmentStatus:
          (item.obtainedPercentage ?? 0) >= 50 ? "Completed" : "Pending",
        attendanceStatus: item.attendance ? "Present" : "Absent", // ✅ Show Present/Absent
      }));

      console.log("Processed Event Details:", eventDetails); // Debugging log ✅
      setEvents(eventDetails);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Error fetching events.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsData();
  }, []);

  // Helper function to format date
  function formatDateToDDMMYYYY(dateData: any) {
    if (!dateData) return "N/A"; // Handle null/undefined

    const isoString =
      typeof dateData === "object" && "value" in dateData
        ? dateData.value // Extract date string from object
        : dateData;

    const date = new Date(isoString);

    if (isNaN(date.getTime())) {
      console.error("Invalid date format:", dateData);
      return "Invalid Date"; // Handle parsing failures
    }

    return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
  }

  // Helper function to format duration
  function formatDuration(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours > 0 ? `${hours}h ` : ""}${minutes}m`;
  }

  // Status badge component
  const StatusBadge = ({ status, type }: { status: string; type: "assignment" | "attendance" }) => {
    let bgColor = "bg-gray-200";
    let textColor = "text-gray-800";
    
    if (type === "assignment") {
      if (status === "Completed") {
        bgColor = "bg-green-100";
        textColor = "text-green-800";
      } else {
        bgColor = "bg-amber-100";
        textColor = "text-amber-800";
      }
    } else {
      if (status === "Present") {
        bgColor = "bg-green-100";
        textColor = "text-green-800";
      } else {
        bgColor = "bg-red-100";
        textColor = "text-red-800";
      }
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-[#E8E8E8] p-6 rounded-lg shadow-lg w-[1320px] ml-4 h-[450px] mt-5 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-700 mb-2"></div>
          <p className="text-gray-700">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#E8E8E8] p-6 rounded-lg shadow-lg w-[1320px] ml-4 h-[450px] mt-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Event Section</h2>
        <span className="text-sm text-gray-600">{events.length} events found</span>
      </div>

      {/* Scrollable Event List */}
      <div className="overflow-y-auto h-[350px] space-y-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 pr-1">
        <div className="bg-white rounded-lg shadow-md">
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 p-4 border-b bg-gray-100 sticky top-0 z-10">
            <div className="font-semibold text-gray-700 w-48">Module Name</div>
            <div className="font-semibold text-gray-700 w-48">Class Name</div>
            <div className="font-semibold text-gray-700 w-28">Date</div>
            <div className="font-semibold text-gray-700 w-24">Duration</div>
            <div className="font-semibold text-gray-700 w-28">Assignment</div>
            <div className="font-semibold text-gray-700 w-28">Attendance</div>
          </div>

          {/* Event Rows */}
          <div className="overflow-y-auto max-h-[300px]">
            {events.map((event, index) => (
              <div
                key={event.id}
                className={`grid grid-cols-6 gap-4 p-4 border-b hover:bg-gray-50 transition duration-150 ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <div className="text-gray-800 font-medium truncate w-48 overflow-hidden text-ellipsis pr-2" title={event.moduleName}>
                  {event.moduleName}
                </div>
                <div className="text-gray-800 truncate w-48 overflow-hidden text-ellipsis pr-2" title={event.className}>
                  {event.className}
                </div>
                <div className="text-gray-700 w-28">{event.date}</div>
                <div className="text-gray-700 w-24">
                  <span className="inline-flex items-center">
                    <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {event.inMeetingDuration}
                  </span>
                </div>
                <div className="w-28">
                  <StatusBadge status={event.assignmentStatus} type="assignment" />
                </div>
                <div className="w-28">
                  <StatusBadge status={event.attendanceStatus} type="attendance" />
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <p className="text-lg font-medium">No events available</p>
              <p className="text-sm text-gray-500 mt-1">Check back later for upcoming events</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventSection;