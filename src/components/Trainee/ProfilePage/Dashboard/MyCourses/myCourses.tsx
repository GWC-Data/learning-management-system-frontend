import React, { useEffect, useState } from "react";
import { toast } from "react-toastify"; // Assuming you're using react-toastify for error handling
import { fetchBatchByTraineeIdApi } from "@/api/batchTrainee";
import { fetchBatchByIdApi } from "@/api/batchApi";


const MyCourses: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchBatchesData = async () => {
    const token = localStorage.getItem('authToken'); // Example for localStorage
    const userId = localStorage.getItem('userId'); // Example for localStorage

    console.log(userId);

    if (!token || userId === null) {
      toast.error("You must be logged in to view batches.");
      return;
    }

    try {
      const BatchId = await fetchBatchByTraineeIdApi(Number(userId));
      console.log("Enrolled Batches", BatchId);

      const courseDetails = [];
      for (const id of BatchId) {
        const data = await fetchBatchByIdApi(id); // Call the API for each batchId
        console.log(`Details for Batch ${id}:`, data);
        courseDetails.push(data); // Collect the course data
      }
      console.log('course Details', courseDetails);

      setCourses(courseDetails); // Set the fetched course details in the state
      setLoading(false); // Set loading to false after fetching data
    } catch (error) {
      toast.error("Error fetching batch schedule.");
      console.error("Error fetching batch schedule:", error);
      setLoading(false); // Set loading to false on error
    }
  };

  useEffect(() => {
    fetchBatchesData(); // Fetch batch data on component mount
  }, []);

  function formatDateToDDMMYYYY(isoString:any) {
    const date = new Date(isoString);
  
    // Extract day, month, and year
    const day = String(date.getDate()).padStart(2, '0'); // Pad single digit days with leading zero
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
  
    // Return formatted date as dd-mm-yyyy
    return `${day}-${month}-${year}`;
  }

  function calculateProgress(startDate: string, endDate: string): number {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
  
    if (now < start) return 0; // Before the course starts
    if (now > end) return 100; // After the course ends
  
    // Calculate progress percentage
    const progress = ((now - start) / (end - start)) * 100;
    return Math.round(progress); // Round to the nearest integer
  }
  
  // Example usage
  const formattedDate = formatDateToDDMMYYYY("2025-02-01T09:00:00.000Z");
  console.log(formattedDate); // "01-02-2025"
  

  if (loading) {
    return <div>Loading courses...</div>; // Show loading message
  }

  return (
    <div className="bg-gradient-to-r from-green-200 to-blue-200 p-6 rounded shadow w-[800px] mx-auto h-[auto] -mt-8">
      <h2 className="text-xl font-bold">My Courses</h2>
      
      {/* Course Table */}
      <div className="overflow-y-auto mt-10 h-[350px] space-y-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        <div className="bg-white rounded-lg shadow-md">
          <div className="grid grid-cols-4 gap-4 p-4 border-b">
            <div className="font-semibold text-gray-700">Course Name</div>
         
            <div className="font-semibold text-gray-700">Start</div>
            <div className="font-semibold text-gray-700">End</div>
            <div className="font-semibold text-gray-700">Progress</div>
          </div>

          {/* Courses */}
          {courses.map((course, index) => (
            <div
              key={index}
              className="grid grid-cols-4 gap-6 p-4 border-b hover:bg-gray-50"
            >
              {/* Course Name Column */}
              <div className="flex items-center space-x-2">
                {/* <img
                  src={course.image || Animation} // Default to Animation if no image provided
                  alt={course.name}
                  className="w-16 h-16 object-cover rounded"
                /> */}
                <div>
                  <p className="font-semibold text-gray-800">{course.course.courseName}</p>
                </div>
              </div>
             
              {/* Start Column */}
              <div className="text-gray-700">{formatDateToDDMMYYYY(course.startDate)}</div>
              {/* End Column */}
              <div className="text-gray-700">{formatDateToDDMMYYYY(course.endDate)}</div>
              {/* Progress Column */}
            <div className="text-gray-700">
              {calculateProgress(course.startDate, course.endDate)}%
            </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
