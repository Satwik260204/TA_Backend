const express = require("express");

const superAdminController = require("../Controllers/super_admin");

const router = express.Router();

router.post("/assignAdmin", superAdminController.postAssignedAdmin);
router.get("/freezeAll", superAdminController.getFreezeAll);
router.get("/unfreezeAll", superAdminController.getUnFreezeAll);
router.get("/algorithm",superAdminController.getAllocation);
router.get("/finalalloc", superAdminController.getCsv);
router.post("/ph1",superAdminController.postPh1);
router.post("/ph2",superAdminController.postPh2);
router.post("/ph3",superAdminController.postPh3);
module.exports = router;