const Faculty = require("../model/Faculty");
const Student = require("../model/Student");
("use strict");
const excelToJson = require("convert-excel-to-json");
const Course = require("../model/Course");
const SuperAdmin = require("../model/SuperAdmin");
const Department = require("../model/Department");

exports.postStudent = async (req, res, next) => {
  // const { name } = req.body;
  // const { email } = req.body;
  // const { roll } = req.body;
  // console.log(req);
  // const file = req.files.file;
  // const filename = file.name;

  const token = req.headers.authorization;
  let super_admin = await SuperAdmin.findOne({ google_id: { idToken: token } });
  let faculty = await Faculty.findOne({
    google_id: { idToken: token },
    isAdmin: true,
  });
  if (!faculty && !super_admin) {
    res.status(401).json({
      statusCode: 401,
      message: "Session timed out! Please Sign-In again.",
      result: null,
    });
    return;
  }

  try {
    if (req.file == undefined) {
      res.status(402).json({
        statusCode: 402,
        message: "Please upload an excel file!",
        result: null,
      });
      return;
    }
    // console.log(req.file);
    const result = excelToJson({
      sourceFile: `./upload/${req.file.originalname}`,
      header: {
        rows: 1,
      },
    });
    // console.log(result);
    for (let i of result.Sheet1) {
      const dp = await Department.find({ name: i.D });
      if (dp.length === 0) {
        res.status(402).json({
          statusCode: 402,
          message: "Departments Does not Match!",
          result: null,
        });
        return;
      }
    }
    for (let i of result.Sheet1) {
      const st = await Student.find({ name: i.A, rollNumber: i.B, email: i.C });
      if (st.length === 0) {
        await Student.create({
          name: i.A,
          rollNumber: i.B,
          email: i.C,
          department: i.D,
        });
      }
    }

    console.log("Students has been added");
    res.status(200).json({
      statusCode: 200,
      message: "Students has been added",
    });
  } catch (e) {
    console.log(e.message);
    res.status(404).json({
      statusCode: 404,
      message: "Something Went Wrong",
    });
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
  const token = req.headers.authorization;
  let super_admin = await SuperAdmin.findOne({ google_id: { idToken: token } });
  let faculty = await Faculty.findOne({
    google_id: { idToken: token },
  });
  if (!faculty && !super_admin) {
    res.status(401).json({
      statusCode: 401,
      message: "Session timed out! Please Sign-In again.",
      result: null,
    });
    return;
  }
  console.log("getStudents");
  let response;
  try {
    response = await Student.find().populate("assignedFaculty");
    // console.log(response);
    res.status(200).send({
      data: response,
    });
  } catch (e) {
    console.log(e.message);
  }
};

exports.postRemoveStudentAsTA = async (req, res, next) => {
  const token = req.headers.authorization;
  let faculty = await Faculty.findOne({ google_id: { idToken: token } });
  if (!faculty) {
    res.status(401).json({
      statusCode: 401,
      message: "Session timed out! Please Sign-In again.",
      result: null,
    });
    return;
  }
  const { students } = req.body;
  console.log("remove ta");
  console.log(students);
  if (!students || students.length === 0) {
    res.status(418).send({ message: "Missing Data" });
    return;
  }

  try {
    for (let i of students) {
      const roll = i.value.match(/\(([^)]+)\)/)[1];
      const temp = i.value.match(/\(([^)]+)\)/)[0];
      const studentName = i.value.replace(temp, "");

      const student = await Student.find({
        rollNumber: roll,
        name: studentName,
      });

      // console.log(student);

      if (student.length === 0) {
        res.status(408).send({ message: "Student not found" });
        return;
      }
      if (student[0].isAssgined === false) {
        res.status(410).send({ message: "Student is not a TA" });
        return;
      }

      const course = await Course.find({ _id: student[0].assignedCourse });
      // console.log(student[0].assignedCourse);
      // console.log(course);
      const index = course[0].allocatedTA.indexOf(student[0]._id);
      // console.log(index);
      if (index > -1) {
        course[0].allocatedTA.splice(index, 1);
        await course[0].save();
        student[0].isAssgined = false;
        student[0].assignedCourse = null;
        student[0].assignedFaculty = null;
        await student[0].save();
      }
    }

    let response;
    try {
      response = await Faculty.find().populate({
        path: "courses",
        populate: {
          path: "allocatedTA",
          model: "Student",
        },
      });
    } catch (e) {
      res.status(418).send({ message: "something went wrong" });
      console.log(e.message);
      return;
    }

    let stdResponse;
    try {
      stdResponse = await Student.find();
      // console.log(response);
    } catch (e) {
      console.log(e.message);
    }
    res.status(200).json({
      statusCode: 200,
      message: "Selected Students has been Removed as TA",
      result: {
        data1: response,
        data2: stdResponse,
      },
    });
  } catch (e) {
    console.log(e.message);
    res.status(417).send({ message: "Students has not been Removed as TA" });
  }
};

exports.deleteAllStudent = async (req, res, next) => {
  const token = req.headers.authorization;
  let super_admin = await SuperAdmin.findOne({ google_id: { idToken: token } });
  let faculty = await Faculty.findOne({
    google_id: { idToken: token },
  });
  if (!faculty && !super_admin) {
    res.status(401).json({
      statusCode: 401,
      message: "Session timed out! Please Sign-In again.",
      result: null,
    });
    return;
  }
  console.log("delete Students");
  try {
    await Student.deleteMany({});
    res.status(200).json({
      statusCode: 200,
      message: "Students has been deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(401).json({
      statusCode: 401,
      message: "Students has not been deleted",
    });
  }
};
