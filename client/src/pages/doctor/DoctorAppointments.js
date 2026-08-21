import React, { useCallback, useEffect, useState } from "react";
import { Table, Tag, message } from "antd";
import http from "../../api/http";

const statusColor = {
  pending: "gold",
  approved: "green",
  rejected: "red",
};

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAppointments = useCallback(async () => {
    try {
      const res = await http.get("/doctor/doctor-appointments");
      if (res.data.success) {
        setAppointments(res.data.data);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error("Unable to load appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAppointments();
  }, [getAppointments]);

  const handleStatus = async (record, status) => {
    try {
      const res = await http.post("/doctor/update-status", {
        appointmentsId: record._id,
        status,
      });
      if (res.data.success) {
        message.success(res.data.message);
        getAppointments();
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error("Something Went Wrong");
    }
  };

  const columns = [
    {
      title: "Patient",
      dataIndex: "userInfo",
      render: (userInfo) => (userInfo ? userInfo.name : "-"),
    },
    {
      title: "Date & Time",
      dataIndex: "date",
      render: (date, record) => `${date} ${record.time}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => <Tag color={statusColor[status]}>{status}</Tag>,
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) =>
        record.status === "pending" ? (
          <div className="d-flex gap-2">
            <button
              className="btn btn-success btn-sm"
              onClick={() => handleStatus(record, "approved")}
            >
              Approve
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleStatus(record, "rejected")}
            >
              Reject
            </button>
          </div>
        ) : (
          <span>-</span>
        ),
    },
  ];

  return (
    <>
      <h3 className="text-center">Appointments</h3>
      <div className="table-scroll">
        <Table
          columns={columns}
          dataSource={appointments}
          rowKey="_id"
          loading={loading}
        />
      </div>
    </>
  );
};

export default DoctorAppointments;
