import { SetStateAction, useEffect, useState } from 'react';
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { ColDef } from "ag-grid-community";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../../../components/ui/tooltip";
import { Button } from "../../ui/button";
import { Edit, Trash, Eye } from "lucide-react";
import {
  createLinkedInJobApi,
  deleteLinkedInJobApi,
  fetchLinkedInJobsApi
} from '@/helpers/api/linkedInApi';

interface JobTableProps {
  editable?: true;
}

interface JobData {
  id: string;
  title: string;
  company: string;
  link: string;
  carrierPathLink: string;
  location: string;
  datePosted: string;
  entityURN: string;
  jobDescription: string;
  imgSrc: string | File;
};

// Helper to get the token from local storage
const getToken = () => localStorage.getItem("authToken");

const JobBoards = ({ editable = true }: JobTableProps) => {
  const [jobData, setJobData] = useState<JobData[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(652);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<JobData | null>(null);
  const [colDefs, setColDefs] = useState<ColDef[]>([]);
  const [viewingJob, setViewingJob] =
    useState<JobData | null>(null);
  const [newJob, setNewJob] = useState<JobData>({
    id: "",
    title: "",
    company: "",
    link: "",
    carrierPathLink: "",
    location: "",
    datePosted: "",
    entityURN: "",
    jobDescription: "",
    imgSrc: ""
  });

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setUploadedFile(file);
    setNewJob({ ...newJob, imgSrc: file });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  {/* pagination */ }
  const recordsPerPage = 10;
  const totalPages = Math.ceil(jobData.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentData = jobData.slice(startIndex, startIndex + recordsPerPage);

  const handlePageChange = (newPage: SetStateAction<number>) => {
    setCurrentPage(newPage);
  };

  const fetchJobData = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to view jobs.");
      return;
    }

    try {
      setLoading(true);
      const jobResponse = await fetchLinkedInJobsApi();
      console.log("response", jobResponse);

      const jobs = jobResponse.linkedIn.map((job: any) => ({
        id: job.jobId || "",
        title: job.jobTitle || "",
        company: job.companyName || "",
        link: job.jobLink || "",
        carrierPathLink: job.carrierPathLink || "",
        location: job.jobLocation || "",
        datePosted: job.datePosted || "",
        entityURN: job.entityURN || "",
        jobDescription: job.jobDescription || "",
        imgSrc: job.companyLogo || "No image"
      }));

      console.log("jobs", jobs);
      setJobData(jobs);
    } catch (error) {
      console.error("Failed to fetch jobs", error);
      toast.error("Failed to fetch jobs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobData();
  }, []);

  // Open modal to add a new course
  const addNewRow = () => {
    setEditing(false);
    setNewJob({
      id: "",
      title: "",
      company: "",
      link: "",
      carrierPathLink: "",
      location: "",
      datePosted: "",
      entityURN: "",
      jobDescription: "",
      imgSrc: ""
    });
    setIsModalOpen(true);
  };

  // Function to handle viewing a row
  const handleViewJobs = (data: JobData) => {
    setViewingJob(data); // Set the row data to state
    setIsModalOpen(true); // Open the modal
    setIsModalOpen(false); // Close the modal
  };

  const editJob = (data: any) => {
    setEditing(true);
    setNewJob(data);
    setNewJob({
      id: data.id,
      title: data.title,
      company: data.company,
      link: data.link,
      carrierPathLink: data.carrierPathLink,
      location: data.location,
      datePosted: data.datePosted,
      entityURN: data.entityURN,
      jobDescription: data.jobDescription,
      imgSrc: data.imgSrc
    });
    setIsModalOpen(true);
  };


  const confirmDeleteJob = (data: JobData) => {
    const job = jobData.find((job) => job.id === data.id);
    if (job) {
      setJobToDelete(job);
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) {
      toast.error("No job Selected for deletion")
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to delete a course.");
      return;
    }

    try {

      await deleteLinkedInJobApi(jobToDelete.id);
      setJobData((prev) => prev.filter((job) => job.id !== jobToDelete.id));
      toast.success("Job deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete the job. Please try again later.");
    } finally {
      setIsDeleteModalOpen(false);
      setJobToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setJobToDelete(null);
  };

  // Close the modal
  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewJob({
      id: "",
      title: "",
      company: "",
      link: "",
      carrierPathLink: "",
      location: "",
      datePosted: "",
      entityURN: "",
      jobDescription: "",
      imgSrc: ""
    });
  };


  // Handle form submission (Create or Update)
  const handleFormSubmit = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to perform this action.");
      return;
    }

    try {
      if (editing) {
        // await updateLinkedInJobApi(newJob.id, {
        //   title: newJob.title,
        //   company: newJob.company,
        //   link: newJob.link,
        //   carrierPathLink: newJob.carrierPathLink,
        //   location: newJob.location,
        //   datePosted: newJob.datePosted,
        //   entityURN: newJob.entityURN,
        //   jobDescription: newJob.jobDescription,
        //   imgSrc: newJob.imgSrc,
        // });
        fetchJobData();
        toast.success("Job updated successfully!");
      } else {
        const formData = new FormData();
        formData.append("title", newJob.title);
        formData.append("company", newJob.company);
        formData.append("link", newJob.link);
        formData.append("carrierPathLink", newJob.carrierPathLink);
        formData.append("location", newJob.location);
        formData.append("datePosted", newJob.datePosted);
        formData.append("entityURN", newJob.entityURN);
        formData.append("jobDescription", newJob.jobDescription);

        // Ensure imgSrc is a File object before appending
        if (newJob.imgSrc instanceof File) {
          formData.append("imgSrc", newJob.imgSrc);
        }

        await createLinkedInJobApi(formData);
        toast.success("Job added successfully!");
      }

      fetchJobData();
    } catch (error) {
      console.error("Failed to update job", error);
      toast.error("Failed to update the job. Please try again later.");
    }

    handleModalClose();
  };


  useEffect(() => {
    setColDefs([
      { headerName: "Job Title", field: "title", editable: false, width: 250 },
      { headerName: "Company Name", field: "company", editable: false, width: 170 },
      {
        headerName: "Apply Link",
        field: "link",
        editable: false,
        width: 140,
        cellRenderer: (params: any) => params.value ?
          <a href={params.value} target="_blank" rel="noopener noreferrer">Apply</a> : ''
      },
      { headerName: "Carrier PathLink", field: "carrierPathLink", editable: false, width: 170, cellRenderer: (params: any) => params.value ? `<a href="${params.value}" target="_blank">View</a>` : '' },
      { headerName: "Location", field: "location", editable: false, width: 200 },
      { headerName: "Date Posted", field: "datePosted", editable: false, width: 150 },
      { headerName: "Job Description", field: "jobDescription", editable: false, width: 160 },
      {
        headerName: "Actions",
        field: "actions",
        width: 180,
        cellRenderer: (params: any) => (
          <div className="flex space-x-2">
            <TooltipProvider>
              <Button onClick={() => handleViewJobs(params)} className="text-[#6E2B8B] bg-white hover:bg-white p-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    {/* <img src={Module} alt="Module Icon" className="h-6 w-6 filter fill-current text-[#6E2B8B]" /> */}
                  </TooltipTrigger>
                  <TooltipContent>View Jobs</TooltipContent>
                </Tooltip>
              </Button>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => editJob(params.data)}
                    className="bg-white text-[#6E2B8B] p-2 rounded hover:bg-white"
                  >
                    <Edit className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit Job</TooltipContent>
              </Tooltip>

              {/* Delete Button with Tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => confirmDeleteJob(params.data)}
                    className="text-red-600 bg-white p-2 rounded hover:bg-white"
                  >
                    <Trash className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete Job</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
        editable: false,
      },
    ]);
  }, [jobData])

  return (

    <div className="flex-1 p-4 mt-5 ml-20">
      <div className="text-gray-600 text-lg mb-4">
      </div>
      <div className="flex items-center justify-between bg-[#6E2B8B] text-white px-6 py-4 rounded-lg shadow-lg mb-6 w-[1159px]">
        <div className="flex flex-col">
          <h2 className="text-2xl font-metropolis font-semibold tracking-wide">Jobs Management</h2>
          <p className="text-sm font-metropolis font-medium">Manage Jobs easily.</p>
        </div>
        <Button onClick={addNewRow}
          className="bg-yellow-400 text-gray-900 font-metropolis font-semibold px-5 py-2 rounded-md shadow-lg hover:bg-yellow-500 transition duration-300">
          + Add Job
        </Button>
      </div>


      {isDeleteModalOpen && jobToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-auto">
            <h2 className="text-xl font-metropolis font-semibold mb-4">Confirm Job</h2>
            <p className="mb-4 font-metropolis font-medium">
              Are you sure you want to delete the Job {" "}
              <strong>
                {jobToDelete?.title?.charAt(0).toUpperCase() +
                  jobToDelete?.title?.slice(1).toLowerCase() || "this job"}
              </strong>
              ?
            </p>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                onClick={handleDeleteJob}
                className="bg-[#6E2B8B] hover:bg-[#8536a7] text-white px-4 py-2 
                        transition-all duration-500 ease-in-out 
                       rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
              >
                Delete
              </Button>
              <Button
                onClick={handleCancelDelete}
                className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 transition-all duration-500 ease-in-out 
                       rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="ag-theme-quartz font-poppins"
        style={{ height: "70vh", width: "91%" }}>
        <AgGridReact
          rowSelection="multiple"
          suppressRowClickSelection
          suppressMovableColumns
          loading={loading}
          columnDefs={colDefs}
          rowData={jobData}
          defaultColDef={{ editable, sortable: true, filter: true, resizable: true }}
          animateRows
        />
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-4">
        {/* Previous Page Button */}
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          className={`px-4 py-2 rounded-l-md border bg-gray-300 text-gray-700 hover:bg-gray-400 ${currentPage === 1 && "cursor-not-allowed opacity-50"}`}
        >
          Previous
        </button>

        {/* Page Information */}
        <span className="px-4 py-2 border-t border-b text-gray-700">
          Page {currentPage} of {totalPages}
        </span>

        {/* Next Page Button */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          className={`px-4 py-2 rounded-r-md border bg-gray-300 text-gray-700 hover:bg-gray-400 ${currentPage === totalPages && "cursor-not-allowed opacity-50"}`}
        >
          Next
        </button>

        {/* Go to Last Page Button */}
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`ml-4 px-4 py-2 border bg-gray-300 text-gray-700 hover:bg-gray-400 ${currentPage === totalPages && "cursor-not-allowed opacity-50"}`}
        >
          Last Page
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[650px]">
            <h2 className="text-xl font-metropolis font-semibold">{editing ? "Edit Job" : "Add NewJob"}</h2>
            <form>
              <div className="flex space-x-4 mt-4">
                {/* Job Title */}
                <div className="w-1/2">
                  <label className="block font-metropolis font-medium">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded font-metropolis mt-1 p-2 text-gray-700 font-semibold"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  />
                </div>

                {/* Company Name */}
                <div className="w-1/2">
                  <label className="block font-metropolis font-medium">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded mt-1 p-2 font-metropolis text-gray-700 font-semibold"
                    value={newJob.company}
                    onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-4">
                <div className="w-1/2">
                  <label className="block font-metropolis font-medium">Apply Link </label>
                  <input
                    type="text"
                    className="w-full border rounded mt-1 p-2 font-metropolis text-gray-400 font-semibold"
                    value={newJob.link}
                    onChange={(e) => setNewJob({ ...newJob, link: e.target.value })}
                  />
                </div>

                <div className="w-1/2">
                  <label className="block font-metropolis font-medium">CarrierPath Link <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="paste page URL"
                    className="w-full border mt-1 rounded p-2 font-metropolis text-gray-700"
                    value={newJob.carrierPathLink}
                    onChange={(e) => setNewJob({ ...newJob, carrierPathLink: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-4">
                {/* Location */}
                <div className="w-1/2">
                  <label className="block font-metropolis font-medium">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter location"
                    className="w-full border mt-1 rounded p-2 font-metropolis text-gray-700"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  />
                </div>

                {/* Date Posted */}
                <div className="w-1/2">
                  <label className="block font-metropolis font-medium">
                    Date Posted <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full border mt-1 rounded p-2 font-metropolis text-gray-700"
                    value={newJob.datePosted}
                    onChange={(e) => setNewJob({ ...newJob, datePosted: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-4 mt-4">
                <label className="block font-metropolis font-medium">Entity URN <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="paste page URL"
                  className="w-full border mt-1 rounded p-2 font-metropolis text-gray-700"
                  value={newJob.entityURN}
                  onChange={(e) => setNewJob({ ...newJob, entityURN: e.target.value })}
                />
              </div>

              <div className="mb-4 mt-4">
                <label className="block font-metropolis font-medium">Job Description</label>
                <input
                  type="text"
                  placeholder="paste page URL"
                  className="w-full border mt-1 rounded p-2 font-metropolis text-gray-700"
                  value={newJob.jobDescription}
                  onChange={(e) => setNewJob({ ...newJob, jobDescription: e.target.value })}
                />
              </div>

              <div className="mb-4">
                <label className="block font-metropolis font-medium">
                  Job Image <span className="text-red-500">*</span>
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded p-4 mt-1 h-30 text-center cursor-pointer 
    ${isDragActive ? "border-blue-500" : "border-gray-300"}`}
                >
                  <input {...getInputProps()} />

                  {/* ✅ Show Uploaded Image Preview (New File Upload) */}
                  {uploadedFile ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={URL.createObjectURL(uploadedFile)}
                        alt="Uploaded Course"
                        className="h-24 w-30 object-cover rounded border"
                      />
                      <p className="text-green-600 font-metropolis font-semibold mt-2">
                        {uploadedFile.name}
                      </p>
                    </div>
                  ) :
                    /* ✅ Show Existing Course Image from API (if available) */
                    newJob.imgSrc ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={typeof newJob.imgSrc === "string"
                            ? newJob.imgSrc
                            : URL.createObjectURL(newJob.imgSrc)}
                          alt="Course"
                          className="h-20 w-20 object-cover rounded border"
                        />
                        <p className="text-gray-500 font-metropolis font-semibold mt-4">
                          Existing Image
                        </p>
                      </div>
                    ) : (
                      /* ✅ Show Placeholder Text When No Image is Uploaded */
                      <p className="text-gray-400 font-semibold mt-3 p-4">
                        Drag & drop a file here, or click to select one
                      </p>
                    )}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  onClick={handleFormSubmit}
                  className="bg-[#6E2B8B] hover:bg-[#8536a7] text-white px-4 py-2 
                transition-all duration-500 ease-in-out 
               rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
                >
                  {editing ? "Update Job" : "Create Job"}
                </Button>
                <Button
                  onClick={handleModalClose}
                  className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 transition-all duration-500 ease-in-out 
               rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default JobBoards;
