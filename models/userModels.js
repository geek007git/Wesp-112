const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    message: { type: String, required: true },
    onClickPath: { type: String },
    data: { type: Object },
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    // stores the bcrypt hash; length rules live in the route validators
    password: {
      type: String,
      required: [true, "password is required"],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isDoctor: {
      type: Boolean,
      default: false,
    },
    notifications: {
      type: [notificationSchema],
      default: [],
    },
    seenNotifications: {
      type: [notificationSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
