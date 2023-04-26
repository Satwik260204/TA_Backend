const express = require("express");
const upload = require("../middleware/upload");

const facultyController = require("../Controllers/faculty");

const router = express.Router();

router.get("/faculties", facultyController.getFaculties);
router.post("/addta", facultyController.postTAtoFaculty);
router.post("/faculty", upload.single("file"), facultyController.postFaculty);
router.post("/faculty/courses", facultyController.postFacultyCourse);
router.delete("/faculty/all", facultyController.deleteAllFaculty);

module.exports = router;
