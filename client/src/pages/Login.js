import React, { useState } from "react";
import "../styles/RegiserStyles.css";
import { Form, Input, message } from "antd";
import { Link } from "react-router-dom";
import http, { apiError } from "../api/http";

const Login = () => {
  const [submitting, setSubmitting] = useState(false);

  const onfinishHandler = async (values) => {
    setSubmitting(true);
    try {
      const res = await http.post("/user/login", values);
      localStorage.setItem("token", res.data.token);
      message.success("Logged in successfully");
      // full reload so the user context is built from the new token
      window.location.href = "/";
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
        <h3 className="text-center">Login</h3>

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
          rules={[{ required: true, message: "password is required" }]}
        >
          <Input.Password />
        </Form.Item>
        <Link to="/register" className="m-2">
          Not a user? Register here
        </Link>
        <button
          className="btn btn-primary w-100 mt-3"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Logging in..." : "Login"}
        </button>
      </Form>
    </div>
  );
};

export default Login;
