const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const header = req.headers["authorization"] || "";
    const token = header.split(" ")[1];
    if (!token) {
      return res.status(401).send({ message: "Auth Failed", success: false });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Auth Failed", success: false });
      }
      req.userId = decoded.id;
      // controllers written against the tutorial read it off the body too
      req.body.userId = decoded.id;
      next();
    });
  } catch (error) {
    console.log(error);
    res.status(401).send({ message: "Auth Failed", success: false });
  }
};
