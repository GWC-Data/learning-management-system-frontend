import JobBoardHeader from "./jobBoardHeader";
import JobCard from "./jobCard";

const JobBoard = () => {
  return (
    <div className="w-full">
      <JobBoardHeader />
      <div className="ml-10">
        <JobCard />
      </div>
    </div>
  );
};

export default JobBoard;
