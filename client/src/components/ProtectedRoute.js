import React from "react";
import { Navigate } from "react-router-dom";
import { Spin } from "antd";
import { useUser } from "../context/UserContext";
import Layout from "./Layout";

// gates on the token first, then on the role flags the route asks for
const ProtectedRoute = ({ children, requireAdmin, requireDoctor }) => {
  const { user, loading } = useUser();

  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }
  if (loading) {
    return (
      <div style={{ display: "grid", placeItems: "center", height: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }
  if (requireDoctor && !user.isDoctor) {
    return <Navigate to="/" replace />;
  }
  return <Layout>{children}</Layout>;
};

export default ProtectedRoute;
