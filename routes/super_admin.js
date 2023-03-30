const express = require("express");

const superAdminController = require("../Controllers/super_admin");

const router = express.Router();

router.post("/assignAdmin", superAdminController.postAssignedAdmin);

module.exports = router;
