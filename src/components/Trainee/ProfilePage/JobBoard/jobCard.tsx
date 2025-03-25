import { motion } from "framer-motion";
import { fetchLinkedInJobsApi } from "@/helpers/api/linkedInApi";
import { useEffect, useState } from "react";

interface JobData {
  jobId: string;
  jobTitle: string;
  companyName: string;
  jobLink: string;
  jobLocation: string;
  datePosted: string;
  companyLogo: string;
  jobDescription?: string;
}

const JobCard = () => {
  const [jobDataList, setJobDataList] = useState<JobData[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [locations, setLocations] = useState<string[]>([]);
  const [datePeriods, setDatePeriods] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const jobBoard = async () => {
    setLoading(true);
    try {
      const response = await fetchLinkedInJobsApi();
      console.log("API Response:", response);

      // Remove duplicates based on jobId
      const uniqueJobs = response.linkedIn.filter(
        (job: any, index: number, self: any[]) =>
          index === self.findIndex((j: any) => j.jobId === job.jobId)
      );

      setJobDataList(uniqueJobs);
      setFilteredJobs(uniqueJobs);

      // Extract unique locations - fixed with proper typing
      const uniqueLocations: string[] = Array.from(
        new Set(uniqueJobs.map((job: JobData) => job.jobLocation))
      );
      setLocations(uniqueLocations);

      // Create date period options with your requested values
      setDatePeriods([
        "All",
        "This week",
        "1 week ago",
        "2 weeks ago",
        "3 weeks ago",
        "4 weeks ago",
        "1 month ago",
      ]);
    } catch (error) {
      console.error("Failed to fetch jobBoard", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    jobBoard();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [locationFilter, dateFilter, searchTerm, jobDataList]);

  // Helper function to estimate post date from text
  const estimatePostDate = (dateText: string): Date => {
    const today = new Date();
    const lowerDateText = dateText.toLowerCase();

    // Handle "just now", "today", "hours ago" cases
    if (
      lowerDateText.includes("just now") ||
      lowerDateText.includes("today") ||
      lowerDateText.includes("hour")
    ) {
      return today;
    }

    // Handle "yesterday" case
    if (lowerDateText.includes("yesterday")) {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return yesterday;
    }

    // Extract numbers from text - like "2 days ago", "3 weeks ago"
    const numbers = lowerDateText.match(/\d+/);
    const timeValue = numbers ? parseInt(numbers[0]) : 1;

    // Create a new date object to manipulate
    const postDate = new Date(today);

    // Adjust date based on period mentioned
    if (lowerDateText.includes("day")) {
      postDate.setDate(today.getDate() - timeValue);
    } else if (lowerDateText.includes("week")) {
      postDate.setDate(today.getDate() - timeValue * 7);
    } else if (lowerDateText.includes("month")) {
      postDate.setMonth(today.getMonth() - timeValue);
    } else if (lowerDateText.includes("year")) {
      postDate.setFullYear(today.getFullYear() - timeValue);
    }

    return postDate;
  };

// This is the modified applyFilters function with the corrected date filter logic
const applyFilters = () => {
  let filtered = [...jobDataList];

  // Apply search term filter
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (job) =>
        job.jobTitle.toLowerCase().includes(term) ||
        job.companyName.toLowerCase().includes(term) ||
        (job.jobDescription &&
          job.jobDescription.toLowerCase().includes(term))
    );
  }

  // Apply location filter
  if (locationFilter) {
    filtered = filtered.filter((job) => job.jobLocation === locationFilter);
  }

  // Apply date filter
  if (dateFilter && dateFilter !== "All") {
    const today = new Date();
    
    // Set cutoff date based on filter selection
    switch (dateFilter) {
      case "This week":
        // Start of the current week (Sunday)
        const day = today.getDay(); // 0 for Sunday, 1 for Monday, etc.
        const cutoffDate = new Date(today);
        cutoffDate.setDate(today.getDate() - day); // Go back to Sunday
        cutoffDate.setHours(0, 0, 0, 0);
        
        filtered = filtered.filter((job) => {
          const estimatedPostDate = estimatePostDate(job.datePosted);
          return estimatedPostDate >= cutoffDate;
        });
        break;
        
      case "1 week ago":
        // 1 week ago (not 2 weeks)
        // Get jobs from exactly 7 days ago, +/- 3 days (4-10 days ago range)
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);
        
        const oneWeekAgoStart = new Date(oneWeekAgo);
        oneWeekAgoStart.setDate(oneWeekAgo.getDate() - 3); // 10 days ago
        
        const oneWeekAgoEnd = new Date(oneWeekAgo);
        oneWeekAgoEnd.setDate(oneWeekAgo.getDate() + 3); // 4 days ago
        
        filtered = filtered.filter((job) => {
          const estimatedPostDate = estimatePostDate(job.datePosted);
          return estimatedPostDate >= oneWeekAgoStart && estimatedPostDate <= oneWeekAgoEnd;
        });
        break;
        
      case "2 weeks ago":
        // 2 weeks ago (not 3 weeks)
        // Get jobs from exactly 14 days ago, +/- 3 days (11-17 days ago range)
        const twoWeeksAgo = new Date(today);
        twoWeeksAgo.setDate(today.getDate() - 14);
        
        const twoWeeksAgoStart = new Date(twoWeeksAgo);
        twoWeeksAgoStart.setDate(twoWeeksAgo.getDate() - 3); // 17 days ago
        
        const twoWeeksAgoEnd = new Date(twoWeeksAgo);
        twoWeeksAgoEnd.setDate(twoWeeksAgo.getDate() + 3); // 11 days ago
        
        filtered = filtered.filter((job) => {
          const estimatedPostDate = estimatePostDate(job.datePosted);
          return estimatedPostDate >= twoWeeksAgoStart && estimatedPostDate <= twoWeeksAgoEnd;
        });
        break;
        
      case "3 weeks ago":
        // 3 weeks ago (not 4 weeks)
        // Get jobs from exactly 21 days ago, +/- 3 days (18-24 days ago range)
        const threeWeeksAgo = new Date(today);
        threeWeeksAgo.setDate(today.getDate() - 21);
        
        const threeWeeksAgoStart = new Date(threeWeeksAgo);
        threeWeeksAgoStart.setDate(threeWeeksAgo.getDate() - 3); // 24 days ago
        
        const threeWeeksAgoEnd = new Date(threeWeeksAgo);
        threeWeeksAgoEnd.setDate(threeWeeksAgo.getDate() + 3); // 18 days ago
        
        filtered = filtered.filter((job) => {
          const estimatedPostDate = estimatePostDate(job.datePosted);
          return estimatedPostDate >= threeWeeksAgoStart && estimatedPostDate <= threeWeeksAgoEnd;
        });
        break;
      
        case "4 weeks ago":
          // 4 weeks ago
          // Get jobs from exactly 28 days ago, +/- 3 days (25-31 days ago range)
          const fourWeeksAgo = new Date(today);
          fourWeeksAgo.setDate(today.getDate() - 28); // Exactly 28 days ago
          
          const fourWeeksAgoStart = new Date(fourWeeksAgo);
          fourWeeksAgoStart.setDate(fourWeeksAgo.getDate() - 3); // 31 days ago
          
          const fourWeeksAgoEnd = new Date(fourWeeksAgo);
          fourWeeksAgoEnd.setDate(fourWeeksAgo.getDate() + 3); // 25 days ago
          
          filtered = filtered.filter((job) => {
            const estimatedPostDate = estimatePostDate(job.datePosted);
            return estimatedPostDate >= fourWeeksAgoStart && estimatedPostDate <= fourWeeksAgoEnd;
          });
          break;

      case "1 month ago":
        // Jobs older than a month
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(today.getMonth() - 1);
        
        filtered = filtered.filter((job) => {
          const estimatedPostDate = estimatePostDate(job.datePosted);
          return estimatedPostDate <= oneMonthAgo;
        });
        break;
        
      default:
        break;
    }
  }

  setFilteredJobs(filtered);
};

  const renderJobType = (title: string) => {
    const title_lower = title.toLowerCase();
    if (title_lower.includes("react")) {
      return { name: "React", color: "bg-blue-100 text-blue-700" };
    } else if (title_lower.includes("angular")) {
      return { name: "Angular", color: "bg-red-100 text-red-700" };
    } else if (title_lower.includes("vue")) {
      return { name: "Vue", color: "bg-green-100 text-green-700" };
    } else if (title_lower.includes("node")) {
      return { name: "Node.js", color: "bg-green-100 text-green-700" };
    } else if (title_lower.includes("python")) {
      return { name: "Python", color: "bg-yellow-100 text-yellow-700" };
    } else if (title_lower.includes("java")) {
      return { name: "Java", color: "bg-orange-100 text-orange-700" };
    } else if (title_lower.includes("front")) {
      return { name: "Frontend", color: "bg-indigo-100 text-indigo-700" };
    } else if (title_lower.includes("back")) {
      return { name: "Backend", color: "bg-purple-100 text-purple-700" };
    } else if (title_lower.includes("full")) {
      return { name: "Full Stack", color: "bg-pink-100 text-pink-700" };
    } else if (title_lower.includes("ui") || title_lower.includes("ux")) {
      return { name: "UI/UX", color: "bg-teal-100 text-teal-700" };
    } else {
      return { name: "Full-time", color: "bg-green-100 text-green-700" };
    }
  };

  const clearFilters = () => {
    setLocationFilter("");
    setDateFilter("");
    setSearchTerm("");
  };

  return (
    <div className="mt-10 w-full p-6 -ml-10 bg-gradient-to-b from-white to-gray-50 rounded-xl shadow-xl">


      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for jobs, companies, or keywords..."
            className="w-full p-4 pr-12 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h3 className="text-lg font-bold text-indigo-800 mb-4">
          Filter Options
        </h3>
        <div className="flex flex-wrap gap-4">
          {/* Location Filter */}
          <div className="w-full sm:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <div className="relative">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-6 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
              >
                <option value="">All Locations</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Date Posted Filter */}
          <div className="w-full sm:w-64 ml-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Posted
            </label>
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-6 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
              >
                <option value="All">All</option>
                {datePeriods.slice(1).map((period) => (
                  <option key={period} value={period}>
                    {period}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(locationFilter || dateFilter || searchTerm) && (
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="p-2 px-4 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Filter Results Count */}
        <div className="mt-4 text-sm text-gray-600 flex items-center gap-2">
          <span className="bg-indigo-100 text-indigo-800 font-medium px-2 py-1 rounded-md">
            {filteredJobs.length}
          </span>
          jobs found{" "}
          {(locationFilter || dateFilter || searchTerm) &&
            "matching your criteria"}
        </div>
      </div>

      {/* Jobs Container */}
      <div className="jobs-container" style={{ minHeight: "500px" }}>
        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-md p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-xl text-gray-600">
              Finding the best opportunities for you...
            </p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md border border-gray-100">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <p className="text-xl text-gray-600 mb-4">
              No jobs found matching your criteria
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          /* Job Cards */
          <div className="space-y-6">
            {filteredJobs.map((jobData) => {
              const jobType = renderJobType(jobData.jobTitle);
              return (
                <motion.div
                  key={jobData.jobId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Company Logo */}
                    <div className="self-start rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-200 w-24 h-24 md:w-32 md:h-32">
                      {jobData.companyLogo &&
                      jobData.companyLogo !== "No image" ? (
                        <img
                          src={jobData.companyLogo}
                          alt={`${jobData.companyName} Logo`}
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-lg font-bold text-gray-400 bg-gray-100">
                          {jobData.companyName}
                        </div>
                      )}
                    </div>

                    {/* Job Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${jobType.color}`}
                        >
                          {jobType.name}
                        </span>
                        <span className="text-gray-500 text-sm flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                          {jobData.datePosted}
                        </span>
                      </div>

                      <h2 className="text-2xl font-bold text-[#474747] mt-2 transition-colors">
                        {jobData.jobTitle}
                      </h2>

                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-gray-700 text-lg">
                          {jobData.companyName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 mt-2 text-gray-600">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          ></path>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          ></path>
                        </svg>
                        <span>{jobData.jobLocation}</span>
                      </div>
                    </div>

                    {/* Apply Button (for larger screens) */}
                    <div className="hidden md:flex md:flex-col md:justify-center">
                      <a
                        href={jobData.jobLink}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#6E2B8B] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#eadcf1] hover:text-black transition shadow-sm flex items-center gap-2"
                      >
                        Apply Now
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          ></path>
                        </svg>
                      </a>
                    </div>
                  </div>

                  {/* Job Description */}
                  {jobData.jobDescription &&
                    jobData.jobDescription !== "No description" && (
                      <div className="mt-4 border-t border-gray-100 pt-4">
                        <p className="text-gray-700 line-clamp-3">
                          {jobData.jobDescription}
                        </p>
                      </div>
                    )}

                  {/* Apply Button (for mobile) */}
                  <div className="mt-4 md:hidden">
                    <a
                      href={jobData.jobLink}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-indigo-600 text-white w-full font-medium px-6 py-3 rounded-lg hover:bg-indigo-700 transition shadow-sm flex items-center justify-center gap-2"
                    >
                      Apply Now
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        ></path>
                      </svg>
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;