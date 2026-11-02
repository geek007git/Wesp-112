import React, { useState } from "react";
import { Alert, Card, message } from "antd";
import http, { apiError } from "../../api/http";

const DemoData = () => {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);

  const createDemoData = async () => {
    setLoading(true);
    try {
      const res = await http.post("/admin/seed-demo-data");
      if (!res.data.success) throw new Error(res.data.message);
      setDetails(res.data.accounts);
      message.success("Demo data is ready");
    } catch (error) {
      message.error(apiError(error, "Could not create demo data"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <h3 className="text-center">Demo Data</h3>
      <Card>
        <p>
          Create a presentation-ready set of three approved doctors, two
          patients, four appointments, and notifications. Running this again
          safely refreshes the same demo records without duplicating them.
        </p>
        <button
          className="btn btn-primary"
          type="button"
          onClick={createDemoData}
          disabled={loading}
        >
          {loading ? "Creating demo data…" : "Create demo data"}
        </button>
        {details && (
          <Alert
            style={{ marginTop: 20 }}
            type="success"
            showIcon
            message="Demo accounts are ready"
            description={
              <span>
                Patient: {details.patient} · Doctor: {details.doctor} · Admin: {details.admin}
                <br />Password: {details.password}
              </span>
            }
          />
        )}
      </Card>
    </div>
  );
};

export default DemoData;
