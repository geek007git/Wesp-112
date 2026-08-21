const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getDoctorInfoController,
  updateProfileController,
  getDoctorByIdController,
  doctorAppointmentsController,
  updateStatusController,
} = require("../controllers/doctorCtrl");

const router = express.Router();

//GET OWN PROFILE || POST
router.post("/getDoctorInfo", authMiddleware, getDoctorInfoController);

//UPDATE OWN PROFILE || POST
router.post("/updateProfile", authMiddleware, updateProfileController);

//SINGLE DOCTOR (booking page) || GET
router.get("/getDoctorById/:doctorId", authMiddleware, getDoctorByIdController);

//DOCTOR APPOINTMENTS || GET
router.get(
  "/doctor-appointments",
  authMiddleware,
  doctorAppointmentsController
);

//APPROVE / REJECT APPOINTMENT || POST
router.post("/update-status", authMiddleware, updateStatusController);

module.exports = router;
