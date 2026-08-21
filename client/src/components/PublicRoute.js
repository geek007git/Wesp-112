import React from "react";
import { Navigate } from "react-router-dom";

// login / register are pointless while a token is present
const PublicRoute = ({ children }) => {
  if (localStorage.getItem("token")) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default PublicRoute;
