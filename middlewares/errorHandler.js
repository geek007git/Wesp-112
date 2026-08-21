const notFound = (req, res) => {
  res
    .status(404)
    .send({ success: false, message: `Route not found: ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  console.log(error);

  // mongoose validation / cast / duplicate-key map to client errors
  if (error.name === "ValidationError") {
    const message = Object.values(error.errors)
      .map((field) => field.message)
      .join(", ");
    return res.status(400).send({ success: false, message });
  }
  if (error.name === "CastError") {
    return res.status(400).send({ success: false, message: "Invalid id" });
  }
  if (error.code === 11000) {
    return res
      .status(409)
      .send({ success: false, message: "That value is already taken" });
  }

  const status = error.status || 500;
  res.status(status).send({
    success: false,
    message: status === 500 ? "Something went wrong" : error.message,
  });
};

module.exports = { notFound, errorHandler };
