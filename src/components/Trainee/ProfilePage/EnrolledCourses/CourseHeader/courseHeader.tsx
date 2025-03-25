// import { fetchBatchByNameRequest } from "@/store/actions";
// import React, { useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useLocation } from "react-router-dom";


// const CourseHeader: React.FC = () => {
//   const dispatch = useDispatch();
//   const location = useLocation();
//   const currentPath = location.pathname;

//   // Extract batch name from the path
//   const batchName = decodeURIComponent(currentPath.split("/")[3]);

//   // Capitalize the first letter of each word
//   const capitalizedBatchName = batchName
//     .split(" ")
//     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//     .join(" ");

//   console.log("📡 Fetching batch data for:", capitalizedBatchName);

//   // Dispatch API call on component mount
//   useEffect(() => {
//     if (capitalizedBatchName) {
//       console.log(capitalizedBatchName,'hehe')
//       dispatch(fetchBatchByNameRequest(capitalizedBatchName));
//       console.log(capitalizedBatchName, 'haha');
//     }
//   }, [capitalizedBatchName, dispatch]);

//   // Fetch batch data from Redux store
//   const batch = useSelector((state: any) => state.batch.batchDataByName);
//   console.log('batch',batch)

//   console.log("📝 CourseHeader - Batch Data:", batch);

//   if (!batch || !batch.course) {
//     return (
//       <div className="text-center text-gray-500">Loading batch data...</div>
//     );
//   }

//   return (
//     <div className="w-[1300px] bg-white p-5 h-40 rounded-lg">
//       <div className="flex flex-row items-center space-x-4">
//         {/* Course Image */}
//         <img
//           src={batch.course.courseImg}
//           alt="Course Image"
//           className="w-20 h-20 rounded-lg object-cover"
//         />

//         {/* Batch Name */}
//         <h1 className="text-2xl font-semibold text-gray-800">
//           {batch.batchName}
//         </h1>

//         {/* Course Info */}
//         <div className="ml-5 border border-stone-300 rounded-2xl p-2 bg-gray-50">
//           <p className="text-sm text-gray-600">{batch.course.courseName}</p>
//         </div>
//       </div>

//       <div className="ml-8 flex flex-row gap-2 mt-3">
//         {/* Lessons Count */}
//         <div className="flex flex-row mr-4 gap-1">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             height="24px"
//             viewBox="0 -960 960 960"
//             width="24px"
//             fill="#6e2b8b"
//           >
//             <path d="m380-300 280-180-280-180v360ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
//           </svg>
//           <p>38 Lessons</p>
//         </div>

//         {/* Course Duration */}
//         <div className="flex flex-row gap-1 mr-3">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             height="24px"
//             viewBox="0 -960 960 960"
//             width="24px"
//             fill="#6e2b8b"
//           >
//             <path d="m612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z" />
//           </svg>
//           <p>4h 30min</p>
//         </div>

//         {/* Course Rating */}
//         <div className="flex flex-row gap-1">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             height="24px"
//             viewBox="0 -960 960 960"
//             width="24px"
//             fill="#6e2b8b"
//           >
//             <path d="m354-287 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-350Z" />
//           </svg>
//           <p>4.5 (126 reviews)</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CourseHeader;

import React from "react";
import { useSelector } from "react-redux";

const CourseHeader: React.FC = () => {
  // Fetch batch data from Redux store
  const batch = useSelector((state: any) => state.batch.batchDataByName);
  console.log('batch',batch);

  if (!batch || !batch.course) {
    return <div className="text-center text-gray-500">Loading batch data...</div>;
  }

  return (
    <div className="w-[1300px] bg-white p-5 h-40 rounded-lg">
      <div className="flex flex-row items-center space-x-4">
        {/* Course Image */}
        <img
          src={batch.course.courseImg}
          alt="Course"
          className="w-20 h-20 rounded-lg object-cover"
        />

        {/* Batch Name */}
        <h1 className="text-2xl font-semibold text-gray-800">
          {batch.batchName}
        </h1>

        {/* Course Info */}
        <div className="ml-5 border border-stone-300 rounded-2xl p-2 bg-gray-50">
          <p className="text-sm text-gray-600">{batch.course.courseName}</p>
        </div>
      </div>

      <div className="ml-8 flex flex-row gap-2 mt-3">
        {/* Lessons Count */}
        <div className="flex flex-row mr-4 gap-1">
          <span>📹</span>
          <p>38 Lessons</p>
        </div>

        {/* Course Duration */}
        <div className="flex flex-row gap-1 mr-3">
          <span>⏱️</span>
          <p>4h 30min</p>
        </div>

        {/* Course Rating */}
        <div className="flex flex-row gap-1">
          <span>⭐</span>
          <p>4.5 (126 reviews)</p>
        </div>
      </div>
    </div>
  );
};

export default CourseHeader;
