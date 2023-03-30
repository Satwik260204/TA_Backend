const Faculty = require("../model/Faculty");
const Student = require("../model/Student");
const Course = require("../model/Course");
const SuperAdmin = require("../model/SuperAdmin");

exports.postAssignedAdmin = async (req, res, next) => {
  const token = req.headers.authorization;
  let super_admin1 = await SuperAdmin.findOne({
    google_id: { idToken: token },
  });
  if (!super_admin1) {
    res.status(401).json({
      statusCode: 401,
      message: "Session timed out! Please Sign-In again.",
      result: null,
    });
    return;
  }

  const { faculty } = req.body;

  if (!faculty) {
    res.status(400).send({ message: "Please Select Faculties!" });
  }

  try {
    for (let i of faculty) {
      const email = i.value.match(/\(([^)]+)\)/)[1];
      const temp = i.value.match(/\(([^)]+)\)/)[0];
      const facultyName = i.value.replace(temp, "");

      const getFaculties = await Faculty.find({
        email: email,
        name: facultyName,
      });

      if (getFaculties.length === 0) {
        res.status(408).send({ message: "Faculty not found" });
        return;
      }
      if (getFaculties[0].isAdmin === true) {
        res.status(410).send({ message: "Faculty is already a Admin" });
        return;
      }

      try {
        getFaculties[0].isAdmin = true;
        await getFaculties[0].save();
      } catch (e) {
        res.status(418).send({ message: "something went wrong" });
        console.log(e.message);
      }
    }
    res.status(200).send({ message: "Faculties has been assigned admin" });
    console.log("Faculties has been assigned admin");
  } catch (error) {
    console.log(e.message);
    res.status(418).send({ message: "something went wrong" });
  }
};
