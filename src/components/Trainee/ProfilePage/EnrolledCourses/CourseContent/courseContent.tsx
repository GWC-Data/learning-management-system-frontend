import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchBatchModuleScheduleByBatchIdRequest } from "@/store/batchModuleSchedule/actions";
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

  // ✅ Fetch batch data using batchName instead of batchId
  const batch = useSelector((state: any) => state.batch.batchDataByName);
  const batchId = batch?.id; // ✅ Get batchId from fetched batch

  // ✅ Fetch batch module schedules from Redux
  const batchModuleSchedule = useSelector((state: any) =>
    batchId
      ? state.batchModuleSchedule?.batchModuleSchedulesByBatchId?.[batchId] ||
        []
      : []
  );
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [selectedClass, setSelectedClassState] = useState<number | null>(null);

  // ✅ Fetch class data from Redux
  const classForModule = useSelector(
    (state: any) => state.classForModule.classByModule
  );

  // ✅ Extract module IDs (memoized to prevent re-computation)
  const moduleIds = useMemo(
    () => batchModuleSchedule.map((schedule: any) => schedule.module.id),
    [batchModuleSchedule]
  );

  // ✅ API Call: Fetch batch module schedule only once
  useEffect(() => {
    if (batchId && batchModuleSchedule.length === 0) {
      dispatch(fetchBatchModuleScheduleByBatchIdRequest(batchId));
    }
  }, [batchId, batchModuleSchedule.length, dispatch]);

  // ✅ API Call: Fetch class data only if moduleIds exist and haven't been fetched
  useEffect(() => {
    if (moduleIds.length > 0 && classForModule.length === 0) {
      dispatch(fetchClassByModuleRequest(moduleIds));
    }
  }, [moduleIds, classForModule.length, dispatch]);

  // ✅ Memoize transformed class data into an object { moduleId: [classes] }
  const moduleClasses = useMemo(() => {
    const classDataMap: { [key: number]: any[] } = {};
    classForModule.forEach((classArray: any[]) => {
      if (classArray.length > 0) {
        const moduleId = classArray[0].moduleId;
        classDataMap[moduleId] = classArray;
      }
    });
    return classDataMap;
  }, [classForModule]);

  const parts = dynamicPath ? dynamicPath.split("/").filter(Boolean) : [];
  const batchName = parts[1]
    ? decodeURIComponent(parts[1]).replace(/%/g, " ")
    : "";
  console.log(batchName);

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
    setSelectedClassState(classItem.id);
    navigate(
      `#/${encodeURIComponent(moduleName)}?classId=${encodeURIComponent(classItem.id)}`
    );
  };

  return (
    <>
      <div className="sticky top-0 z-0 p-4">
        <h3 className="text-2xl font-bold">Course Modules</h3>
      </div>
      <div className="w-[400px] overflow-y-auto bg-white p-5 rounded-lg shadow-lg border-2 border-slate-300 h-[500px]">
        {batchModuleSchedule.length === 0 ? (
          <div className="text-center mt-5 text-gray-500">
            No modules available.
          </div>
        ) : (
          <div className="space-y-4 mt-5">
            {batchModuleSchedule.map((schedule: any, index: number) => (
              <div key={schedule.id}>
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
                        {moduleClasses[schedule.module.id].map((classItem) => (
                          <div
                            key={classItem.id}
                            className={`flex items-center p-3 rounded-lg shadow-md gap-4 mb-2 cursor-pointer transition ${
                              selectedClass === classItem.id
                                ? "bg-white"
                                : "hover:bg-gray-100"
                            }`}
                            onClick={() =>
                              handleClassClick(
                                classItem,
                                schedule.module.moduleName
                              )
                            }
                          >
                            {/* Play Button */}
                            <button className="flex items-center justify-center w-10 h-10 text-black bg-white rounded-full hover:bg-gray-200 transition">
                              <FaPlay className="text-lg" />
                            </button>

                            {/* Class Details */}
                            <div className="flex-1">
                              <h5 className="text-sm font-semibold">
                                {classItem.classTitle}
                              </h5>
                              <p className="text-gray-600 text-xs">
                                {classItem.classDescription}
                              </p>
                              <div>
                                <div className="bg-[#6e2b8b] rounded-xl px-4 py-1 flex items-center justify-center shadow-md w-44 mt-2">
                                  <h1 className="text-sm font-semibold text-white">
                                    {new Date(
                                      classItem.classDate
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </h1>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm mt-2">
                        No classes available for this module.
                      </p>
                    )}

                    {/* Resource Download Section */}
                    {schedule.module.materialForModule && (
                      <div className="mt-3 flex flex-cols gap-2 ml-8">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-600">Resources:</p>
                          <a
                            href={schedule.module.materialForModule}
                            download
                            className="text-blue-500 hover:underline text-sm"
                          >
                            Download Material
                          </a>
                        </div>
                      </div>
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
