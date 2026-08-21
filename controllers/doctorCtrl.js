const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const userModel = require("../models/userModels");

// the logged-in doctor's own profile
const getDoctorInfoController = async (req, res, next) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.userId });
    if (!doctor) {
      return res
        .status(404)
        .send({ success: false, message: "Doctor profile not found" });
    }
    res.status(200).send({
      success: true,
      message: "Doctor profile fetched successfully",
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfileController = async (req, res, next) => {
  try {
    // status, userId and _id are not the doctor's to change
    const { status, userId, _id, ...updatable } = req.body;
    const doctor = await doctorModel.findOneAndUpdate(
      { userId: req.userId },
      updatable,
      { new: true, runValidators: true }
    );
    if (!doctor) {
      return res
        .status(404)
        .send({ success: false, message: "Doctor profile not found" });
    }
    res.status(200).send({
      success: true,
      message: "Profile updated successfully",
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

// a single approved doctor, used by the booking page
const getDoctorByIdController = async (req, res, next) => {
  try {
    const doctor = await doctorModel.findById(req.params.doctorId);
    if (!doctor || doctor.status !== "approved") {
      return res
        .status(404)
        .send({ success: false, message: "Doctor not found" });
    }
    res.status(200).send({
      success: true,
      message: "Doctor fetched successfully",
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

const doctorAppointmentsController = async (req, res, next) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.userId });
    if (!doctor) {
      return res
        .status(404)
        .send({ success: false, message: "Doctor profile not found" });
    }
    const appointments = await appointmentModel
      .find({ doctorId: doctor._id })
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

// doctor approves or rejects an appointment; the patient is notified
const updateStatusController = async (req, res, next) => {
  try {
    const { appointmentId, status } = req.body;
    const doctor = await doctorModel.findOne({ userId: req.userId });
    if (!doctor) {
      return res
        .status(404)
        .send({ success: false, message: "Doctor profile not found" });
    }
    const appointment = await appointmentModel.findOneAndUpdate(
      { _id: appointmentId, doctorId: doctor._id },
      { status },
      { new: true }
    );
    if (!appointment) {
      return res
        .status(404)
        .send({ success: false, message: "Appointment not found" });
    }
    await userModel.findByIdAndUpdate(appointment.userId, {
      $push: {
        notifications: {
          type: "appointment-status-updated",
          message: `Your appointment has been ${status}`,
          onClickPath: "/appointments",
          data: { appointmentId: appointment._id },
        },
      },
    });
    res
      .status(200)
      .send({ success: true, message: `Appointment ${status}` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctorInfoController,
  updateProfileController,
  getDoctorByIdController,
  doctorAppointmentsController,
  updateStatusController,
};
