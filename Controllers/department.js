const Faculty = require("../model/Faculty");
const Student = require("../model/Student");
("use strict");
const excelToJson = require("convert-excel-to-json");
const Course = require("../model/Course");
const SuperAdmin = require("../model/SuperAdmin");
const Department = require("../model/Department");

exports.postDepartment = async (req, res, next) => {
  const token = req.headers.authorization;
  let super_admin = await SuperAdmin.findOne({ google_id: { idToken: token } });
  if (!super_admin) {
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
      const dp = await Department.find({ name: i.A });
      if (dp.length === 0) {
        await Department.create({ name: i.A });
      }
    }

    console.log("Departments has been added");
    res.status(200).json({
      statusCode: 200,
      message: "Departments has been added",
    });
  } catch (e) {
    console.log(e.message);
    res.status(404).json({
      statusCode: 404,
      message: "Something Went Wrong",
    });
  }
};

exports.getDepartment = async (req, res, next) => {
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
  let response;
  try {
    response = await Department.find();
    // console.log(response);
    res.status(200).send({
      data: response,
    });
  } catch (e) {
    res.status(418).send({ message: "something went wrong" });
    console.log(e.message);
  }
};

exports.deleteAllDepartment = async (req, res, next) => {
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
  console.log("delete Department");
  try {
    await Department.deleteMany({});
    res.status(200).json({
      statusCode: 200,
      message: "Departments has been deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(401).json({
      statusCode: 401,
      message: "Departments has not been deleted",
    });
  }
};
