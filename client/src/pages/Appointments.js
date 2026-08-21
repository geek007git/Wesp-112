import React, { useEffect, useState } from "react";
import { Table, Tag, message } from "antd";
import http, { apiError } from "../api/http";

const statusColor = {
  pending: "gold",
  approved: "green",
  rejected: "red",
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAppointments = async () => {
      try {
        const res = await http.get("/user/user-appointments");
        if (res.data.success) {
          setAppointments(res.data.data);
        }
      } catch (error) {
        message.error(apiError(error));
      } finally {
        setLoading(false);
      }
    };
    getAppointments();
  }, []);

  const columns = [
    {
      title: "Doctor",
      dataIndex: "doctorInfo",
      render: (doctorInfo) =>
        doctorInfo ? `Dr. ${doctorInfo.firstName} ${doctorInfo.lastName}` : "-",
    },
    {
      title: "Phone",
      dataIndex: "doctorInfo",
      key: "phone",
      render: (doctorInfo) => (doctorInfo ? doctorInfo.phone : "-"),
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

export default Appointments;
