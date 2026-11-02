const express = require("express");
const { seedDemoController } = require("../controllers/demoCtrl");

const router = express.Router();

router.post("/seed", seedDemoController);

module.exports = router;
