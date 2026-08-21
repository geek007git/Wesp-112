const express = require("express");
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

//router onject
const router = express.Router();

//routes
//LOGIN || POST
router.post("/login", loginController);

//REGISTER || POST
router.post("/register", registerController);

//Auth || POST
router.post("/getUserData", authMiddleware, authController);

//Apply Doctor || POST
router.post("/apply-doctor", authMiddleware, applyDoctorController);

//Notification || POST
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

//GET ALL APPROVED DOCTORS || GET
router.get("/getAllDoctors", authMiddleware, getAllDoctorsController);

//BOOK APPOINTMENT || POST
router.post("/book-appointment", authMiddleware, bookAppointmentController);

//CHECK AVAILABILITY || POST
router.post(
  "/booking-availbility",
  authMiddleware,
  bookingAvailabilityController
);

//APPOINTMENTS LIST || GET
router.get("/user-appointments", authMiddleware, userAppointmentsController);

module.exports = router;
