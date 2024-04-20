const express = require("express");
const upload = require("../middleware/upload");

const applicantController = require("../Controllers/applicant");

const router = express.Router();

router.post("/addDgDp", applicantController.postDgDp);
router.get("/applicantcourses",applicantController.getCourses);
router.post("/applyta",applicantController.postApplyTa);


module.exports=router;