const mongoose = require("mongoose");
let connectionPromise;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (!process.env.MONGO_URL) throw new Error("MONGO_URL is required");
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    }).catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }
  return connectionPromise;
};

module.exports = connectDB;
