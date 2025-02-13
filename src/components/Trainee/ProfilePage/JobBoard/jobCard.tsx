import { motion } from "framer-motion";
import { fetchJobBoardsApi } from "@/helpers/api/jobBoardApi";
import { useEffect, useState } from "react";

interface JobData {
  jobType: string;
  jobRole: string;
  companyInfo: {
    companyImg: string;
    companyName: string;
  };
  jobRoleDesc: string;
  jobLocation: string;
  experience: string;
  salary: string;
  jobLink: string;
}

const JobCard = () => {
  // State to store the job data from API
  const [jobDataList, setJobDataList] = useState<JobData[]>([]);

  // Fetch job data from API
  const jobBoard = async () => {
    try {
      const response = await fetchJobBoardsApi();
      console.log(response);
      setJobDataList(response); // Set the response data into the state
    } catch (error) {
      console.error("Failed to fetch jobBoard", error);
    }
  };

  useEffect(() => {
    jobBoard();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      className="mt-10 w-[1250px] mx-auto p-6 bg-white rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
    >
      {jobDataList.map((jobData, index) => (
        <div key={index}>
          <div className="flex flex-col-2 gap-4">
            <div className="border-2 border-gray-400 w-44 flex justify-center h-28">
              <img
                src={jobData.companyInfo.companyImg}
                alt="companyImg"
                className="w-32 h-20 mt-2"
              />
            </div>
            <div>
              <div className="bg-green-100 w-20 p-1 mt-1">
                <p className="text-green-700">{jobData.jobType}</p>
              </div>

              <h2 className="text-2xl font-bold text-[#130342]">
                {jobData.jobRole}
              </h2>
              <p className="text-gray-600 text-xl">
                {jobData.companyInfo.companyName}
              </p>
            </div>
          </div>

          <p className="text-lg mt-2 text-gray-700 mb-2">
            {jobData.jobRoleDesc}
          </p>

          <hr />

          <div className="grid grid-cols-2">
            <div className="mt-4 flex flex-row gap-10 items-center">
              <div className="flex flex-col items-center">
                <p className="text-md font-medium text-gray-600">Location</p>
                <span className="font-normal">{jobData.jobLocation}</span>
              </div>

              {/* Vertical Line */}
              <div className="w-[1px] bg-gray-400 h-[40px]"></div>

              <div className="flex flex-col items-center">
                <p className="text-md font-medium text-gray-600">Experience</p>
                <span className="font-normal">{jobData.experience}</span>
              </div>

              {/* Vertical Line */}
              <div className="w-[1px] bg-gray-400 h-[40px]"></div>

              <div className="flex flex-col items-center">
                <p className="text-md font-medium text-gray-600">Salary</p>
                <span className="font-normal">{jobData.salary + " "}LPA</span>
              </div>
            </div>
            {/* Push "View Details" to the right */}
            <div className="flex justify-end text-right text-white font-semibold cursor-pointer  mt-5">
              <a
                href={jobData.jobLink}
                target="_blank"
                rel="noreferrer"
                className=" bg-[#130342] flex flex-col-2 gap-2 p-3 rounded-lg hover:underline"
              >
                Apply Now
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#FFFFFF"
                >
                  <path d="M240-40q-33 0-56.5-23.5T160-120v-440q0-33 23.5-56.5T240-640h120v80H240v440h480v-440H600v-80h120q33 0 56.5 23.5T800-560v440q0 33-23.5 56.5T720-40H240Zm200-280v-447l-64 64-56-57 160-160 160 160-56 57-64-64v447h-80Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  );
};

export default JobCard;
