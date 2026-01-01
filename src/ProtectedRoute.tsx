import React from "react";
import { Navigate, useLocation } from "react-router";

interface ProtectedRouteProps {
  children: React.ReactNode;
  isLoggedIn: boolean;
  isRoleAllowed: () => boolean;
}
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, isLoggedIn ,isRoleAllowed}) => {
  const location=useLocation();


  if (!isLoggedIn ) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!isRoleAllowed()) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
export default ProtectedRoute;