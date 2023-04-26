const express = require("express");
const upload = require("../middleware/upload");

const departmentController = require("../Controllers/department");

const router = express.Router();

router.post(
  "/departments",
  upload.single("file"),
  departmentController.postDepartment
);
router.get("/alldepartments", departmentController.getDepartment);
router.delete("/department/all", departmentController.deleteAllDepartment);

module.exports = router;
