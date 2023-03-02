const Faculty = require("../model/Faculty");
const Student = require("../model/Student");
("use strict");
const excelToJson = require("convert-excel-to-json");
const Course = require("../model/Course");

exports.postStudent = async (req, res, next) => {
  // const { name } = req.body;
  // const { email } = req.body;
  // const { roll } = req.body;
  // console.log(req);
  // const file = req.files.file;
  // const filename = file.name;

  try {
    if (req.file == undefined) {
      return res.status(400).send("Please upload an excel file!");
    }
    console.log(req.file);
    const result = excelToJson({
      sourceFile: `./upload/${req.file.originalname}`,
      header: {
        rows: 1,
      },
    });
    console.log(result);
    for (let i of result.Sheet1) {
      const st = await Student.find({ name: i.A, rollNumber: i.B, email: i.C });
      if (st.length === 0) {
        await Student.create({ name: i.A, rollNumber: i.B, email: i.C });
      }
    }

    console.log("Students has been added");
    res.status(200).send({ message: "Students has been added" });
  } catch (e) {
    console.log(e.message);
    res.status(400).send({ message: "something went wrong" });
  }

  // if (!name || !email || !roll) {
  //   res.status(418).send({ message: "missing data" });
  // }

  // try {
  //   await Student.create({ name: name, email: email, rollNumber: roll });
  //   console.log("student added");
  //   res.status(200).send({ message: "Student has been added" });
  // } catch (e) {
  //   console.log(e.message);
  //   res.status(417).send({ message: "Student has not been added" });
  // }
};

exports.getStudents = async (req, res, next) => {
  console.log("getStudents");
  let response;
  try {
    response = await Student.find();
    // console.log(response);
    res.status(200).send({
      data: response,
    });
  } catch (e) {
    console.log(e.message);
  }
};

exports.postRemoveStudentAsTA = async (req, res, next) => {
  const { roll } = req.body;
  console.log("remove ta");
  if (!roll) {
    res.status(418).send({ message: "missing data" });
  }

  try {
    const student = await Student.find({
      rollNumber: roll,
    });

    const course = await Course.find({ _id: student[0].assignedCourse });
    const index = course[0].allocatedTA.indexOf(student[0]._id);
    if (index > -1) {
      course[0].allocatedTA.splice(index, 1);
      await course[0].save();
      student[0].isAssgined = false;
      student[0].assignedCourse = null;
      student[0].assignedFaculty = null;
      await student[0].save();
    }
    res.status(200).send({ message: "Student has been Removed" });
  } catch (e) {
    console.log(e.message);
    res.status(417).send({ message: "Student has not been Removed" });
  }
};
