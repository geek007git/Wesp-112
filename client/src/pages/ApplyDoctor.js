import React from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import http, { apiError } from "../api/http";
import DoctorForm from "../components/DoctorForm";
import { useUser } from "../context/UserContext";

const ApplyDoctor = () => {
  const navigate = useNavigate();
  const { refresh } = useUser();

  const handleFinish = async (values) => {
    try {
      const res = await http.post("/user/apply-doctor", values);
      if (res.data.success) {
        message.success(res.data.message);
        await refresh();
        navigate("/");
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error(apiError(error));
    }
  };

  return (
    <>
      <h3 className="text-center">Apply Doctor</h3>
      <DoctorForm onFinish={handleFinish} submitLabel="Submit Application" />
    </>
  );
};

export default ApplyDoctor;
