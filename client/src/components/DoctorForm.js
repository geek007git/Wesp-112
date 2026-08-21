import React from "react";
import { Col, Form, Input, Row, TimePicker } from "antd";
import dayjs from "dayjs";

// shared by "Apply Doctor" and the doctor's own profile page
const DoctorForm = ({ onFinish, initialValues, submitLabel }) => {
  const values = initialValues
    ? {
        ...initialValues,
        timings:
          initialValues.timings && initialValues.timings.length === 2
            ? [
                dayjs(initialValues.timings[0], "HH:mm"),
                dayjs(initialValues.timings[1], "HH:mm"),
              ]
            : undefined,
      }
    : undefined;

  const handleFinish = (formValues) => {
    onFinish({
      ...formValues,
      feesPerConsultation: Number(formValues.feesPerConsultation),
      timings: [
        formValues.timings[0].format("HH:mm"),
        formValues.timings[1].format("HH:mm"),
      ],
    });
  };

  return (
    <Form
      layout="vertical"
      onFinish={handleFinish}
      initialValues={values}
      key={initialValues ? initialValues._id : "new"}
    >
      <h4>Personal Details</h4>
      <Row gutter={20}>
        <Col xs={24} md={12} lg={8}>
          <Form.Item
            label="First Name"
            name="firstName"
            rules={[{ required: true, message: "first name is required" }]}
          >
            <Input placeholder="your first name" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[{ required: true, message: "last name is required" }]}
          >
            <Input placeholder="your last name" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Form.Item
            label="Phone No"
            name="phone"
            rules={[{ required: true, message: "phone no is required" }]}
          >
            <Input placeholder="your contact no" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "email is required" },
              { type: "email", message: "enter a valid email" },
            ]}
          >
            <Input placeholder="your email address" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Form.Item label="Website" name="website">
            <Input placeholder="your website" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true, message: "address is required" }]}
          >
            <Input placeholder="your clinic address" />
          </Form.Item>
        </Col>
      </Row>
      <h4>Professional Details</h4>
      <Row gutter={20}>
        <Col xs={24} md={12} lg={8}>
          <Form.Item
            label="Specialization"
            name="specialization"
            rules={[{ required: true, message: "specialization is required" }]}
          >
            <Input placeholder="e.g. Cardiologist" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Form.Item
            label="Experience"
            name="experience"
            rules={[{ required: true, message: "experience is required" }]}
          >
            <Input placeholder="e.g. 5 years" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Form.Item
            label="Fees Per Consultation"
            name="feesPerConsultation"
            rules={[{ required: true, message: "fees is required" }]}
          >
            <Input type="number" min={0} placeholder="e.g. 500" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Form.Item
            label="Timings"
            name="timings"
            rules={[{ required: true, message: "timings are required" }]}
          >
            <TimePicker.RangePicker format="HH:mm" minuteStep={30} />
          </Form.Item>
        </Col>
      </Row>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-primary" type="submit">
          {submitLabel || "Submit"}
        </button>
      </div>
    </Form>
  );
};

export default DoctorForm;
