import React, { useState } from "react";
import { Alert, Card, message } from "antd";
import http, { apiError } from "../../api/http";
import "../../styles/DemoData.css";

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

  const demoDoctors = details?.doctors || (details?.doctor ? [details.doctor] : []);

  return (
    <section className="demo-data-page">
      <span className="section-kicker">PRESENTATION TOOLS</span>
      <h1>Demo workspace</h1>
      <p className="demo-page-intro">Prepare a realistic clinic directory and appointment activity for a product walkthrough.</p>

      <Card className="demo-data-card" bordered={false}>
        <div className="demo-card-heading">
          <span className="demo-sparkle" aria-hidden="true">✦</span>
          <div><h2>Sample clinic data</h2><p>One click sets up a complete, reusable demo environment.</p></div>
        </div>
        <div className="demo-inventory">
          <div><strong>06</strong><span>approved doctors</span></div>
          <div><strong>02</strong><span>sample patients</span></div>
          <div><strong>04</strong><span>appointments</span></div>
        </div>
        <p className="demo-idempotent-note">Running this again refreshes the same demo profiles and activity without creating duplicates.</p>
        <button className="btn btn-primary demo-create-button" type="button" onClick={createDemoData} disabled={loading}>
          <span aria-hidden="true">✦</span> {loading ? "Preparing demo data…" : "Create demo data"}
        </button>

        {details && (
          <Alert
            className="demo-ready-alert"
            type="success"
            showIcon
            message="Your demo accounts are ready"
            description={
              <div className="demo-credentials">
                <p>Use the shared password <code>{details.password}</code> to sign in.</p>
                <strong>Doctor accounts</strong>
                <ul>{demoDoctors.map((email) => <li key={email}>{email}</li>)}</ul>
                <div className="demo-other-accounts"><span>Patient: {details.patient}</span><span>Admin: {details.admin}</span></div>
              </div>
            }
          />
        )}
      </Card>
    </section>
  );
};

export default DemoData;
