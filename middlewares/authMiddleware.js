const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const header = req.headers["authorization"] || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res
      .status(401)
      .send({ success: false, message: "Authentication required" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res
      .status(401)
      .send({ success: false, message: "Session expired, please log in again" });
  }
};
