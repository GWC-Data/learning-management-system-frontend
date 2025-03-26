import React from "react";
import {
  HashRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";

import Home from "./components/Admin/Home/Home";
import Nav from "./components/Navbar/Nav";
import Footer from "./components/Footer/Footer";
import Login from "./components/Login/Login";
import ProtectedRoute from "./components/protectedRoute";

import Dashboard from "./components/Admin/Dashboard/Dashboard";
import UserManagement from "./components/Admin/Tables/userManagement";
import CourseTable from "./components/Admin/Tables/courseTables";
import AddUser from "./components/Admin/Tables/addUser";
import AllUsers from "./components/Admin/Tables/allUsers";
import CourseCategoryTable from "./components/Admin/Tables/courseCategory";
import ManageRoles from "./components/Admin/Tables/rolesTables";
import PermissionRoles from "./components/Admin/Tables/permissionTables";
import BatchTable from "./components/Admin/Tables/batchTable";
import CourseModuleTable from "./components/Admin/Tables/courseModule";
import BatchClassScheduleTable from "./components/Admin/Tables/manageBatchScheduleClass";
import Attendance from "./components/Admin/Tables/attendance";
// import Courses from './components/Tables/courseDropdown';
import TrainersActivityPage from "./components/Admin/Charts/trainersActivityPage";
import TraineeActivityPage from "./components/Admin/Charts/traineesActivityPage";
import JobBoard from './components/Admin/Tables/jobBoardTable';

import TrainerHelloWorld from "./components/Trainer/TrainerHelloWorld";
import ClassTable from "./components/Admin/Tables/classTable";
// import JobBoard from "./components/Trainee/ProfilePage/JobBoard/jobBoard";


interface AppRouterProps {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  userRole: string;
  setUserName: React.Dispatch<React.SetStateAction<string>>;
}

const AppRouter: React.FC<AppRouterProps> = ({
  isAuthenticated,
  setIsAuthenticated,
  userRole,
  setUserName,
}) => {
  return (
    <Router>
      <Nav
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
      />
      <Routes>
        {/* Admin Protected Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Home isAuthenticated={isAuthenticated} />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="courses" element={<CourseTable/>}/>
          <Route path="course-category" element={<CourseCategoryTable />} />
          <Route
            path="manage-roles-and-permissions"
            element={<ManageRoles />}
          />
          <Route path="manage-permissions" element={<PermissionRoles />} />
          <Route path="batch-management" element={<BatchTable />} />
          <Route path="course-module" element={<CourseModuleTable />} />
          <Route path="class" element={<ClassTable />} />

          <Route path="trainers-activity" element={<TrainersActivityPage />} />
          <Route path="trainees-activity" element={<TraineeActivityPage />} />
          <Route path="attendance" element={<Attendance />} />
       
          <Route
            path="manage-batch-schedules"
            element={<BatchClassScheduleTable />}
          />
          <Route path="allUsers" element={<AllUsers />}>
            <Route path=":roleName" element={<UserManagement />} />
            <Route path="add-user" element={<AddUser />} />
          </Route>
          
        </Route>

          {/* Trainee Protected Routes */}


        {/* Trainer Protected Routes */}
        <Route
          path="/trainer/*"
          element={
            <ProtectedRoute allowedRoles={["trainer"]}>
              <TrainerHelloWorld />
            </ProtectedRoute>
          }
        />

        {/* Role-based Redirection */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              userRole === "admin" ? (
                <Navigate to="/admin" replace />
              ) : userRole === "trainer" ? (
                <Navigate to="/trainer" replace />
              ) : userRole === "trainee" ? (
                <Navigate to="/trainee" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Login Route */}
        <Route
          path="/login"
          element={
            <Login
              setIsAuthenticated={setIsAuthenticated}
              setUserName={setUserName}
            />
          }
        />
      </Routes>
      <Toaster />
      <Footer />
    </Router>
  );
};

export default AppRouter;


