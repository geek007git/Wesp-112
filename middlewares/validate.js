const { validationResult } = require("express-validator");

// turns express-validator failures into the same shape every other error uses
module.exports = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send({
      success: false,
      message: result
        .array()
        .map((issue) => issue.msg)
        .join(", "),
    });
  }
  next();
};
