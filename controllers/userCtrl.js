const userModel = require("../models/userModels");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { parseSlot, isWithinTimings, overlapWindow } = require("../utils/slots");

//register callback
const registerController = async (req, res) => {
  try {
    const exisitingUser = await userModel.findOne({ email: req.body.email });
    if (exisitingUser) {
      return res
        .status(200)
        .send({ message: "User Already Exist", success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new userModel({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).send({ message: "Register Sucessfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Register Controller ${error.message}`,
    });
  }
};

// login callback
const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "user not found", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Invlid EMail or Password", success: false });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).send({ message: "Login Success", success: true, token });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: `Error in Login CTRL ${error.message}` });
  }
};

// current user
const authController = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("-password");
    if (!user) {
      return res
        .status(200)
        .send({ message: "user not found", success: false });
    }
    res.status(200).send({ success: true, data: user });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "auth error", success: false, error });
  }
};

// apply to become a doctor -> notifies every admin
const applyDoctorController = async (req, res) => {
  try {
    const existing = await doctorModel.findOne({ userId: req.userId });
    if (existing) {
      return res.status(200).send({
        success: false,
        message: `You already applied, current status: ${existing.status}`,
      });
    }
    const newDoctor = await doctorModel({
      ...req.body,
      userId: req.userId,
      status: "pending",
    }).save();
    const adminUsers = await userModel.find({ isAdmin: true });
    await userModel.updateMany(
      { _id: { $in: adminUsers.map((admin) => admin._id) } },
      {
        $push: {
          notification: {
            type: "apply-doctor-request",
            message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for a doctor account`,
            data: {
              doctorId: newDoctor._id,
              name: `${newDoctor.firstName} ${newDoctor.lastName}`,
              onClickPath: "/admin/doctors",
            },
          },
        },
      }
    );
    res.status(201).send({
      success: true,
      message: "Doctor Account Applied SUccessfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error WHile Applying For Doctor",
    });
  }
};

// move unread notifications to read
const getAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res
        .status(200)
        .send({ message: "user not found", success: false });
    }
    user.seennotification = [...user.seennotification, ...user.notification];
    user.notification = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "all notification marked as read",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error in notification",
      success: false,
      error,
    });
  }
};

const deleteAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res
        .status(200)
        .send({ message: "user not found", success: false });
    }
    user.notification = [];
    user.seennotification = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "Notifications Deleted successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "unable to delete all notifications",
      error,
    });
  }
};

// only approved doctors are bookable
const getAllDoctorsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({ status: "approved" });
    res.status(200).send({
      success: true,
      message: "Doctors List Fetched Successfully",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, error, message: "Error While Fetching Doctors" });
  }
};

// shared by bookingAvailability and bookAppointment
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

const bookingAvailabilityController = async (req, res) => {
  try {
    const result = await checkAvailability(req);
    res.status(200).send({
      success: result.ok,
      message: result.ok ? "Slot available" : result.message,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, error, message: "Error In Booking Availbility" });
  }
};

const bookAppointmentController = async (req, res) => {
  try {
    const result = await checkAvailability(req);
    if (!result.ok) {
      return res.status(200).send({ success: false, message: result.message });
    }
    const user = await userModel.findById(req.userId).select("-password");
    if (!user) {
      return res.status(200).send({ success: false, message: "user not found" });
    }
    const appointment = await appointmentModel({
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
        notification: {
          type: "New-appointment-request",
          message: `A new appointment request from ${user.name}`,
          data: {
            appointmentId: appointment._id,
            onClickPath: "/doctor/appointments",
          },
        },
      },
    });
    res
      .status(201)
      .send({ success: true, message: "Appointment Book succesfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, error, message: "Error While Booking" });
  }
};

const userAppointmentsController = async (req, res) => {
  try {
    const appointments = await appointmentModel
      .find({ userId: req.userId })
      .sort({ slot: -1 });
    res.status(200).send({
      success: true,
      message: "Users Appointments Fetch SUccessfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In User Appointments",
    });
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
