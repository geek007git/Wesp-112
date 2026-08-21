const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const userModel = require("../models/userModels");

// the logged-in doctor's own profile
const getDoctorInfoController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.userId });
    if (!doctor) {
      return res
        .status(200)
        .send({ success: false, message: "doctor profile not found" });
    }
    res.status(200).send({
      success: true,
      message: "doctor data fetch success",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, error, message: "Error in Fetching Doctor Details" });
  }
};

const updateProfileController = async (req, res) => {
  try {
    // status is only changeable by an admin
    const { status, userId, _id, ...updatable } = req.body;
    const doctor = await doctorModel.findOneAndUpdate(
      { userId: req.userId },
      updatable,
      { new: true, runValidators: true }
    );
    if (!doctor) {
      return res
        .status(200)
        .send({ success: false, message: "doctor profile not found" });
    }
    res.status(200).send({
      success: true,
      message: "Doctor Profile Updated",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, error, message: "Doctor Profile Upadte issue" });
  }
};

// public: a single doctor, used by the booking page
const getDoctorByIdController = async (req, res) => {
  try {
    const doctor = await doctorModel.findById(req.params.doctorId);
    if (!doctor || doctor.status !== "approved") {
      return res
        .status(200)
        .send({ success: false, message: "doctor not found" });
    }
    res
      .status(200)
      .send({ success: true, message: "Single Doc Info Fetched", data: doctor });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Single doctor info",
    });
  }
};

const doctorAppointmentsController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.userId });
    if (!doctor) {
      return res
        .status(200)
        .send({ success: false, message: "doctor profile not found" });
    }
    const appointments = await appointmentModel
      .find({ doctorId: doctor._id })
      .sort({ slot: -1 });
    res.status(200).send({
      success: true,
      message: "Doctor Appointments fetch Successfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, error, message: "Error In Doctor Appointments" });
  }
};

// doctor approves / rejects an appointment, patient gets notified
const updateStatusController = async (req, res) => {
  try {
    const { appointmentsId, status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(200)
        .send({ success: false, message: "invalid status" });
    }
    const doctor = await doctorModel.findOne({ userId: req.userId });
    if (!doctor) {
      return res
        .status(200)
        .send({ success: false, message: "doctor profile not found" });
    }
    const appointment = await appointmentModel.findOneAndUpdate(
      { _id: appointmentsId, doctorId: doctor._id },
      { status },
      { new: true }
    );
    if (!appointment) {
      return res
        .status(200)
        .send({ success: false, message: "appointment not found" });
    }
    await userModel.findByIdAndUpdate(appointment.userId, {
      $push: {
        notification: {
          type: "status-updated",
          message: `your appointment has been ${status}`,
          onCLickPath: "/appointments",
        },
      },
    });
    res
      .status(200)
      .send({ success: true, message: "Appointment Status Updated" });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In Update Status",
    });
  }
};

module.exports = {
  getDoctorInfoController,
  updateProfileController,
  getDoctorByIdController,
  doctorAppointmentsController,
  updateStatusController,
};
