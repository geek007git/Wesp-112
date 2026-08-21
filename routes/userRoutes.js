const express = require("express");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const {
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
} = require("../controllers/userCtrl");
const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");

const router = express.Router();

// credential endpoints are the ones worth throttling
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts, please try again later",
  },
});

const bookingRules = [
  body("doctorId").isMongoId().withMessage("valid doctorId is required"),
  body("date")
    .matches(/^\d{1,2}-\d{1,2}-\d{4}$/)
    .withMessage("date must be DD-MM-YYYY"),
  body("time")
    .matches(/^\d{1,2}:\d{2}$/)
    .withMessage("time must be HH:mm"),
];

//REGISTER || POST
router.post(
  "/register",
  authLimiter,
  [
    body("name").trim().notEmpty().withMessage("name is required"),
    body("email").isEmail().withMessage("a valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("password must be at least 6 characters"),
  ],
  validate,
  registerController
);

//LOGIN || POST
router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().withMessage("a valid email is required"),
    body("password").notEmpty().withMessage("password is required"),
  ],
  validate,
  loginController
);

//CURRENT USER || POST
router.post("/getUserData", authMiddleware, authController);

//APPLY DOCTOR || POST
router.post(
  "/apply-doctor",
  authMiddleware,
  [
    body("firstName").trim().notEmpty().withMessage("first name is required"),
    body("lastName").trim().notEmpty().withMessage("last name is required"),
    body("phone").trim().notEmpty().withMessage("phone is required"),
    body("email").isEmail().withMessage("a valid email is required"),
    body("address").trim().notEmpty().withMessage("address is required"),
    body("specialization")
      .trim()
      .notEmpty()
      .withMessage("specialization is required"),
    body("experience").trim().notEmpty().withMessage("experience is required"),
    body("feesPerConsultation")
      .isFloat({ min: 0 })
      .withMessage("fees must be a positive number"),
    body("timings")
      .isArray({ min: 2, max: 2 })
      .withMessage("timings must be a [start, end] pair"),
    body("timings.*")
      .matches(/^\d{1,2}:\d{2}$/)
      .withMessage("timings must be HH:mm"),
  ],
  validate,
  applyDoctorController
);

//NOTIFICATIONS || POST
router.post(
  "/get-all-notification",
  authMiddleware,
  getAllNotificationController
);
router.post(
  "/delete-all-notification",
  authMiddleware,
  deleteAllNotificationController
);

//APPROVED DOCTORS || GET
router.get("/getAllDoctors", authMiddleware, getAllDoctorsController);

//CHECK AVAILABILITY || POST
router.post(
  "/booking-availability",
  authMiddleware,
  bookingRules,
  validate,
  bookingAvailabilityController
);

//BOOK APPOINTMENT || POST
router.post(
  "/book-appointment",
  authMiddleware,
  bookingRules,
  validate,
  bookAppointmentController
);

//OWN APPOINTMENTS || GET
router.get("/user-appointments", authMiddleware, userAppointmentsController);

module.exports = router;
