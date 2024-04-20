const Faculty = require("../model/Faculty");
const Student = require("../model/Student");
const Course = require("../model/Course");
("use strict");
const excelToJson = require("convert-excel-to-json");
const SuperAdmin = require("../model/SuperAdmin");
const Department = require("../model/Department");

exports.getFaculties = async (req, res, next) => {
  //   console.log("www");
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
    response = await Faculty.find().populate({
      path: "courses",
      populate: {
        path: "allocatedTA",
        model: "Student",
      },
    });
    // console.log(response);
    res.status(200).send({
      data: response,
    });
  } catch (e) {
    res.status(418).send({ message: "something went wrong" });
    //console.log(e.message);
  }
};

exports.postTAtoFaculty = async (req, res, next) => {
  //console.log(req.body);

  const token = req.headers.authorization;
  let faculty1 = await Faculty.findOne({ google_id: { idToken: token } });
  if (!faculty1) {
    res.status(401).json({
      statusCode: 401,
      message: "Session timed out! Please Sign-In again.",
      result: null,
    });
    return;
  }
  const { students } = req.body;
  const { faculty } = req.body;
  const { courses } = req.body;

  //   console.log(info);

  if (!students || !faculty || !courses) {
    res.status(418).send({ message: "Missing Data" });
  }

  try {
    const getCourse = await Course.find({ name: courses.value });
    getCourse[0].preferences = [];
    for (let i of students) {
      // let sample = "student1(102001012)";
      // console.log(sample.match(/\(([^)]+)\)/)[1]);
      // let sample1 = sample.match(/\(([^)]+)\)/)[0];
      // console.log(sample.replace(sample1, ""));
      const roll = i.value.match(/\(([^)]+)\)/)[1];
      const temp = i.value.match(/\(([^)]+)\)/)[0];
      const studentName = i.value.replace(temp, "");

      const getStudent = await Student.find({
        rollNumber: roll,
        name: studentName,
      });
      //console.log(getStudent);
      if (getStudent.length === 0) {
        res.status(408).send({ message: "Student not found" });
        return;
      }
      // if (getStudent[0].isAssgined === true) {
      //   res.status(410).send({ message: "Student is already a TA" });
      //   return;
      // }
      const getFaculty = await Faculty.find({ email: faculty.email });
      if (getFaculty.length === 0) {
        res.status(409).send({ message: "Faculty not found" });
        return;
      }

      try {
        getCourse[0].preferences.push(getStudent[0]._id);
        await getCourse[0].save();
      } catch (e) {
        res.status(418).send({ message: "Something Went Wrong" });
        console.log(e.message);
      }
    }

    let response;
    try {
      response = await Faculty.find().populate({
        path: "courses",
        populate: {
          path: "preferences",
          model: "Student",
        },
      });
    } catch (e) {
      res.status(418).send({ message: "something went wrong" });
      console.log(e.message);
    }
    let stdResponse;
    try {
      stdResponse = await Student.find();
      //console.log(stdResponse);
    } catch (e) {
      console.log(e.message);
    }
    res.status(200).json({
      statusCode: 200,
      message: "Preferences have been added",
      result: {
        data1: response,
        data2: stdResponse,
      },
    });
    // res.status(200).send({ message: "TA's has been allocated" });
    console.log("Preferences have been added");
  } catch (e) {
    console.log(e.message);
    res.status(418).send({ message: "something went wrong" });
  }
};
exports.postAddCourse = async (req, res, next) => {
  const token = req.headers.authorization;
  let faculty1 = await Faculty.findOne({ google_id: { idToken: token } });
  if (!faculty1) {
    res.status(401).json({
      statusCode: 401,
      message: "Session timed out! Please Sign-In again.",
      result: null,
    });
    return;
  }
  console.log(req.body);
  const { name } = req.body;
  const { faculty } = req.body;
  const { number } = req.body;
  const { btech } = req.body;
  const { mtech } = req.body;
  const { ms } = req.body;
  const { msc } = req.body;
  const { phd } = req.body;
  const { course_code } = req.body;

  if (
    !name ||
    !course_code ||
    !faculty ||
    !number ||
    !btech ||
    !mtech ||
    !msc ||
    !ms ||
    !phd
  ) {
    res.status(418).send({ message: "Missing Data" });
  }

  try {
    const ft = await Faculty.find({ email: faculty.email });
    const cr = await Course.find({ code: course_code });
    if (cr.length === 0) {
      await Course.create({
        name: name,
        taPos: number,
        code: course_code,
        allocatedFaculty: ft[0]._id,
      });
      const x = await Course.find({ code: course_code });
      ft[0].courses.push(x[0]._id);
      await ft[0].save();
    } else {
      cr[0].BTech = [];
      cr[0].MTech = [];
      cr[0].MS = [];
      cr[0].MSc = [];
      cr[0].PhD = [];
      // cr[0].name = name;
      cr[0].taPos = number;
      await cr[0].save();
    }
    const ct = await Course.find({ code: course_code });
    for (let i of btech) {
      if (i.value !== "NOT ELIGIBLE") {
        ct[0].BTech.push(i.value);
      }
    }
    for (let i of mtech) {
      if (i.value !== "NOT ELIGIBLE") {
        ct[0].MTech.push(i.value);
      }
    }
    for (let i of ms) {
      if (i.value !== "NOT ELIGIBLE") {
        ct[0].MS.push(i.value);
      }
    }
    for (let i of msc) {
      if (i.value !== "NOT ELIGIBLE") {
        ct[0].MSc.push(i.value);
      }
    }
    for (let i of phd) {
      if (i.value !== "NOT ELIGIBLE") {
        ct[0].PhD.push(i.value);
      }
    }
    await ct[0].save();

    console.log("Course has been added");
    res.status(200).json({
      statusCode: 200,
      message: "Course has been added",
    });
  } catch (e) {
    console.log(e.message);
    res.status(404).json({
      statusCode: 404,
      message: "Something Went Wrong",
    });
  }
};
exports.postFaculty = async (req, res, next) => {
  // const { name } = req.body;
  // const { email } = req.body;

  // if (!name || !email) {
  // res.status(418).send({ message: "missing data" });
  // }

  // try {
  // await Faculty.create({ name: name, email: email });
  // console.log("Faculty added");
  // res.status(200).send({ message: "Faculty has been added" });
  // } catch (e) {
  // console.log(e.message);
  // res.status(417).send({ message: "Faculty has not been added" });
  // }
  const token = req.headers.authorization;
  let superAdmin = await SuperAdmin.findOne({ google_id: { idToken: token } });
  let faculty = await Faculty.findOne({
    google_id: { idToken: token },
    isAdmin: true,
  });
  if (!faculty && !superAdmin) {
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
    //console.log(result);
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
      const fc = await Faculty.find({ name: i.A, email: i.B });
      const cr = await Course.find({ name: i.C });
      if (fc.length === 0) {
        await Faculty.create({ name: i.A, email: i.B, department: i.D });
        await Course.create({ name: i.C, code: i.E, type: i.F });
        const ft = await Faculty.find({ name: i.A, email: i.B });
        const cr = await Course.find({ name: i.C, code: i.E, type: i.F });

        ft[0].courses.push(cr[0]._id);
        cr[0].allocatedFaculty = ft[0]._id;
        await ft[0].save();
        await cr[0].save();
      } else {
        if (cr.length === 0) {
          await Course.create({ name: i.C, code: i.E, type: i.F });
          const ft = await Faculty.find({ name: i.A, email: i.B });
          const cr = await Course.find({ name: i.C });

          ft[0].courses.push(cr[0]._id);
          cr[0].allocatedFaculty = ft[0]._id;
          await ft[0].save();
          await cr[0].save();
        }
      }
    }

    console.log("Faculties has been added");

    res.status(200).json({
      statusCode: 200,
      message: "Faculties has been added",
    });
  } catch (e) {
    console.log(e.message);
    res.status(404).json({
      statusCode: 404,
      message: "Something Went Wrong",
    });
  }
};
exports.postFacultyCourse = async (req, res, next) => {
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
  // console.log("get Faculty");
  const { email } = req.body;
  let response;
  try {
    response = await Faculty.find({ email: email }).populate({
      path: "courses",
      populate: {
        path: "appliedStudents",
        model: Student,
      },
    });
    //console.log(response);
    res.status(200).send({
      data: response[0],
    });
    // console.log("data sent");
  } catch (e) {
    res.status(418).send({ message: "something went wrong" });
    console.log(e.message);
  }
};

