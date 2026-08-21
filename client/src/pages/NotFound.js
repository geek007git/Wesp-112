import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => (
  <div style={{ textAlign: "center", padding: 60 }}>
    <h1>404</h1>
    <p>That page does not exist.</p>
    <Link to="/">Back to home</Link>
  </div>
);

export default NotFound;
