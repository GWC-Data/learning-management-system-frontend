// import React, { useEffect, useState, useMemo } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { fetchBatchModuleScheduleByBatchIdRequest } from "@/store/batchModuleSchedule/actions";
// import { setSelectedModuleId } from "@/store/module/actions";
// import { FaPlay } from "react-icons/fa";
// import { fetchClassByModuleRequest } from "@/store/actions";
// import { useNavigate, useParams } from "react-router-dom";

// const CourseContent: React.FC<{
//   setSelectedClass: (classData: any) => void;
// }> = ({ setSelectedClass }) => {
//   const { "*": dynamicPath } = useParams();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

//   // ✅ Get batch data from Redux
//   const batch = useSelector((state: any) => state.batch.batchDataByName);
//   console.log("Redux batch state:", batch);
//   const batchId = batch?.batchId;
//   console.log("Extracted batchId:", batchId);

//   // ✅ Fetch batch module schedules when batchId is available
//   useEffect(() => {
//     if (!batchId) {
//       console.warn("No batchId available! Skipping API call.");
//       return;
//     }

//     console.log("Dispatching fetch action for batchId:", batchId);
//     dispatch(fetchBatchModuleScheduleByBatchIdRequest(batchId));
//   }, [batchId, dispatch]);

//   // ✅ Get batch module schedule from Redux
//   const batchModuleSchedule = useSelector((state: any) =>
//     batchId
//       ? state.batchModuleSchedule?.batchModuleSchedulesByBatchId?.[batchId] ||
//         []
//       : []
//   );

//   console.log("Redux batchModuleSchedule:", batchModuleSchedule);

//   const [selectedModule, setSelectedModule] = useState<number | null>(null);
//   const [selectedClass, setSelectedClassState] = useState<number | null>(null);

//   // ✅ Fetch class data from Redux
//   const classForModule = useSelector(
//     (state: any) => state.classForModule.classByModule
//   );
//   console.log("ClassForModule", classForModule);

//   // ✅ Extract module IDs from batchModuleSchedule
//   const moduleIds = useMemo(
//     () => batchModuleSchedule.map((schedule: any) => schedule.module.id),
//     [batchModuleSchedule]
//   );

//   console.log("Extracted module IDs:", moduleIds);

//   // ✅ Fetch class data only if moduleIds exist and haven't been fetched
//   useEffect(() => {
//     if (moduleIds.length > 0 && classForModule.length === 0) {
//       dispatch(fetchClassByModuleRequest(moduleIds));
//     }
//   }, [moduleIds, classForModule.length, dispatch]);

//   // ✅ Transform class data into an object { moduleId: [classes] }
//   const moduleClasses = useMemo(() => {
//     const classDataMap: { [key: number]: any[] } = {};
//     classForModule.forEach((classArray: any[]) => {
//       if (classArray.length > 0) {
//         const moduleId = classArray[0].moduleId;
//         classDataMap[moduleId] = classArray;
//       }
//     });
//     return classDataMap;
//   }, [classForModule]);

//   const parts = dynamicPath ? dynamicPath.split("/").filter(Boolean) : [];
//   const batchName = parts[1]
//     ? decodeURIComponent(parts[1]).replace(/%/g, " ")
//     : "";
//   console.log("Extracted batch name:", batchName);

//   const handleModuleClick = (moduleId: number, moduleName: string) => {
//     setExpandedTopic(
//       expandedTopic === moduleId.toString() ? null : moduleId.toString()
//     );
//     setSelectedModule(moduleId);
//     setSelectedClassState(null);
//     dispatch(setSelectedModuleId(moduleId));
//     navigate(`#/${encodeURIComponent(moduleName)}`);
//   };

//   const handleClassClick = (classItem: any, moduleName: string) => {
//     setSelectedClass(classItem);
//     setSelectedClassState(classItem.classId);
//     navigate(
//       `#/${encodeURIComponent(moduleName)}?classId=${encodeURIComponent(classItem.classId)}`
//     );
//   };

