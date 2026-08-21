const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModels");

const getAllUsersController = async (req, res) => {
  try {
    const users = await userModel.find({}).select("-password");
    res
      .status(200)
      .send({ success: true, message: "users data list", data: users });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, message: "eror while fetching users", error });
  }
};

const getAllDoctorsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    res.status(200).send({
      success: true,
      message: "Doctors Data list",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, message: "error while getting doctors data", error });
  }
};

// approve / reject a doctor application; flips the user's isDoctor flag
const changeAccountStatusController = async (req, res) => {
  try {
    const { doctorId, status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res
        .status(200)
        .send({ success: false, message: "invalid status" });
    }
    const doctor = await doctorModel.findByIdAndUpdate(
      doctorId,
      { status },
      { new: true }
    );
    if (!doctor) {
      return res
        .status(200)
        .send({ success: false, message: "doctor not found" });
    }
    const user = await userModel.findById(doctor.userId);
    if (user) {
      user.notification.push({
        type: "doctor-account-request-updated",
        message: `Your Doctor Account Request Has ${status}`,
        onClickPath: "/notification",
      });
      user.isDoctor = status === "approved";
      await user.save();
    }
    res.status(200).send({
      success: true,
      message: "Account Status Updated",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Eror in Account Status",
      error,
    });
  }
};

module.exports = {
  getAllUsersController,
  getAllDoctorsController,
  changeAccountStatusController,
};