exports.deleteAllFaculty = async (req, res, next) => {
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
  console.log("delete Faculty");
  try {
    await Faculty.deleteMany({});
    await Course.deleteMany({});
    res.status(200).json({
      statusCode: 200,
      message: "Faculties has been deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(401).json({
      statusCode: 401,
      message: "Faculties has not been deleted",
    });
  }
};
exports.getSelectCourses = async (req, res, next) => {
  // console.log("select courses");
  const token = req.headers.authorization;
  let super_admin = await SuperAdmin.findOne({ google_id: { idToken: token } });
  let faculty = await Faculty.findOne({ google_id: { idToken: token } });
  if (!faculty && !super_admin) {
    res.status(401).json({
      statusCode: 401,
      message: "Session timed out! Please Sign-In again.",
      result: null,
    });
    return;
  }
  let response;
  let x = [];
  try {
    if (super_admin) {
      response = await Course.find();
    } else if (faculty) {
      if (faculty.isAdmin) {
        deptFaculty = await Faculty.find({
          department: faculty.department,
        }).populate({
          path: "courses",
          model: Course,
        });
        for (let i of deptFaculty) {
          for (let j of i.courses) {
            x.push(j);
          }
        }
        response = x;
        console.log("admin");
        //console.log(response);
      } else {
        // console.log("xxxxxxxxx121x");
        response = await Course.find({ allocatedFaculty: faculty._id });
        // console.log(response);
      }
    }

    res.status(200).send({
      data: response,
    });
  } catch (e) {
    res.status(418).send({ message: "something went wrong" });
  }
};

exports.deleteCourse = async (req, res, next) => {
  const token = req.headers.authorization;
  let super_admin = await SuperAdmin.findOne({ google_id: { idToken: token } });
  let faculty = await Faculty.findOne({ google_id: { idToken: token } });
  if (!faculty && !super_admin) {
    res.status(401).json({
      statusCode: 401,
      message: "Session timed out! Please Sign-In again.",
      result: null,
    });
    return;
  }

  const { delete_code } = req.body;
  if (!delete_code) {
    res.status(418).send({ message: "Missing Data" });
  }
  console.log("deletedelete");

  try {
    for (let i of delete_code) {
      await Course.deleteOne({ code: i.label })
        .then(() => {
          console.log("selected course is deleted");
        })
        .catch((e) => {
          console.log(e);
        });
    }
    res.status(200).json({
      statusCode: 200,
      message: "Selected Course is Deleted",
    });
  } catch (e) {
    res.status(404).json({
      statusCode: 404,
      message: "Something Went Wrong",
    });
  }
};