//   return (
//     <>
//       <div className="sticky top-0 z-0 p-4">
//         <h3 className="text-2xl font-bold">Course Modules</h3>
//       </div>
//       <div className="w-[400px] overflow-y-auto bg-white p-5 rounded-lg shadow-lg border-2 border-slate-300 h-[500px]">
//         {batchModuleSchedule.length === 0 ? (
//           <div className="text-center mt-5 text-gray-500">
//             No modules available.
//           </div>
//         ) : (
//           <div className="space-y-4 mt-5">
//             {batchModuleSchedule.map((schedule: any, index: number) => (
//               <div key={`module-${schedule.module.id}-${index}`}>
//                 {/* Module Title */}
//                 <div
//                   className={`font-semibold text-lg cursor-pointer p-2 rounded-md flex justify-between items-center ${
//                     selectedModule === schedule.module.id
//                       ? "bg-gray-300"
//                       : "hover:bg-gray-200"
//                   }`}
//                   onClick={() =>
//                     handleModuleClick(
//                       schedule.module.id,
//                       schedule.module.moduleName
//                     )
//                   }
//                 >
//                   <span>{`${String(index + 1).padStart(2, "0")}: ${schedule.module.moduleName}`}</span>
//                   <div className="border-2 p-1 rounded-lg border-gray-300">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       width="20"
//                       height="20"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="currentColor"
//                       className={`transition-transform ${
//                         expandedTopic === schedule.module.id.toString()
//                           ? "rotate-180"
//                           : ""
//                       }`}
//                     >
//                       <path
//                         d="M19 9l-7 7-7-7"
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       />
//                     </svg>
//                   </div>
//                 </div>

//                 {/* Expanded Module Details */}
//                 {expandedTopic === schedule.module.id.toString() && (
//                   <div className="mt-2 bg-gray-100 rounded-lg p-2">
//                     {moduleClasses[schedule.module.id]?.length > 0 ? (
//                       <div className="mt-2 bg-[#eadcf1] p-3 rounded-lg">
//                         <h4 className="font-semibold text-md mb-2">Classes:</h4>
//                         {moduleClasses[schedule.module.id].map(
//                           (classItem, classIndex) => (
//                             <div
//                               key={`class-${classItem.id}-${classIndex}`}
//                               className="p-3 rounded-lg shadow-md mb-2 cursor-pointer hover:bg-gray-100"
//                               onClick={() =>
//                                 handleClassClick(
//                                   classItem,
//                                   schedule.module.moduleName
//                                 )
//                               }
//                             >
//                               <button className="flex items-center justify-center w-10 h-10 text-black bg-white rounded-full hover:bg-gray-200 transition">
//                                 <FaPlay className="text-lg" />
//                               </button>
//                               <div className="flex-1">
//                                 <h5 className="text-sm font-semibold">
//                                   {classItem.classTitle}
//                                 </h5>
//                                 <p className="text-gray-600 text-xs">
//                                   {classItem.classDescription}
//                                 </p>
//                               </div>
//                             </div>
//                           )
//                         )}
//                       </div>
//                     ) : (
//                       <p className="text-gray-600 text-sm mt-2">
//                         No classes available for this module.
//                       </p>
//                     )}
//                   </div>
//                 )}
//                 <hr />
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default CourseContent;

import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchBatchClassScheduleByBatchIdRequest } from "@/store/batchClassSchedule/actions";
import { setSelectedModuleId } from "@/store/module/actions";
import { FaPlay } from "react-icons/fa";
import { fetchClassByModuleRequest } from "@/store/actions";
import { useNavigate, useParams } from "react-router-dom";

