const express = require("express");
const { body } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const validate = require("../middlewares/validate");
const {
  getAllUsersController,
  getAllDoctorsController,
  changeAccountStatusController,
} = require("../controllers/adminCtrl");
const { adminSeedDemoController } = require("../controllers/demoCtrl");

const router = express.Router();

// everything below is admin-only
router.use(authMiddleware, adminMiddleware);

//ALL USERS || GET
router.get("/getAllUsers", getAllUsersController);

//ALL DOCTORS, ANY STATUS || GET
router.get("/getAllDoctors", getAllDoctorsController);

// Admin-only, idempotent demo data setup for presentations.
router.post("/seed-demo-data", adminSeedDemoController);

//APPROVE / REJECT APPLICATION || POST
router.post(
  "/changeAccountStatus",
  [
    body("doctorId").isMongoId().withMessage("valid doctorId is required"),
    body("status")
      .isIn(["approved", "rejected", "pending"])
      .withMessage("status must be approved, rejected or pending"),
  ],
  validate,
  changeAccountStatusController
);

module.exports = router;
