import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { fetchBatchApi } from '@/helpers/api/batchApi';
import { fetchCourseApi } from '@/helpers/api/courseApi';
import { fetchUsersApi } from '@/helpers/api/userApi';
import { fetchAttendanceApi } from '@/helpers/api/attendance';


// Icons (you can replace these with any icon library you prefer)
const BatchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>;
const CourseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const ReportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;



type CardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
};

type TabContentProps = {
  tabId: string;
};


const DashboardCard: React.FC<CardProps> = ({ title, value, icon, color }) => {
  
  return (
    <div className="dashboard-card">
      <div className="card-icon" style={{ backgroundColor: `${color}20`, color }}>
        {icon}
      </div>
      <div className="card-content">
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </div>

  );
};

const DashboardContent: React.FC = () => {
  const [batchCount, setBatchCount] = useState<number>(0);
  const [courseCount, setCourseCount] = useState<number>(0);
  const [traineeCount, setTraineeCount] = useState<number>(0);

  useEffect(() => {
    const fetchApiData = async () => {
      try {
        const response = await fetchBatchApi();
        console.log("API Response:", response); // Debugging
  
        if (response?.batch && Array.isArray(response.batch)) {
          setBatchCount(response.batch.length);
        } else {
          console.error("Unexpected API response format", response);
        }
      } catch (error) {
        console.error("Error fetching batches:", error);
      }

      const fetchCourseApiData = await fetchCourseApi();
      console.log("fetchcourse", fetchCourseApiData);
      setCourseCount(fetchCourseApiData.length)

      const userApiData = await fetchUsersApi();
      console.log("User API Response:", userApiData);

      if (userApiData?.users && Array.isArray(userApiData.users)) {
        const filterUsers = userApiData.users.filter(
          (user: { roleName: string }) => user.roleName === "trainee"
        );

        console.log("Filtered Trainee Users:", filterUsers);
        setTraineeCount(filterUsers.length);
      }

      const attendanceApiData = await fetchAttendanceApi();
      console.log("attendance", attendanceApiData);
    };
    fetchApiData();
  }, []);


  const traineePerformanceData = [
    { name: 'John Doe', completion: 85, attendance: 90 },
    { name: 'Jane Smith', completion: 92, attendance: 95 },
    { name: 'Michael Lee', completion: 78, attendance: 88 },
    { name: 'Emily Johnson', completion: 95, attendance: 97 },
    { name: 'Chris Brown', completion: 80, attendance: 85 },
  ];
  

  return (
    <div className="dashboard-content">
      <h2 className='font-poppins font-bold text-2xl'>Dashboard Overview</h2>
      
      <div className="cards-container font-poppins mt-4">
        <DashboardCard 
          title="Total Batches" 
          value={batchCount} 
          icon={<BatchIcon />} 
          color="#4a6cf7" 
        />
        <DashboardCard 
          title="Active Courses" 
          value={courseCount}
          icon={<CourseIcon />} 
          color="#10b981" 
        />
        <DashboardCard 
          title="Total Trainees" 
          value={traineeCount}
          icon={<UserIcon />} 
          color="#f59e0b" 
        />
        <DashboardCard 
          title="Completion Rate" 
          value="0%" 
          icon={<ReportIcon />} 
          color="#ef4444" 
        />
      </div>

      <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Analytics & Reports</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Trainee Performance</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={traineePerformanceData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completion" fill="#8884d8" name="Completion %" />
              <Bar dataKey="attendance" fill="#82ca9d" name="Attendance %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
      
      <div className="dashboard-section mt-8">
        <div className="section-header">
          <h3>Upcoming Deadlines</h3>
        </div>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-date">Mar 20</div>
            <div className="timeline-content">
              <h4>Web Dev Cohort 4 - Module 2 Deadline</h4>
              <p>18 trainees need to submit their assignments</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-date">Mar 23</div>
            <div className="timeline-content">
              <h4>ML Engineering - Project Proposal Review</h4>
              <p>12 project proposals due for review</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-date">Mar 25</div>
            <div className="timeline-content">
              <h4>Cloud Certification - Practice Exam</h4>
              <p>Practice certification exam for 24 trainees</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TabContent: React.FC<TabContentProps> = ({ tabId }) => {
  switch (tabId) {
    default:
      return <DashboardContent />
  }
};

// Main Admin Dashboard Component
const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  return (
    <div className="admin-dashboard bg-gray-100">
      <div className="content-wrapper">
        <TabContent tabId={activeTab} />
      </div>
    </div>
  );
};

export default AdminDashboard;

