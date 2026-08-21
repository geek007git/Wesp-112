const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctors",
      required: true,
    },
    doctorInfo: {
      type: Object,
      required: true,
    },
    userInfo: {
      type: Object,
      required: true,
    },
    // date + time are kept as separate strings for display and as one
    // Date for range queries (availability checks)
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    slot: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const appointmentModel = mongoose.model("appointments", appointmentSchema);

module.exports = appointmentModel;
