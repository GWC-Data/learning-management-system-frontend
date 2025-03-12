import { motion } from "framer-motion";
import JobBoardHeader from "./jobBoardHeader";
import JobCard from "./jobCard";

const JobBoard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex flex-col items-start w-full"
    >
      <JobBoardHeader />
      <div className="ml-10 flex justify-start">
        <JobCard />
      </div>
    </motion.div>
  );
};

export default JobBoard;
