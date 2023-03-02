const express = require("express");

const router = express.Router();

const authController = require("../Controllers/auth");

router.post("/user_check", authController.userCheck);

module.exports = router;
