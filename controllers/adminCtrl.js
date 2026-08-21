const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModels");

const getAllUsersController = async (req, res, next) => {
  try {
    const users = await userModel.find({}).select("-password");
    res.status(200).send({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const getAllDoctorsController = async (req, res, next) => {
  try {
    const doctors = await doctorModel.find({}).sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      message: "Doctors fetched successfully",
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

// approve or reject an application; keeps the user's isDoctor flag in step
const changeAccountStatusController = async (req, res, next) => {
  try {
    const { doctorId, status } = req.body;
    const doctor = await doctorModel.findByIdAndUpdate(
      doctorId,
      { status },
      { new: true }
    );
    if (!doctor) {
      return res
        .status(404)
        .send({ success: false, message: "Doctor not found" });
    }
    await userModel.findByIdAndUpdate(doctor.userId, {
      isDoctor: status === "approved",
      $push: {
        notifications: {
          type: "doctor-account-request-updated",
          message: `Your doctor account request has been ${status}`,
          onClickPath: "/notification",
          data: { doctorId: doctor._id },
        },
      },
    });
    res.status(200).send({
      success: true,
      message: `Doctor account ${status}`,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsersController,
  getAllDoctorsController,
  changeAccountStatusController,
};
