const express = require("express");
const colors = require("colors");
const morgan = require("morgan");
const helmet = require("helmet");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

dotenv.config();

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      "script-src": ["'self'", "https://cdn.jsdelivr.net"],
      "style-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
    },
  },
}));
app.use(express.json());
if (process.env.NODE_MODE !== "test") {
  app.use(morgan("dev"));
}

app.get("/api/v1/health", async (req, res) => {
  try {
    await connectDB();
    res.status(200).send({ success: true, message: "ok" });
  } catch {
    res.status(503).send({ success: false, message: "Database unavailable" });
  }
});

app.use("/api", async (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    return res.status(503).send({ success: false, message: "Authentication is not configured" });
  }
  try {
    await connectDB();
    next();
  } catch {
    res.status(503).send({ success: false, message: "Database unavailable" });
  }
});

app.use("/api/v1/user", require("./routes/userRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));
app.use("/api/v1/doctor", require("./routes/doctorRoutes"));
app.use("/api/v1/chat", require("./routes/chatRoutes"));

// Keep unknown API paths out of the React history fallback.
app.use("/api", notFound);
if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, "client/build")));
  app.get("*", (req, res) => res.sendFile(path.join(__dirname, "client/build/index.html")));
}

// unmatched routes and anything a controller forwards with next(error)
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 8080;
if (require.main === module) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required");
  connectDB().then(() => app.listen(port, "0.0.0.0", () => {
    console.log(
      `Server running in ${process.env.NODE_MODE || "development"} mode on port ${port}`
        .bgCyan.white
    );
  })).catch(() => {
    console.error("Unable to connect to MongoDB. Check MONGO_URL and database network access.");
    process.exitCode = 1;
  });
}

module.exports = app;
