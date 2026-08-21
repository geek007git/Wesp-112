import React from "react";
import { Tabs, message } from "antd";
import { useNavigate } from "react-router-dom";
import http from "../api/http";
import { useUser } from "../context/UserContext";

const Notification = () => {
  const { user, refresh } = useUser();
  const navigate = useNavigate();

  const handleMarkAllRead = async () => {
    try {
      const res = await http.post("/user/get-all-notification");
      if (res.data.success) {
        message.success(res.data.message);
        await refresh();
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error("Something Went Wrong");
    }
  };

  const handleDeleteAll = async () => {
    try {
      const res = await http.post("/user/delete-all-notification");
      if (res.data.success) {
        message.success(res.data.message);
        await refresh();
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error("Something Went Wrong");
    }
  };

  const goTo = (item) => {
    const path =
      (item.data && item.data.onClickPath) || item.onClickPath || item.onCLickPath;
    if (path) {
      navigate(path);
    }
  };

  const unread = (user && user.notification) || [];
  const read = (user && user.seennotification) || [];

  return (
    <>
      <h3 className="text-center">Notification</h3>
      <Tabs
        items={[
          {
            key: "0",
            label: `Unread (${unread.length})`,
            children: (
              <>
                <div className="d-flex justify-content-end">
                  <button
                    className="btn btn-link p-0"
                    onClick={handleMarkAllRead}
                  >
                    Mark All Read
                  </button>
                </div>
                {unread.length === 0 && <p>No unread notifications</p>}
                {unread.map((item, index) => (
                  <div
                    className="notification-card"
                    key={index}
                    onClick={() => goTo(item)}
                  >
                    {item.message}
                  </div>
                ))}
              </>
            ),
          },
          {
            key: "1",
            label: `Read (${read.length})`,
            children: (
              <>
                <div className="d-flex justify-content-end">
                  <button className="btn btn-link p-0" onClick={handleDeleteAll}>
                    Delete All
                  </button>
                </div>
                {read.length === 0 && <p>No read notifications</p>}
                {read.map((item, index) => (
                  <div
                    className="notification-card"
                    key={index}
                    onClick={() => goTo(item)}
                  >
                    {item.message}
                  </div>
                ))}
              </>
            ),
          },
        ]}
      />
    </>
  );
};

export default Notification;
