import React, { useCallback, useEffect, useState } from "react";
import { Table, Tag, message } from "antd";
import http from "../../api/http";

const statusColor = {
  pending: "gold",
  approved: "green",
  rejected: "red",
};

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const getDoctors = useCallback(async () => {
    try {
      const res = await http.get("/admin/getAllDoctors");
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (error) {
      message.error("Unable to load doctors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getDoctors();
  }, [getDoctors]);

  const handleAccountStatus = async (record, status) => {
    try {
      const res = await http.post("/admin/changeAccountStatus", {
        doctorId: record._id,
        status,
      });
      if (res.data.success) {
        message.success(res.data.message);
        getDoctors();
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error("Something Went Wrong");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (text, record) => `Dr. ${record.firstName} ${record.lastName}`,
    },
    { title: "Specialization", dataIndex: "specialization" },
    { title: "Phone", dataIndex: "phone" },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => <Tag color={statusColor[status]}>{status}</Tag>,
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => (
        <div className="d-flex gap-2">
          {record.status !== "approved" && (
            <button
              className="btn btn-success btn-sm"
              onClick={() => handleAccountStatus(record, "approved")}
            >
              Approve
            </button>
          )}
          {record.status !== "rejected" && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleAccountStatus(record, "rejected")}
            >
              Reject
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <h3 className="text-center">Doctors List</h3>
      <div className="table-scroll">
        <Table
          columns={columns}
          dataSource={doctors}
          rowKey="_id"
          loading={loading}
        />
      </div>
    </>
  );
};

export default Doctors;