const CourseContent: React.FC<{
  setSelectedClass: (classData: any) => void;
}> = ({ setSelectedClass }) => {
  const { "*": dynamicPath } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  // Get batch data from Redux
  const batch = useSelector((state: any) => state.batch.batchDataByName);
  const batchId = batch?.batchId;

  // Fetch batch module schedules when batchId is available
  useEffect(() => {
    if (!batchId) {
      console.warn("No batchId available! Skipping API call.");
      return;
    }

    console.log("Dispatching fetch action for batchId:", batchId);
    dispatch(fetchBatchClassScheduleByBatchIdRequest(batchId));
  }, [batchId, dispatch]);

  // Get batch module schedule from Redux
  const batchModuleSchedule = useSelector((state: any) =>
    batchId
      ? state.batchModuleSchedule?.batchModuleSchedulesByBatchId?.[batchId] ||
        []
      : []
  );

  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [selectedClass, setSelectedClassState] = useState<string | null>(null);

  // Fetch class data from Redux
  const classForModule = useSelector(
    (state: any) => state.classForModule.classByModule || []
  );

  // Extract module IDs from batchModuleSchedule
  const moduleIds = useMemo(
    () => batchModuleSchedule.map((schedule: any) => schedule.module.id),
    [batchModuleSchedule]
  );

  // Fetch class data only if moduleIds exist and haven't been fetched
  useEffect(() => {
    if (moduleIds.length > 0 && classForModule.length === 0) {
      dispatch(fetchClassByModuleRequest(moduleIds));
    }
  }, [moduleIds, classForModule.length, dispatch]);

  // Transform class data into an object { moduleId: [classes] }
  const moduleClasses = useMemo(() => {
    const classDataMap: { [key: number]: any[] } = {};
    if (Array.isArray(classForModule)) {
      classForModule.forEach((classArray: any[]) => {
        if (Array.isArray(classArray) && classArray.length > 0) {
          const moduleId = classArray[0].moduleId;
          classDataMap[moduleId] = classArray;
        }
      });
    }
    return classDataMap;
  }, [classForModule]);

  // Parse URL hash to extract module name and class ID
  useEffect(() => {
    try {
      console.log("Current URL Hash:", window.location.hash);

      const hashPart = window.location.hash || "";
      if (!hashPart || !hashPart.includes("#")) {
        console.warn("No valid hash found in URL.");
        return;
      }

      // Extract the part after the second #
      const moduleParts = hashPart.split("#");
      console.log("Module Parts:", moduleParts);

      if (moduleParts.length < 2) {
        console.warn(
          "Hash does not contain enough parts to extract module name."
        );
        return;
      }

      let moduleNameAndQuery = moduleParts[2];
      if (!moduleNameAndQuery) {
        console.warn("No module name found in hash.");
        return;
      }

      // Split module name and query params
      const queryIndex = moduleNameAndQuery.indexOf("?");
      let moduleName;
      let classId = null;

      if (queryIndex !== -1) {
        moduleName = moduleNameAndQuery.substring(0, queryIndex);
        const queryString = moduleNameAndQuery.substring(queryIndex);
        const params = new URLSearchParams(queryString);
        classId = params.get("classId");
        console.log("Extracted Class ID:", classId);
      } else {
        moduleName = moduleNameAndQuery;
      }

      console.log("Extracted Module Name (Encoded):", moduleName);

      // Decode the module name and remove leading slash if present
      const decodedModuleName = moduleName
        ? decodeURIComponent(moduleName).replace(/^\/+/, "")
        : "";
      console.log("Decoded Module Name (Cleaned):", decodedModuleName);

      // Find the module with this name
      if (decodedModuleName && Array.isArray(batchModuleSchedule)) {
        console.log(
          "Available Modules:",
          batchModuleSchedule.map((m) => m.module.moduleName)
        );

        const matchingModule = batchModuleSchedule.find((schedule: any) => {
          console.log(
            "Checking Module:",
            schedule.module.moduleName,
            "against",
            decodedModuleName
          );
          return schedule.module.moduleName === decodedModuleName;
        });

        console.log("Matching Module:", matchingModule);

        if (matchingModule) {
          const moduleId = matchingModule.module.id;
          console.log("Selected Module ID:", moduleId);

          setExpandedTopic(moduleId.toString());
          setSelectedModule(moduleId);
          dispatch(setSelectedModuleId(moduleId));

          // If class ID is present, find the class
          if (classId && moduleClasses[moduleId]) {
            console.log(
              "Available Classes for Module:",
              moduleClasses[moduleId]
            );

            const classObj = moduleClasses[moduleId].find(
              (c) => c.classId === classId
            );

            console.log("Matching Class:", classObj);

            if (classObj) {
              setSelectedClassState(classId);
              setSelectedClass(classObj);
            } else {
              console.warn("No matching class found for Class ID:", classId);
            }
          }
        } else {
          console.warn("No matching module found for:", decodedModuleName);
        }
      }
    } catch (error) {
      console.error("Error parsing URL:", error);
    }
  }, [batchModuleSchedule, moduleClasses, dispatch, setSelectedClass]);

  const handleModuleClick = (moduleId: number, moduleName: string) => {
    setExpandedTopic(
      expandedTopic === moduleId.toString() ? null : moduleId.toString()
    );
    setSelectedModule(moduleId);
    setSelectedClassState(null);
    dispatch(setSelectedModuleId(moduleId));
    navigate(`#/${encodeURIComponent(moduleName)}`);
  };

  const handleClassClick = (classItem: any, moduleName: string) => {
    setSelectedClass(classItem);
    setSelectedClassState(classItem.classId);
    navigate(
      `#/${encodeURIComponent(moduleName)}?classId=${encodeURIComponent(classItem.classId)}`
    );
  };

  return (
    <>
      <div className="sticky top-0 z-0 p-4">
        <h3 className="text-2xl font-bold">Course Modules</h3>
      </div>
      <div className="w-[400px] overflow-y-auto bg-white p-5 rounded-lg shadow-lg border-2 border-slate-300 h-[500px]">
        {!Array.isArray(batchModuleSchedule) ||
        batchModuleSchedule.length === 0 ? (
          <div className="text-center mt-5 text-gray-500">
            No modules available.
          </div>
        ) : (
          <div className="space-y-4 mt-5">
            {batchModuleSchedule.map((schedule: any, index: number) => (
              <div key={`module-${schedule.module.id}-${index}`}>
                {/* Module Title */}
                <div
                  className={`font-semibold text-lg cursor-pointer p-2 rounded-md flex justify-between items-center ${
                    selectedModule === schedule.module.id
                      ? "bg-gray-300"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() =>
                    handleModuleClick(
                      schedule.module.id,
                      schedule.module.moduleName
                    )
                  }
                >
                  <span>{`${String(index + 1).padStart(2, "0")}: ${schedule.module.moduleName}`}</span>
                  <div className="border-2 p-1 rounded-lg border-gray-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className={`transition-transform ${
                        expandedTopic === schedule.module.id.toString()
                          ? "rotate-180"
                          : ""
                      }`}
                    >
                      <path
                        d="M19 9l-7 7-7-7"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Expanded Module Details */}
                {expandedTopic === schedule.module.id.toString() && (
                  <div className="mt-2 bg-gray-100 rounded-lg p-2">
                    {moduleClasses[schedule.module.id]?.length > 0 ? (
                      <div className="mt-2 bg-[#eadcf1] p-3 rounded-lg">
                        <h4 className="font-semibold text-md mb-2">Classes:</h4>
                        {moduleClasses[schedule.module.id].map(
                          (classItem, classIndex) => (
                            <div
                            key={`class-${classItem.id}-${classIndex}`}
                            className={`flex items-start gap-4 p-4 rounded-lg shadow-md mb-2 cursor-pointer transition-all duration-200 ${
                              selectedClass === classItem.classId ? "bg-gray-300" : "hover:bg-gray-200"
                            }`}
                            onClick={() => handleClassClick(classItem, schedule.module.moduleName)}
                          >
                            {/* Play Button */}
                            <button className="flex items-center justify-center w-10 h-10 text-white bg-gray-800 rounded-full hover:bg-gray-900 hover:scale-105 transition-transform">
                              <FaPlay className="text-lg" />
                            </button>
                          
                            {/* Class Details */}
                            <div className="flex-1 min-h-[60px]">
                              <h5 className="text-md font-semibold">{classItem.classTitle}</h5>
                              <p className="text-gray-500 text-sm whitespace-normal break-words">
                                {classItem.classDescription}
                              </p>
                            </div>
                          </div>
                          
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm mt-2">
                        No classes available for this module.
                      </p>
                    )}
                  </div>
                )}
                <hr />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CourseContent;
