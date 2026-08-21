const express = require("express");
const colors = require("colors");
const morgan = require("morgan");
const helmet = require("helmet");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

dotenv.config();

connectDB();

const app = express();

app.use(helmet());
app.use(express.json());
if (process.env.NODE_MODE !== "test") {
  app.use(morgan("dev"));
}

app.get("/api/v1/health", (req, res) =>
  res.status(200).send({ success: true, message: "ok" })
);

app.use("/api/v1/user", require("./routes/userRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));
app.use("/api/v1/doctor", require("./routes/doctorRoutes"));

// unmatched routes and anything a controller forwards with next(error)
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(
    `Server running in ${process.env.NODE_MODE || "development"} mode on port ${port}`
      .bgCyan.white
  );
});
