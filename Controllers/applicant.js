const Faculty = require("../model/Faculty");
const Student = require("../model/Student");
const Course = require("../model/Course");
("use strict");
const excelToJson = require("convert-excel-to-json");
const SuperAdmin = require("../model/SuperAdmin");
const Department = require("../model/Department");

exports.postDgDp = async (req, res, next) => {
  const token = req.headers.authorization;
  let student = await Student.findOne({ google_id: { idToken: token } });
  if (!student) {
    res.status(401).json({
      statusCode: 401,
      message: "Session timed out! Please Sign-In again.",
      result: null,
    });
    return;
  }
  /* console.log(req.body); */
  const { email } = req.body;
  const { deg } = req.body;
  const { bra } = req.body;
  if (!email || !deg || !bra) {
    res.status(418).send({ message: "Missing Data" });
  }

  try {
    let st = await Student.findOne({ email: email });
    //console.log(st);
    st.degree = deg.value;
    st.department = bra.value;
    await st.save();
    console.log("Deg,Bra has been added");
    res.status(200).json({
      statusCode: 200,
      message: "Degree and Department have been added",
    });
  } catch (e) {
    console.log(e.message);
    res.status(404).json({
      statusCode: 404,
      message: "Something Went Wrong",
    });
  }
};

exports.getCourses = async (req, res, next) => {
  const token = req.headers.authorization;
  let student = await Student.findOne({ google_id: { idToken: token } });
  // console.log("hem");
  if (!student) {
    res.status(401).json({
      statusCode: 401,
      message: "Session timed out! Please Sign-In again.",
      result: null,
    });
    return;
  }

  let response, response2;
  try {
    switch (student.degree) {
      case "BTech":
        response = await Course.find({
          $or: [
            {
              BTech: student.department,
            },
            { BTech: student.otherDepartment },
          ],
        }).populate({
          path: "allocatedFaculty",
        });
        // console.log(response);
        break;
      case "MTech":
        response = await Course.find({
          $or: [
            { MTech: student.department },
            { MTech: student.otherDepartment },
          ],
        }).populate({
          path: "allocatedFaculty",
        });
        // console.log(response);
        break;
      case "MS":
        response = await Course.find({
          $or: [{ MS: student.department }, { MS: student.otherDepartment }],
        }).populate({
          path: "allocatedFaculty",
        });
        // console.log(response);
        break;
      case "MSc":
        response = await Course.find({
          $or: [{ MSc: student.department }, { MSc: student.otherDepartment }],
        }).populate({
          path: "allocatedFaculty",
        });
        // console.log(response);
        break;
      case "PhD":
        response = await Course.find({
          $or: [{ PhD: student.department }, { PhD: student.otherDepartment }],
        }).populate({
          path: "allocatedFaculty",
        });
        // console.log(response);
        break;
    }

    response2 = await Student.findOne({
      google_id: { idToken: token },
    }).populate({
      path: "preferences",
      populate: {
        path: "allocatedFaculty",
        model: Faculty,
      },
    });

    // console.log(response2);
    res.status(200).send({
      data: response,
      data2: response2,
    });
  } catch (e) {
    res.status(418).send({ message: "something went wrong" });
    //console.log(e.message);
  }
};

exports.postApplyTa = async (req, res, next) => {
  const token = req.headers.authorization;
  let student = await Student.findOne({ google_id: { idToken: token } });
  // console.log("hem");
  if (!student) {
    res.status(401).json({
      statusCode: 401,
      message: "Session timed out! Please Sign-In again.",
      result: null,
    });
    return;
  }

  try {
    const { pref1 } = req.body;
    const { pref2 } = req.body;
    const { pref3 } = req.body;
    const { pref4 } = req.body;
    const { pref5 } = req.body;
    // const {email}=req.body.student;
    if (!pref1 && !pref2 && !pref3 && !pref4 && !pref5) {
      res.status(418).send({ message: "Missing Data" });
    }
    const [code1, code2, code3, code4, code5] = [
      pref1.value,
      pref2.value,
      pref3.value,
      pref4.value,
      pref5.value,
    ];
    const code = [code1, code2, code3, code4, code5];
    student.preferences = [];
    for (let i = 0; i < code.length; i++) {
      if (code[i]) {
        let cr = await Course.find({ code: code[i] });
        student.preferences.push(cr[0]._id);
        await student.save();
        // cr[0].appliedStudents.push(student._id);
        // await cr[0].save();
      } else {
        code[i] = "-1";
      }
    }
    console.log("code");
    console.log(code);
    let response;
    switch (student.degree) {
      case "BTech":
        response = await Course.find({
          BTech: student.department,
        });

        break;
      case "MTech":
        response = await Course.find({
          MTech: student.department,
        });

        break;
      case "MS":
        response = await Course.find({
          MS: student.department,
        });

        break;
      case "MSc":
        response = await Course.find({
          MSc: student.department,
        });

        break;
      case "PhD":
        response = await Course.find({
          PhD: student.department,
        });

        break;
    }

    let other_courses = response.filter(
      (course) =>
        course.code !== code[0] &&
        course.code !== code[1] &&
        course.code !== code[2] &&
        course.code !== code[3] &&
        course.code !== code[4]
    );

    console.log(other_courses);
    for (let i of other_courses) {
      let cr = await Course.find({ code: i.code });
      student.preferences.push(cr[0]._id);
      await student.save();
    }
    res.status(200).json({
      statusCode: 200,
      message: "Preferences have been added",
    });
  } catch (e) {
    console.log(e);
    res.status(404).json({
      statusCode: 404,
      message: "Something Went Wrong",
    });
  }
};
