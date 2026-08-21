const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    firstName: {
      type: String,
      required: [true, "first name is require"],
    },
    lastName: {
      type: String,
      required: [true, "last name is require"],
    },
    phone: {
      type: String,
      required: [true, "phone no is require"],
    },
    email: {
      type: String,
      required: [true, "email is require"],
    },
    website: {
      type: String,
    },
    address: {
      type: String,
      required: [true, "address is require"],
    },
    specialization: {
      type: String,
      required: [true, "specialization is require"],
    },
    experience: {
      type: String,
      required: [true, "experience is require"],
    },
    feesPerConsultation: {
      type: Number,
      required: [true, "fees is require"],
    },
    // ["09:00", "17:00"] in 24h HH:mm
    timings: {
      type: [String],
      required: [true, "timings are require"],
      validate: {
        validator: (v) => Array.isArray(v) && v.length === 2,
        message: "timings must be a [start, end] pair",
      },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const doctorModel = mongoose.model("doctors", doctorSchema);

module.exports = doctorModel;
