import React, { useEffect, useState } from "react";
import { Spin, message } from "antd";
import http, { apiError } from "../../api/http";
import DoctorForm from "../../components/DoctorForm";

const Profile = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getDoctorInfo = async () => {
      try {
        const res = await http.post("/doctor/getDoctorInfo");
        if (res.data.success) {
          setDoctor(res.data.data);
        } else {
          message.error(res.data.message);
        }
      } catch (error) {
        message.error(apiError(error));
      } finally {
        setLoading(false);
      }
    };
    getDoctorInfo();
  }, []);

  const handleFinish = async (values) => {
    try {
      const res = await http.post("/doctor/updateProfile", values);
      if (res.data.success) {
        message.success(res.data.message);
        setDoctor(res.data.data);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error(apiError(error));
    }
  };

  if (loading) {
    return (
      <div style={{ display: "grid", placeItems: "center", padding: 40 }}>
        <Spin />
      </div>
    );
  }

  if (!doctor) {
    return <h4 className="text-center">Doctor profile not found</h4>;
  }

  return (
    <>
      <h3 className="text-center">Manage Profile</h3>
      <p className="text-center">
        Application status: <b>{doctor.status}</b>
      </p>
      <DoctorForm
        onFinish={handleFinish}
        initialValues={doctor}
        submitLabel="Update"
      />
    </>
  );
};

export default Profile;
