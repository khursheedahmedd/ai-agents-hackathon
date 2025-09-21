import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ allowedRole, role, children }) => {
  if (role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

export default ProtectedRoute;