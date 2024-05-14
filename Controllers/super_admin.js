const Faculty = require("../model/Faculty");
const Student = require("../model/Student");
const Course = require("../model/Course");
const SuperAdmin = require("../model/SuperAdmin");
const Phase = require("../model/Phase");
const Timeline = require("../model/Timeline");
const CsvParser = require("json2csv").Parser;

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
 }

 const data = [];
 for (let i of response) {
 let temp = {
 value: `${i.name}` + `(${i.email})`,
 label: `${i.name}` + `(${i.email})`,
 department: `${i.department}`,
 };
 if (!i.isAdmin) {
 data.push(temp);
 }
 }

 res.status(200).send({
 message: "Faculties has been assigned admin",
 result: {
 data: data,
 },
 });
 console.log("Faculties has been assigned admin");
 } catch (error) {
 console.log(e.message);
 res.status(418).send({ message: "something went wrong" });
 }
};

exports.getFreezeAll = async (req, res, next) => {
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
 let faculties;
 try {
 faculties = await Faculty.find();
 } catch (error) {
 console.log(error);
 res.status(400).send({
 message: "Something went wrong!",
 });
 }

 for (let i of faculties) {
 i.readOnly = true;
 await i.save();
 }

 res.status(200).send({
 message: "The Freezed phase is enabled",
 });
};

