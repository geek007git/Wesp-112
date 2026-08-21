import React, { useEffect, useState } from "react";
import { Table, Tag, message } from "antd";
import http, { apiError } from "../../api/http";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const res = await http.get("/admin/getAllUsers");
        if (res.data.success) {
          setUsers(res.data.data);
        }
      } catch (error) {
        message.error(apiError(error));
      } finally {
        setLoading(false);
      }
    };
    getUsers();
  }, []);

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    {
      title: "Role",
      dataIndex: "isDoctor",
      render: (isDoctor, record) => (
        <Tag color={record.isAdmin ? "purple" : isDoctor ? "blue" : "default"}>
          {record.isAdmin ? "Admin" : isDoctor ? "Doctor" : "User"}
        </Tag>
      ),
    },
  ];

  return (
    <>
      <h3 className="text-center">Users List</h3>
      <div className="table-scroll">
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
        />
      </div>
    </>
  );
};

export default Users;
