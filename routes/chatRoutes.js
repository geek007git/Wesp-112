const express = require("express");
const rateLimit = require("express-rate-limit");
const authMiddleware = require("../middlewares/authMiddleware");
const { chatbotController } = require("../controllers/chatCtrl");

const router = express.Router();
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Please wait a moment before sending more messages" },
});

router.post("/message", authMiddleware, chatLimiter, chatbotController);

module.exports = router;
