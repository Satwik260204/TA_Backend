const Faculty = require("../model/Faculty");
const Student = require("../model/Student");
const Course = require("../model/Course");
const oauth = require("../Common/oauth");
const SuperAdmin = require("../model/SuperAdmin");
const Phase=require("../model/Phase");
//add your email here if you want to be a super admin
let temp = "132101035@smail.iitpkd.ac.in";
const superAdmins = temp.split(",");


exports.userCheck = async (req, res, next) => {
  // console.log("ll");
  if((await Phase.find()).length===0){
    Phase.create({course_phase:false});
    
  }
  try {
    const { userDetails } = req.body;
    let user;
    try {
      user = await oauth(userDetails);
    } catch (error) {
      console.log(error);
    }
    // console.log(user);
    const id = user["sub"];
    const email = user.email.split("@");
    // console.log(email[0]);

    const email_check = email[1];
    // console.log(email_check);
    if (superAdmins.includes(user.email)) {
      // console.log("here");
      let superAdmin = await SuperAdmin.findOne({ email: user.email });
      if (!superAdmin) {
        await SuperAdmin.create({ email: user.email });
        superAdmin = await SuperAdmin.findOne({ email: user.email });
        // res.status(200).json({
        // statusCode: 200,
        // message: "Email is not found in the Database as Super Admin",
        // result: {
        // registered: false,
        // },
        // });
        // return;
      }
      superAdmin.google_id.idToken = `${userDetails}`;
      await superAdmin.save();
      let faculty = await Faculty.findOne();
      let freeze = false;
      let ph1=await Phase.findOne();
      let ph2=await Phase.findOne();
      let ph3=await Phase.findOne();
      
      if (!faculty) {
        freeze = false;
      } else if (faculty.readOnly) {
        freeze = true;
      }
      res.status(200).json({
        statusCode: 200,
        message: "success",
        result: {
          flag: false,
          registered: true,
          position: "super_admin",
          freeze: freeze,
          user_details: user,
          token: userDetails,
          ph1: ph1.course_phase,
          ph2: ph2.student_phase,
          ph3: ph3.faculty_phase,
        },
      });
    } else if (email_check === "iitpkd.ac.in" || email_check === "gmail.com") {
      let faculty = await Faculty.findOne({ email: user.email });
      if (!faculty) {
        res.status(400).json({
          statusCode: 400,
          message: "Email is not found in the Database",
        });
        return;
      }
      faculty.google_id.idToken = `${userDetails}`;
      let role;
      let freeze = false;
      let dp = faculty.department;
      if (faculty.readOnly) {
        role = "readOnly";
        freeze = faculty.readOnly;
      } else if (faculty.isAdmin) {
        role = "admin";
      } else {
        role = "faculty";
      }
      await faculty.save();
      let ph1=await Phase.findOne();
      let ph2=await Phase.findOne();
      let ph3=await Phase.findOne();
      res.status(200).json({
        statusCode: 200,
        message: "success",
        result: {
          flag: false,
          registered: true,
          position: role,
          freeze: freeze,
          user_details: user,
          token: userDetails,
          department: dp,
          ph1: ph1.course_phase,
          ph2: ph2.student_phase,
          ph3: ph3.faculty_phase,
        },
      });
    } else if (email_check === "smail.iitpkd.ac.in") {
      let student = await Student.findOne({ email: user.email });
      if (!student) {
        await Student.create({
          name: user.name,
          email: user.email,
          rollNumber: email[0],
        });
        student = await Student.findOne({ email: user.email });
        student.name = user.name;
        await student.save();
        console.log(email[0]);
        const b = email[0].substring(0, 2);
        const d = email[0].substring(4, 6);
        if (d === "01") {
          student.degree = "BTech";
          switch (b) {
            case "10":
              student.department = "CE";
              break;
            case "11":
              student.department = "CSE";
              break;
            case "12":
              student.department = "EE";
              break;
            case "13":
              student.department = "ME";
              break;
            case "14":
              student.department = "DSE";
              break;
          }
          await student.save();
        } else if (d === "02") {
          student.degree = "MTech";
          switch (b) {
            case "10":
              student.department = "CE";
              break;
            case "11":
              student.department = "CSE";
              break;
            case "12":
              student.department = "EE";
              break;
            case "13":
              student.department = "ME";
              break;
            case "14":
              student.department = "DSE";
              break;
            case "15":
              student.department = "SOCD";
              break;
          }
          await student.save();
        } else if (d === "03" || d === "13") {
          student.degree = "MS";
          switch (b) {
            case "10":
              student.department = "CE";
              break;
            case "11":
              student.department = "CSE";
              break;
            case "12":
              student.department = "EE";
              break;
            case "13":
              student.department = "ME";
              break;
            case "14":
              student.department = "DSE";
              break;
            case "16":
              student.department = "ESSENCE";
              break;
          }
          await student.save();
        } else if (d === "04" || d === "14") {
          student.degree = "PhD";
          switch (b) {
            case "10":
              student.department = "CE";
              break;
            case "11":
              student.department = "CSE";
              break;
            case "12":
              student.department = "EE";
              break;
            case "13":
              student.department = "ME";
              break;
            case "14":
              student.department = "DSE";
              break;
            case "16":
              student.department = "ESSENCE";
              break;
            case "17":
              student.department = "BSE";
              break;
            case "20":
              student.department = "CHEMISTRY";
              break;
            case "21":
              student.department = "MATHEMATICS";
              break;
            case "22":
              student.department = "PHYSICS";
              break;
            case "23":
              student.department = "HUMANITIES";
              break;
          }
          await student.save();
        } else if (d === "05") {
          student.degree = "MSc";
          switch (b) {
            case "20":
              student.department = "CHEMISTRY";
              break;
            case "21":
              student.department = "MATHEMATICS";
              break;
            case "22":
              student.department = "PHYSICS";
              break;
          }
          await student.save();
        }
      }

      student.google_id.idToken = `${userDetails}`;
      await student.save();
      let role = "student";
      let freeze = false;
      let dp = "";
      let flag1 = false;
      let ph1=await Phase.findOne();
      let ph2=await Phase.findOne();
      let ph3=await Phase.findOne();
      
      
      let dg = "";
      if (student.department === "" || !student.degree === "") {
        flag1 = true;
        console.log("entered");
      } else if (student.department) {
        dp = student.department;
        dg = student.degree;
      }
      if (student.readOnly) {
        role = "readOnly";
        freeze = student.readOnly;
      }
      res.status(200).json({
        statusCode: 200,
        message: "success",
        result: {
          flag: flag1,
          registered: true,
          position: role,
          freeze: freeze,
          user_details: user,
          token: userDetails,
          department: dp,
          degree: dg,
          ph1: ph1.course_phase,
          ph2: ph2.student_phase,
          ph3: ph3.faculty_phase,
        },
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Something Went Wrong Please Try again later" });
  }
};
