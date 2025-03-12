import React, { useEffect, useState } from "react";
import { toast } from "react-toastify"; // For error handling

interface EventData {
  moduleName: string;
  date: string;
  attendancePercentage: number;
  inMeetingDuration: string;
  assignmentStatus: string;
}

const EventSection: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Mock API function (Replace with real API call)
  const fetchEventsData = async () => {
    try {
      // Simulated API response
      const eventDetails: EventData[] = [
        {
          moduleName: "React Basics",
          date: "2025-02-10T09:00:00.000Z",
          attendancePercentage: 85,
          inMeetingDuration: "1h 15m",
          assignmentStatus: "Completed",
        },
        {
          moduleName: "Redux State Management",
          date: "2025-02-11T10:00:00.000Z",
          attendancePercentage: 70,
          inMeetingDuration: "45m",
          assignmentStatus: "Pending",
        },
        {
          moduleName: "Node.js API",
          date: "2025-02-12T11:00:00.000Z",
          attendancePercentage: 95,
          inMeetingDuration: "2h",
          assignmentStatus: "Completed",
        },
        {
          moduleName: "MongoDB Basics",
          date: "2025-02-13T12:30:00.000Z",
          attendancePercentage: 60,
          inMeetingDuration: "30m",
          assignmentStatus: "Pending",
        },
        {
          moduleName: "Express.js Framework",
          date: "2025-02-14T14:00:00.000Z",
          attendancePercentage: 88,
          inMeetingDuration: "1h 30m",
          assignmentStatus: "Completed",
        },
      ];

      setEvents(eventDetails);
      setLoading(false);
    } catch (error) {
      toast.error("Error fetching events.");
      console.error("Error fetching events:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsData();
  }, []);

  function formatDateToDDMMYYYY(isoString: string) {
    const date = new Date(isoString);
    return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
  }

  if (loading) {
    return <div className="text-center py-4">Loading events...</div>;
  }

  return (
    <div className="bg-[#E8E8E8] p-6 rounded-lg shadow-lg w-[1320px] ml-4 h-[450px] mt-5">
      {/* Mild Gray Background */}
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Event Section</h2>

      {/* Scrollable Event List */}
      <div className="overflow-y-auto h-[350px] space-y-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        <div className="bg-white rounded-lg shadow-md">
          {/* Table Header */}
          <div className="grid grid-cols-5 gap-4 p-4 border-b bg-gray-100 sticky top-0">
            <div className="font-semibold text-gray-700">Module Name</div>
            <div className="font-semibold text-gray-700">Date</div>
            <div className="font-semibold text-gray-700">Attendance %</div>
            <div className="font-semibold text-gray-700">In-Meeting Duration</div>
            <div className="font-semibold text-gray-700">Assignment Status</div>
          </div>

          {/* Event Rows */}
          <div className="overflow-y-auto max-h-[300px]">
            {events.map((event, index) => (
              <div
                key={index}
                className="grid grid-cols-5 gap-4 p-4 border-b hover:bg-gray-50"
              >
                <div className="text-gray-800">{event.moduleName}</div>
                <div className="text-gray-700">{formatDateToDDMMYYYY(event.date)}</div>
                <div className="text-gray-700">{event.attendancePercentage}%</div>
                <div className="text-gray-700">{event.inMeetingDuration}</div>
                <div
                  className={`font-semibold ${
                    event.assignmentStatus === "Completed"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {event.assignmentStatus}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventSection;
