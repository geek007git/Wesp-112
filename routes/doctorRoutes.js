const express = require("express");
const { body, param } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const {
  getDoctorInfoController,
  updateProfileController,
  getDoctorByIdController,
  doctorAppointmentsController,
  updateStatusController,
} = require("../controllers/doctorCtrl");

const router = express.Router();

//OWN PROFILE || POST
router.post("/getDoctorInfo", authMiddleware, getDoctorInfoController);

//UPDATE OWN PROFILE || POST
router.post(
  "/updateProfile",
  authMiddleware,
  [
    body("firstName").optional().trim().notEmpty(),
    body("lastName").optional().trim().notEmpty(),
    body("email").optional().isEmail().withMessage("a valid email is required"),
    body("feesPerConsultation")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("fees must be a positive number"),
    body("timings")
      .optional()
      .isArray({ min: 2, max: 2 })
      .withMessage("timings must be a [start, end] pair"),
    body("timings.*")
      .optional()
      .matches(/^\d{1,2}:\d{2}$/)
      .withMessage("timings must be HH:mm"),
  ],
  validate,
  updateProfileController
);

//SINGLE DOCTOR (booking page) || GET
router.get(
  "/getDoctorById/:doctorId",
  authMiddleware,
  [param("doctorId").isMongoId().withMessage("valid doctorId is required")],
  validate,
  getDoctorByIdController
);

//OWN APPOINTMENTS || GET
router.get(
  "/doctor-appointments",
  authMiddleware,
  doctorAppointmentsController
);

//APPROVE / REJECT APPOINTMENT || POST
router.post(
  "/update-status",
  authMiddleware,
  [
    body("appointmentId")
      .isMongoId()
      .withMessage("valid appointmentId is required"),
    body("status")
      .isIn(["approved", "rejected"])
      .withMessage("status must be approved or rejected"),
  ],
  validate,
  updateStatusController
);

module.exports = router;
