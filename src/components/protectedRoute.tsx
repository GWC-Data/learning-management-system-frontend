import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const userRole = localStorage.getItem('role'); // Retrieve the user's role from localStorage
  console.log('User Role:', userRole); // Debugging
  console.log('Allowed Roles:', allowedRoles); // Debugging

  // Check if the user's role is in the allowed roles
  if (!allowedRoles.includes(userRole || '')) {
    console.log('hello role',userRole)
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
