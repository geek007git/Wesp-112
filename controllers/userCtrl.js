const userModel = require("../models/userModels");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { parseSlot, isWithinTimings, overlapWindow } = require("../utils/slots");

const registerController = async (req, res, next) => {
  try {
    const email = String(req.body.email).toLowerCase().trim();
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .send({ success: false, message: "An account with that email already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    await new userModel({
      name: req.body.name,
      email,
      password: hashedPassword,
    }).save();
    res
      .status(201)
      .send({ success: true, message: "Registered successfully" });
  } catch (error) {
    next(error);
  }
};

const loginController = async (req, res, next) => {
  try {
    const email = String(req.body.email).toLowerCase().trim();
    const user = await userModel.findOne({ email });
    // same response for unknown email and wrong password, so the endpoint
    // cannot be used to discover which accounts exist
    const isMatch =
      user && (await bcrypt.compare(req.body.password, user.password));
    if (!isMatch) {
      return res
        .status(401)
        .send({ success: false, message: "Invalid email or password" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res
      .status(200)
      .send({ success: true, message: "Login successful", token });
  } catch (error) {
    next(error);
  }
};

const authController = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }
    res.status(200).send({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// apply to become a doctor -> notifies every admin
const applyDoctorController = async (req, res, next) => {
  try {
    const existing = await doctorModel.findOne({ userId: req.userId });
    if (existing) {
      return res.status(409).send({
        success: false,
        message: `You have already applied. Current status: ${existing.status}`,
      });
    }
    const newDoctor = await new doctorModel({
      ...req.body,
      userId: req.userId,
      status: "pending",
    }).save();
    const admins = await userModel.find({ isAdmin: true }).select("_id");
    await userModel.updateMany(
      { _id: { $in: admins.map((admin) => admin._id) } },
      {
        $push: {
          notifications: {
            type: "apply-doctor-request",
            message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for a doctor account`,
            onClickPath: "/admin/doctors",
            data: {
              doctorId: newDoctor._id,
              name: `${newDoctor.firstName} ${newDoctor.lastName}`,
            },
          },
        },
      }
    );
    res
      .status(201)
      .send({ success: true, message: "Application submitted successfully" });
  } catch (error) {
    next(error);
  }
};

const getAllNotificationController = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }
    user.seenNotifications = [...user.seenNotifications, ...user.notifications];
    user.notifications = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "All notifications marked as read",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAllNotificationController = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }
    user.notifications = [];
    user.seenNotifications = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "Notifications deleted successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// only approved doctors are bookable
const getAllDoctorsController = async (req, res, next) => {
  try {
    const doctors = await doctorModel.find({ status: "approved" });
    res.status(200).send({
      success: true,
      message: "Doctors fetched successfully",
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

// shared by the availability check and the booking itself
const checkAvailability = async (req) => {
  const { doctorId, date, time } = req.body;
  const slot = parseSlot(date, time);
  if (!slot) {
    return { ok: false, message: "Invalid date or time" };
  }
  const doctor = await doctorModel.findById(doctorId);
  if (!doctor || doctor.status !== "approved") {
    return { ok: false, message: "Doctor not available for booking" };
  }
  if (slot.getTime() < Date.now()) {
    return { ok: false, message: "Cannot book a slot in the past" };
  }
  if (!isWithinTimings(time, doctor.timings)) {
    return {
      ok: false,
      message: `Doctor works between ${doctor.timings[0]} and ${doctor.timings[1]}`,
    };
  }
  const clash = await appointmentModel.findOne({
    doctorId: doctor._id,
    status: { $ne: "rejected" },
    slot: overlapWindow(slot),
  });
  if (clash) {
    return { ok: false, message: "Slot already booked, pick another time" };
  }
  return { ok: true, slot, doctor };
};

const bookingAvailabilityController = async (req, res, next) => {
  try {
    const result = await checkAvailability(req);
    // a taken slot is a valid answer, not a request failure
    res.status(200).send({
      success: true,
      available: result.ok,
      message: result.ok ? "Slot available" : result.message,
    });
  } catch (error) {
    next(error);
  }
};

const bookAppointmentController = async (req, res, next) => {
  try {
    const result = await checkAvailability(req);
    if (!result.ok) {
      return res.status(409).send({ success: false, message: result.message });
    }
    const user = await userModel.findById(req.userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }
    const appointment = await new appointmentModel({
      userId: req.userId,
      doctorId: result.doctor._id,
      doctorInfo: result.doctor.toObject(),
      userInfo: user.toObject(),
      date: req.body.date,
      time: req.body.time,
      slot: result.slot,
      status: "pending",
    }).save();
    await userModel.findByIdAndUpdate(result.doctor.userId, {
      $push: {
        notifications: {
          type: "new-appointment-request",
          message: `A new appointment request from ${user.name}`,
          onClickPath: "/doctor/appointments",
          data: { appointmentId: appointment._id },
        },
      },
    });
    res
      .status(201)
      .send({ success: true, message: "Appointment booked successfully" });
  } catch (error) {
    next(error);
  }
};

const userAppointmentsController = async (req, res, next) => {
  try {
    const appointments = await appointmentModel
      .find({ userId: req.userId })
      .sort({ slot: -1 });
    res.status(200).send({
      success: true,
      message: "Appointments fetched successfully",
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginController,
  registerController,
  authController,
  applyDoctorController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllDoctorsController,
  bookingAvailabilityController,
  bookAppointmentController,
  userAppointmentsController,
};
