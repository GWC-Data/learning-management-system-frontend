// import React, { useEffect, useState } from "react";
// import { toast } from "react-toastify"; // Assuming you're using react-toastify for error handling
// import { fetchBatchIdByTraineeIdApi } from "@/helpers/api/batchTrainee";
// import { fetchBatchByIdApi } from "@/helpers/api/batchApi";

// const MyCourses: React.FC = () => {
//   const [courses, setCourses] = useState<any[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   const fetchBatchesData = async () => {
//     const token = localStorage.getItem("authToken"); // Example for localStorage
//     const userId = localStorage.getItem("userId"); // Example for localStorage

//     console.log(userId);

//     if (!token || userId === null) {
//       toast.error("You must be logged in to view batches.");
//       return;
//     }

//     try {
//       const BatchId = await fetchBatchIdByTraineeIdApi(String(userId));
//       console.log("Enrolled Batches", BatchId);

//       const courseDetails = [];
//       for (const id of BatchId) {
//         const data = await fetchBatchByIdApi(id); // Call the API for each batchId
//         console.log(`Details for Batch ${id}:`, data);
//         courseDetails.push(data); // Collect the course data
//       }
//       console.log("course Details", courseDetails);

//       setCourses(courseDetails); // Set the fetched course details in the state
//       setLoading(false); // Set loading to false after fetching data
//     } catch (error) {
//       toast.error("Error fetching batch schedule.");
//       console.error("Error fetching batch schedule:", error);
//       setLoading(false); // Set loading to false on error
//     }
//   };

//   useEffect(() => {
//     fetchBatchesData(); // Fetch batch data on component mount
//   }, []);

//   function formatDateToDDMMYYYY(isoString: any) {
//     const date = new Date(isoString);

//     // Extract day, month, and year
//     const day = String(date.getDate()).padStart(2, "0"); // Pad single digit days with leading zero
//     const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
//     const year = date.getFullYear();

//     // Return formatted date as dd-mm-yyyy
//     return `${day}-${month}-${year}`;
//   }

//   function calculateProgress(startDate: string, endDate: string): number {
//     const start = new Date(startDate).getTime();
//     const end = new Date(endDate).getTime();
//     const now = new Date().getTime();

//     if (now < start) return 0; // Before the course starts
//     if (now > end) return 100; // After the course ends

//     // Calculate progress percentage
//     const progress = ((now - start) / (end - start)) * 100;
//     return Math.round(progress); // Round to the nearest integer
//   }

//   // Example usage
//   const formattedDate = formatDateToDDMMYYYY("2025-02-01T09:00:00.000Z");
//   console.log(formattedDate); // "01-02-2025"

//   if (loading) {
//     return <div>Loading courses...</div>; // Show loading message
//   }

//   return (
//     <div className="bg-[#EADCF1] p-6 rounded-lg shadow-lg w-[800px] mx-auto h-[auto] -mt-8">
//       {/* Lavender Mist */}

//       <h2 className="text-2xl font-bold mb-4 text-gray-800">My Courses</h2>

//       {/* Course Table */}
//       <div className="overflow-y-auto mt-10 h-[350px] space-y-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
//         <div className="bg-white rounded-lg shadow-md">
//           <div className="grid grid-cols-4 gap-4 p-4 border-b">
//             <div className="font-semibold text-gray-700">Course Name</div>
//             <div className="font-semibold text-gray-700">Start</div>
//             <div className="font-semibold text-gray-700">End</div>
//             <div className="font-semibold text-gray-700">Progress</div>
//           </div>