exports.getUnFreezeAll = async (req, res, next) => {
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
 let faculties;
 try {
 faculties = await Faculty.find();
 } catch (error) {
 console.log(error);
 res.status(400).send({
 message: "Something went wrong!",
 });
 }

 for (let i of faculties) {
 i.readOnly = false;
 await i.save();
 }

 res.status(200).send({
 message: "The Freezed phase is disabled",
 });
};
exports.getAllocation = async (req, res, next) => {
 const token = req.headers.authorization;

 let student_pref_lab = {};
 let student_pref_btc = {};
 let student_pref_stc = {};
 let student_pref_oth = {};
 let course_pref = {};
 let course_pos = {};
 let res1 = await Student.find().populate({
 path: "preferences.course",
 model: Course,
 });
 for (let i of res1) {
 let arr1 = [],
 arr2 = [],
 arr3 = [],
 arr4 = [];
 for (let j of i.preferences) {
 if (j.course.type === "LAB") {
 arr1.push(j.course.code);
 } else if (j.course.type === "BTC") {
 arr2.push(j.course.code);
 } else if (j.course.type === "STC") {
 arr3.push(j.course.code);
 } else if (j.course.type === "OTH") {
 arr4.push(j.course.code);
 }
 }
 student_pref_lab[i.rollNumber] = arr1;
 student_pref_btc[i.rollNumber] = arr2;
 student_pref_stc[i.rollNumber] = arr3;
 student_pref_oth[i.rollNumber] = arr4;
 }
 // console.log("lab");
 // console.log(student_pref_lab);
 let res2 = await Course.find().populate({
 path: "preferences",
 model: Student,
 });
 for (let i of res2) {
 let arr = [];
 for (let j of i.preferences) {
 arr.push(j.rollNumber.toString());
 }
 course_pref[i.code] = arr;
 }
 for (let i of res2) {
 course_pos[i.code] = i.taPos;
 }
 // console.log("cpref");
 // console.log(course_pref);
 // console.log("cpos");
 // console.log(course_pos);

 let temp_alloc = [];

 // LAB ALLOCATION STARTS HERE

 let free_students = Object.keys(student_pref_lab);
 // console.log(free_students);

 while (free_students.length > 0) {
 let student = free_students[0];
 try {
 let st = await Student.findOne({ rollNumber: student });
 // console.log(st);

 let removed = false;
 if (!st.isAssgined) {
 for (let pref of student_pref_lab[student]) {
 let taken_match = temp_alloc.filter((couple) =>
 couple.includes(pref)
 );
 if (!course_pref[pref].includes(student)) {
 continue;
 }
 if (taken_match.length < course_pos[pref]) {
 temp_alloc.push([student, pref]);
 st.isAssgined = true;

 //console.log(`added to temp_alloc [${[student, pref]}]`);
 free_students.splice(free_students.indexOf(student), 1);
 //console.log(`removed from FREE STUDENTS ${student}`);
 removed = true;
 break;
 } else {
 let student_rank = course_pref[pref].indexOf(student);
 let max_rank = [-1, -1];
 for (let match of taken_match) {
 let comp_rank = [course_pref[pref].indexOf(match[0]), match[0]];
 if (comp_rank[0] > max_rank[0]) {
 max_rank[0] = comp_rank[0];
 max_rank[1] = comp_rank[1];
 }
 }
 if (max_rank[0] > student_rank) {
 //console.log(`added to temp_alloc [${[student, pref]}]`);
 temp_alloc.push([student, pref]);
 st.isAssgined = true;
 temp_alloc = temp_alloc.filter(
 (couple) => couple[0] !== max_rank[1]
 );
 //console.log(`removed from temp_alloc [${[max_rank[1], pref]}]`);
 free_students.push(max_rank[1]);
 let st2 = await Student.findOne({ rollNumber: max_rank[1] });
 st2.isAssgined = false;
 await st2.save();
 //console.log(`added to FREE STUDENTS ${max_rank[1]}`);
 free_students.splice(free_students.indexOf(student), 1);
 //console.log(`removed from FREE STUDENTS ${student}`);
 removed = true;
 break;
 }
 }
 }
 if (!removed) {
 free_students.splice(free_students.indexOf(student), 1);
 //console.log(`no allocations for ${student}`);
 }
 } else {
 free_students.splice(free_students.indexOf(student), 1);
 }
 await st.save();
 } catch (e) {
 console.log(e);
 }
 }
 // BTC ALLOCATION STARTS HERE

 free_students = Object.keys(student_pref_btc);
 // console.log(free_students);

 while (free_students.length > 0) {
 let student = free_students[0];
 try {
 let st = await Student.findOne({ rollNumber: student });
 // console.log(st);

 let removed = false;
 if (!st.isAssgined) {
 for (let pref of student_pref_btc[student]) {
 let taken_match = temp_alloc.filter((couple) =>
 couple.includes(pref)
 );
 if (!course_pref[pref].includes(student)) {
 continue;
 }
 if (taken_match.length < course_pos[pref]) {
 temp_alloc.push([student, pref]);
 st.isAssgined = true;

 //console.log(`added to temp_alloc [${[student, pref]}]`);
 free_students.splice(free_students.indexOf(student), 1);
 //console.log(`removed from FREE STUDENTS ${student}`);
 removed = true;
 break;
 } else {
 let student_rank = course_pref[pref].indexOf(student);
 let max_rank = [-1, -1];
 for (let match of taken_match) {
 let comp_rank = [course_pref[pref].indexOf(match[0]), match[0]];
 if (comp_rank[0] > max_rank[0]) {
 max_rank[0] = comp_rank[0];
 max_rank[1] = comp_rank[1];
 }
 }
 if (max_rank[0] > student_rank) {
 //console.log(`added to temp_alloc [${[student, pref]}]`);
 temp_alloc.push([student, pref]);
 st.isAssgined = true;
 temp_alloc = temp_alloc.filter(
 (couple) => couple[0] !== max_rank[1]
 );
 //console.log(`removed from temp_alloc [${[max_rank[1], pref]}]`);
 free_students.push(max_rank[1]);
 let st2 = await Student.findOne({ rollNumber: max_rank[1] });
 st2.isAssgined = false;
 await st2.save();
 //console.log(`added to FREE STUDENTS ${max_rank[1]}`);
 free_students.splice(free_students.indexOf(student), 1);
 //console.log(`removed from FREE STUDENTS ${student}`);
 removed = true;
 break;
 }
 }
 }
 if (!removed) {
 free_students.splice(free_students.indexOf(student), 1);
 //console.log(`no allocations for ${student}`);
 }
 } else {
 free_students.splice(free_students.indexOf(student), 1);
 }
 await st.save();
 } catch (e) {
 console.log(e);
 }
 }

 // STC ALLOCATION STARTS HERE
 free_students = Object.keys(student_pref_stc);
 console.log("free_students");

 while (free_students.length > 0) {
 let student = free_students[0];
 try {
 let st = await Student.findOne({ rollNumber: student });
 // console.log(st);

 let removed = false;
 if (!st.isAssgined) {
 for (let pref of student_pref_stc[student]) {
 let taken_match = temp_alloc.filter((couple) =>
 couple.includes(pref)
 );
 if (!course_pref[pref].includes(student)) {
 continue;
 }
 if (taken_match.length < course_pos[pref]) {
 temp_alloc.push([student, pref]);
 st.isAssgined = true;

 //console.log(`added to temp_alloc [${[student, pref]}]`);
 free_students.splice(free_students.indexOf(student), 1);
 //console.log(`removed from FREE STUDENTS ${student}`);
 removed = true;
 break;
 } else {
 let student_rank = course_pref[pref].indexOf(student);
 let max_rank = [-1, -1];
 for (let match of taken_match) {
 let comp_rank = [course_pref[pref].indexOf(match[0]), match[0]];
 if (comp_rank[0] > max_rank[0]) {
 max_rank[0] = comp_rank[0];
 max_rank[1] = comp_rank[1];
 }
 }
 if (max_rank[0] > student_rank) {
 //console.log(`added to temp_alloc [${[student, pref]}]`);
 temp_alloc.push([student, pref]);
 st.isAssgined = true;
 temp_alloc = temp_alloc.filter(
 (couple) => couple[0] !== max_rank[1]
 );
 //console.log(`removed from temp_alloc [${[max_rank[1], pref]}]`);
 free_students.push(max_rank[1]);
 let st2 = await Student.findOne({ rollNumber: max_rank[1] });
 st2.isAssgined = false;
 await st2.save();
 //console.log(`added to FREE STUDENTS ${max_rank[1]}`);
 free_students.splice(free_students.indexOf(student), 1);
 //console.log(`removed from FREE STUDENTS ${student}`);
 removed = true;
 break;
 }
 }
 }
 if (!removed) {
 free_students.splice(free_students.indexOf(student), 1);
 //console.log(`no allocations for ${student}`);
 }
 } else {
 free_students.splice(free_students.indexOf(student), 1);
 }
 await st.save();
 } catch (e) {
 console.log(e);
 }
 }
 // OTHERS ALLOCATION STARTS HERE
 // free_students = Object.keys(student_pref_btc);
 // console.log(free_students);

 // while (free_students.length > 0) {
 // let student = free_students[0];
 // try {
 // let st = await Student.findOne({ rollNumber: student });
 // // console.log(st);

 // let removed = false;
 // if (!st.isAssgined) {
 // for (let pref of student_pref_btc[student]) {
 // let taken_match = temp_alloc.filter((couple) =>
 // couple.includes(pref)
 // );
 // if (!course_pref[pref].includes(student)) {
 // continue;
 // }
 // if (taken_match.length < course_pos[pref]) {
 // temp_alloc.push([student, pref]);
 // st.isAssgined = true;

 // //console.log(`added to temp_alloc [${[student, pref]}]`);
 // free_students.splice(free_students.indexOf(student), 1);
 // //console.log(`removed from FREE STUDENTS ${student}`);
 // removed = true;
 // break;
 // } else {
 // let student_rank = course_pref[pref].indexOf(student);
 // let max_rank = [-1, -1];
 // for (let match of taken_match) {
 // let comp_rank = [course_pref[pref].indexOf(match[0]), match[0]];
 // if (comp_rank[0] > max_rank[0]) {
 // max_rank[0] = comp_rank[0];
 // max_rank[1] = comp_rank[1];
 // }
 // }
 // if (max_rank[0] > student_rank) {
 // //console.log(`added to temp_alloc [${[student, pref]}]`);
 // temp_alloc.push([student, pref]);
 // st.isAssgined = true;
 // temp_alloc = temp_alloc.filter(
 // (couple) => couple[0] !== max_rank[1]
 // );
 // //console.log(`removed from temp_alloc [${[max_rank[1], pref]}]`);
 // free_students.push(max_rank[1]);
 // let st2 = await Student.findOne({ rollNumber: max_rank[1] });
 // st2.isAssgined = false;
 // await st2.save();
 // //console.log(`added to FREE STUDENTS ${max_rank[1]}`);
 // free_students.splice(free_students.indexOf(student), 1);
 // //console.log(`removed from FREE STUDENTS ${student}`);
 // removed = true;
 // break;
 // }
 // }
 // }
 // if (!removed) {
 // free_students.splice(free_students.indexOf(student), 1);
 // //console.log(`no allocations for ${student}`);
 // }
 // }else{
 // free_students.splice(free_students.indexOf(student), 1);
 // }
 // await st.save();
 // } catch (e) {
 // console.log(e);
 // }
 // }

 console.log("temp alloc:");
 console.log(temp_alloc);
 for (let i of temp_alloc) {
 let cr = await Course.findOne({ code: i[1] });
 let st = await Student.findOne({ rollNumber: i[0] });
 cr.allocatedTA.push(st._id);
 await cr.save();
 }

 try {
 res.status(200).json({
 statusCode: 200,
 message: "Allocation has been started",
 });
 } catch (e) {
 res.status(418).send({
 message: "Something went wrong",
 });
 }
};
exports.postPh1 = async (req, res, next) => {
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

 try {
 const { ph1 } = req.body;
 let ph = await Phase.findOne();
 ph.course_phase = ph1;
 await ph.save();

 res.status(200).json({
 statusCode: 200,
 message: "Course Phase has been changed",
 });
 } catch (e) {
 console.log(e);
 res.status(404).json({
 statusCode: 404,
 message: "Something Went Wrong",
 });
 }
};
exports.postPh2 = async (req, res, next) => {
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

 try {
 const { ph2 } = req.body;
 let ph = await Phase.findOne();
 ph.student_phase = ph2;
 await ph.save();
 if (ph2) {
 let cr = await Course.find();

 for (let i of cr) {
 i.appliedStudents = [];
 await i.save();
 }
 } else {
 let st = await Student.find();
 // console.log(st);
 for (let s of st) {
 for (let i of s.preferences) {
 let c = await Course.findOne({ _id: i.course });
 console.log(c);
 c.appliedStudents.push({
 student:s._id,
 number:i.number,
 });
 await c.save();
 }
 }
 }

 res.status(200).json({
 statusCode: 200,
 message: "Student Phase has been changed",
 });
 } catch (e) {
 console.log(e);
 res.status(404).json({
 statusCode: 404,
 message: "Something Went Wrong",
 });
 }
};

exports.postPh3 = async (req, res, next) => {
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

 try {
 const { ph3 } = req.body;
 let ph = await Phase.findOne();
 ph.faculty_phase = ph3;
 await ph.save();

 res.status(200).json({
 statusCode: 200,
 message: "Faculty Phase has been changed",
 });
 } catch (e) {
 console.log(e);
 res.status(404).json({
 statusCode: 404,
 message: "Something Went Wrong",
 });
 }
};

exports.getCsv = async (req, res, next) => {
 const token = req.headers.authorization;
 let super_admin1 = await SuperAdmin.findOne({
 google_id: { idToken: token },
 });
 // console.log("data");
 // if (!super_admin1) {
 // res.status(401).json({
 // statusCode: 401,
 // message: "Session timed out! Please Sign-In again.",
 // result: null,
 // });
 // return;
 // }

 try {
 const response = await Course.find({})
 .populate({
 path: "allocatedTA",
 model: Student,
 })
 .populate({
 path: "allocatedFaculty",
 model: Faculty,
 });
 let allocation = [];
 for (let i of response) {
 const { code, name } = i;
 const facName = i.allocatedFaculty.name;
 const facEmail = i.allocatedFaculty.email;
 let stdNames = "",
 stdEmails = "",
 stdRolls = "";
 for (let j of i.allocatedTA) {
 stdNames = stdNames + j.name + ",";
 stdEmails += j.email + ",";
 stdRolls += j.rollNumber + ",";
 }

 allocation.push({
 code,
 name,
 facName,
 facEmail,
 stdNames,
 stdEmails,
 stdRolls,
 });
 }
 const csvFields = [
 "Course_Code",
 "Course_Name",
 "Faculty",
 "Faculty_Email",
 "TA_Names",
 "TA_Emails",
 "TA_RollNumbers",
 ];
 const csvParser = new CsvParser({ csvFields });
 const csvData = csvParser.parse(allocation);

 res.setHeader("Content-Type", "text/csv");
 res.setHeader("Content-Disposition", "attachment: filename=TAdata.csv");
 res.status(200).end(csvData);
 } catch (e) {
 console.log(e);
 res.status(404).json({
 statusCode: 404,
 message: "Something Went Wrong",
 });
 }
};

exports.postTimeline=async (req,res,next)=>{
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
 };
 const {bmin,bmax,mtechmin,mtechmax,msmin,msmax,mscmin,mscmax,phdmin,phdmax}=req.body;
 console.log(req.body);
 console.log(!mtechmax);
 if(!bmin || !bmax || !mtechmin || !mtechmax || !msmin || !msmax || !mscmin || !mscmax || !phdmin || !phdmax){
 res.status(400).send({ message: "Missing Data" });
 return;
 }
 try{
 let tm=await Timeline.findOne();
 tm.BTech.min=bmin;
 tm.BTech.max=bmax;
 tm.MTech.min=mtechmin;
 tm.MTech.max=mtechmax;
 tm.MS.min=msmin;
 tm.MS.max=msmax;
 tm.MSc.min=mscmin;
 tm.MSc.max=mscmax;
 tm.PhD.min=phdmin;
 tm.PhD.max=phdmax;
 await tm.save();

 res.status(200).json({
 statusCode: 200,
 message: "Year limit have been set",
 });

 }catch(e){
 res.status(404).json({
 statusCode: 404,
 message: "Something Went Wrong",
 });
 }

}