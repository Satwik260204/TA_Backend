const express = require("express");

const superAdminController = require("../Controllers/super_admin");

const router = express.Router();

router.post("/assignAdmin", superAdminController.postAssignedAdmin);
router.get("/freezeAll", superAdminController.getFreezeAll);
router.get("/unfreezeAll", superAdminController.getUnFreezeAll);

module.exports = router;
