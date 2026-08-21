const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const {
  getAllUsersController,
  getAllDoctorsController,
  changeAccountStatusController,
} = require("../controllers/adminCtrl");

const router = express.Router();

//GET ALL USERS || GET
router.get("/getAllUsers", authMiddleware, adminMiddleware, getAllUsersController);

//GET ALL DOCTORS (any status) || GET
router.get(
  "/getAllDoctors",
  authMiddleware,
  adminMiddleware,
  getAllDoctorsController
);

//APPROVE / REJECT DOCTOR APPLICATION || POST
router.post(
  "/changeAccountStatus",
  authMiddleware,
  adminMiddleware,
  changeAccountStatusController
);

module.exports = router;
