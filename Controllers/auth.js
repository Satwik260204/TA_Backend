const Faculty = require("../model/Faculty");
const Student = require("../model/Student");
const Course = require("../model/Course");
const oauth = require("../Common/oauth");

exports.userCheck = async (req, res, next) => {
  try {
    const { userDetails } = req.body;
    let user = await oauth(userDetails);
    // console.log(user);
    const id = user["sub"];
    const email = user.email.split("@");
    const email_check = email[1];

    if (email_check === "iitpkd.ac.in" || email_check === "gmail.com") {
      let faculty = await Faculty.findOne({ email: user.email });
      if (!faculty) {
        res.status(200).json({
          statusCode: 200,
          message: "success",
          result: {
            registered: false,
            position: "faculty",
            user_details: user,
            token: userDetails,
          },
        });
        return;
      }
      faculty.google_id.idToken = userDetails.idToken;
      let role;
      if (faculty.isAdmin) {
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
          user_details: user,
          token: userDetails,
        },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "kuch toh gadbad hue" });
  }
};
