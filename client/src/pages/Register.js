import React, { useState } from "react";
import "../styles/RegiserStyles.css";
import { Form, Input, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import http, { apiError } from "../api/http";

const Register = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const onfinishHandler = async (values) => {
    setSubmitting(true);
    try {
      await http.post("/user/register", values);
      message.success("Registered successfully, please log in");
      navigate("/login");
    } catch (error) {
      message.error(apiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <Form
        layout="vertical"
        onFinish={onfinishHandler}
        className="register-form"
      >
        <h3 className="text-center">Register</h3>
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "name is required" }]}
        >
          <Input type="text" />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "email is required" },
            { type: "email", message: "enter a valid email" },
          ]}
        >
          <Input type="email" />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: "password is required" },
            { min: 6, message: "password must be at least 6 characters" },
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Link to="/login" className="m-2">
          Already registered? Login here
        </Link>
        <button
          className="btn btn-primary w-100 mt-3"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Creating account..." : "Register"}
        </button>
      </Form>
    </div>
  );
};

export default Register;
