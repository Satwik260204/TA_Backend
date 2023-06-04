const Faculty = require("../model/Faculty");
const Student = require("../model/Student");
const Course = require("../model/Course");
const oauth = require("../Common/oauth");
const SuperAdmin = require("../model/SuperAdmin");

//add your email here if you want to be a super admin
let temp = "102001012@smail.iitpkd.ac.in,102001011@smail.iitpkd.ac.in";
const superAdmins = temp.split(",");

exports.userCheck = async (req, res, next) => {
  // console.log("ll");

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
    const email_check = email[1];
    // console.log(email_check);
    if (superAdmins.includes(user.email)) {
      // console.log("here");
      let superAdmin = await SuperAdmin.findOne({ email: user.email });
      if (!superAdmin) {
        await SuperAdmin.create({ email: user.email });
        superAdmin = await SuperAdmin.findOne({ email: user.email });
        // res.status(200).json({
        //   statusCode: 200,
        //   message: "Email is not found in the Database as Super Admin",
        //   result: {
        //     registered: false,
        //   },
        // });
        // return;
      }
      superAdmin.google_id.idToken = `${userDetails}`;
      await superAdmin.save();
      let faculty = await Faculty.findOne();
      let freeze = false;
      if (!faculty) {
        freeze = false;
      } else if (faculty.readOnly) {
        freeze = true;
      }
      res.status(200).json({
        statusCode: 200,
        message: "success",
        result: {
          registered: true,
          position: "super_admin",
          freeze: freeze,
          user_details: user,
          token: userDetails,
        },
      });
    } else if (
      email_check === "iitpkd.ac.in" ||
      email_check === "gmail.com" ||
      email_check === "smail.iitpkd.ac.in"
    ) {
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
      res.status(200).json({
        statusCode: 200,
        message: "success",
        result: {
          registered: true,
          position: role,
          freeze: freeze,
          user_details: user,
          token: userDetails,
          department: dp,
        },
      });
    }
  } catch (error) {
    console.log(error.response.data);
    res
      .status(500)
      .send({ message: "Something Went Wrong Please Try again later" });
  }
};
