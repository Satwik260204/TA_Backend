const express = require("express");
const upload = require("../middleware/upload");

const studentController = require("../Controllers/student");

const router = express.Router();

router.post("/student", upload.single("file"), studentController.postStudent);
router.get("/students", studentController.getStudents);
router.post("/removeTA", studentController.postRemoveStudentAsTA);

module.exports = router;
