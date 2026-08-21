import React, { useCallback, useEffect, useState } from "react";
import { Col, Row, Empty, Spin, message } from "antd";
import { useNavigate } from "react-router-dom";
import http, { apiError } from "../api/http";
import DoctorCard from "../components/DoctorCard";

const HomePage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getDoctors = useCallback(async () => {
    try {
      const res = await http.get("/user/getAllDoctors");
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (error) {
      message.error(apiError(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getDoctors();
  }, [getDoctors]);

  return (
    <>
      <h3 className="text-center">Book an appointment</h3>
      {loading ? (
        <div style={{ display: "grid", placeItems: "center", padding: 40 }}>
          <Spin />
        </div>
      ) : doctors.length === 0 ? (
        <Empty description="No approved doctors yet" />
      ) : (
        <Row gutter={[16, 16]}>
          {doctors.map((doctor) => (
            <Col xs={24} sm={12} lg={8} key={doctor._id}>
              <DoctorCard
                doctor={doctor}
                onClick={() =>
                  navigate(`/doctor/book-appointment/${doctor._id}`)
                }
              />
            </Col>
          ))}
        </Row>
      )}
    </>
  );
};

export default HomePage;
