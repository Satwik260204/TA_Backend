const express = require("express");
const app = express();

const mongoose = require("mongoose");
const Faculty = require("./model/Faculty");
const Student = require("./model/Student");
const SuperAdmin = require("./model/SuperAdmin");
require('dotenv').config();

const cors = require("cors");

// const temp = async () => {
//   await Faculty.create({
//     name: "Prathamesh",
//     email: "prathameshjondhale100@gmail.com",
//   });
// };
// temp();

// const temp = async () => {
//   await SuperAdmin.create({
//     name: "Prathamesh Student",
//     email: "102001012@smail.iitpkd.ac.in",
//   });
// };
// temp();

// const bodyParser = require("body-parser");
// const fileupload = require("express-fileupload");

const MONGODB_URI =
  "mongodb+srv://Akuma:ta-allocation@cluster0.d0iqjdo.mongodb.net/test";

const facultyRoute = require("./routes/faculty");
const studentRoute = require("./routes/student");
const authRoute = require("./routes/auth_check");
const superAdminRoute = require("./routes/super_admin");
const departmentRoute = require("./routes/department");
const emailRoute = require("./routes/email");
// run();

// async function run() {
//   //   const res = await Student.find({ name: "student2" });
//   //   const res1 = await Faculty.find({ name: "faculty1" });

//   //   console.log(res[0]._id.toString());
//   //   console.log(res1);

//   //   res1[0].allocatedTA.push(res[0]._id);
//   //   await res1[0].save();

//   const res1 = await Faculty.find({ name: "faculty1" }).populate("allocatedTA");

//   console.log(res1[0].allocatedTA);
// }

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(fileupload());
// app.use(express.static("files"));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*",
  })
);
app.use("/file", express.static(__dirname + "/upload", { fallthrough: false }));
app.use(facultyRoute);
app.use(studentRoute);
app.use(authRoute);
app.use(superAdminRoute);
app.use(departmentRoute);
app.use(emailRoute);

mongoose
  .connect(MONGODB_URI)
  .then((res) =>
    app.listen(4000, () => console.log("server is running on port 4000"))
  )
  .catch((e) => console.log(e.message));
