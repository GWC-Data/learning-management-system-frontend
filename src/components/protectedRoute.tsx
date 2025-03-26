// import React from 'react';
// import { Navigate } from 'react-router-dom';

// interface ProtectedRouteProps {
//   allowedRoles: string[];
//   children: React.ReactNode;
// }

// const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
//   const userRole = localStorage.getItem('role'); // Retrieve the user's role from localStorage
//   console.log('User Role:', userRole); // Debugging
//   console.log('Allowed Roles:', allowedRoles); // Debugging

//   // Check if the user's role is in the allowed roles
//   if (!allowedRoles.includes(userRole || '')) {
//     console.log('hello role',userRole)
//     return <Navigate to="/login" replace />;
//   }

//   return <>{children}</>;
// };

// export default ProtectedRoute;



import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const authToken = localStorage.getItem("authToken");
  const userRole = localStorage.getItem("role") || "";

  // Redirect to login if user is not authenticated
  if (!authToken) {
    return <Navigate to="/login" replace />;
  }

  // Redirect if user role is not allowed
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />; // Redirect to a proper Unauthorized page
  }

  return <>{children}</>;
};

export default ProtectedRoute;