//           {/* Courses */}
//           {courses.length > 0 ? (
//             courses.map((course) => (
//               <div
//                 key={course.id}
//                 className="grid grid-cols-4 gap-6 p-4 border-b hover:bg-gray-50"
//               >
//                 <div className="flex items-center space-x-2">
//                   <div>
//                     <p className="font-semibold text-gray-800">
//                       {course.course?.courseName || "Unnamed Course"}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="text-gray-700">
//                   {course.startDate?.value
//                     ? formatDateToDDMMYYYY(course.startDate.value)
//                     : "N/A"}
//                 </div>
//                 <div className="text-gray-700">
//                   {course.endDate?.value
//                     ? formatDateToDDMMYYYY(course.endDate.value)
//                     : "N/A"}
//                 </div>
//                 <div className="text-gray-700">
//                   {course.startDate?.value && course.endDate?.value
//                     ? `${calculateProgress(course.startDate.value, course.endDate.value)}%`
//                     : "N/A"}
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="p-4 text-center text-gray-500">
//               No courses found
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MyCourses;



import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchBatchIdByTraineeIdApi } from "@/helpers/api/batchTrainee";
import { fetchBatchByIdApi } from "@/helpers/api/batchApi";

// Define a proper type for the course data
interface CourseDate {
  value: string;
}

interface Course {
  courseName: string;
  courseImg: string;
  courseLink: string;
}

interface BatchCourse {
  id: string;
  courseId: string;
  batchName: string;
  startDate: CourseDate;
  endDate: CourseDate;
  course: Course;
}

const NewCourse: React.FC = () => {
  const [courses, setCourses] = useState<BatchCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchBatchesData = async () => {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    if (!token || userId === null) {
      toast.error("You must be logged in to view courses.");
      return;
    }

    try {
      const batchIds = await fetchBatchIdByTraineeIdApi(String(userId));
      console.log("Enrolled Batches", batchIds);

      const courseDetails = [];
      for (const id of batchIds) {
        const data = await fetchBatchByIdApi(id);
        courseDetails.push(data);
      }

      setCourses(courseDetails);
      setLoading(false);
    } catch (error) {
      toast.error("Error fetching course data.");
      console.error("Error fetching course data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchesData();
  }, []);

  function formatDateToReadable(dateString: string): string {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function calculateProgress(startDate: string, endDate: string): number {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();

    if (now < start) return 0;
    if (now > end) return 100;

    const progress = ((now - start) / (end - start)) * 100;
    return Math.round(progress);
  }

  function getDaysRemaining(endDate: string): number {
    if (!endDate) return 0;
    
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    const daysRemaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return daysRemaining > 0 ? daysRemaining : 0;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-pulse text-lg text-gray-600">Loading your courses...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#EADCF1] p-6 rounded-lg shadow-lg w-[800px] mx-auto h-[auto] -mt-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">My Learning Journey</h2>
        <span className="text-sm text-purple-600 font-medium">{courses.length} Course{courses.length !== 1 ? 's' : ''}</span>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white p-8 rounded-lg text-center shadow">
          <h3 className="text-xl font-medium text-gray-700 mb-2">No courses found</h3>
          <p className="text-gray-500">You are not enrolled in any courses yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {courses.map((course) => (
            <div 
              key={course.id || `course-${course.courseId}`} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="h-48 bg-gray-200 overflow-hidden">
                {course.course?.courseImg ? (
                  <img 
                    src={course.course.courseImg} 
                    alt={course.course?.courseName || "Course"} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-purple-200 to-indigo-200">
                    <span className="text-xl font-semibold text-gray-700">{course.course?.courseName || "Course"}</span>
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {course.course?.courseName || "Unnamed Course"}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{course.batchName}</p>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{calculateProgress(course.startDate?.value, course.endDate?.value)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${calculateProgress(course.startDate?.value, course.endDate?.value)}%` }}>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-gray-500">Start Date</p>
                    <p className="font-medium">{formatDateToReadable(course.startDate?.value)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">End Date</p>
                    <p className="font-medium">{formatDateToReadable(course.endDate?.value)}</p>
                  </div>
                </div>
                
                {getDaysRemaining(course.endDate?.value) > 0 && (
                  <div className="text-center p-2 bg-purple-50 rounded-md text-purple-700 text-sm font-medium">
                    {getDaysRemaining(course.endDate?.value)} days remaining
                  </div>
                )}
                
                {course.course?.courseLink && (
                  <div className="mt-4 text-center">
                    <a 
                      href={course.course.courseLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      Visit Course
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewCourse;