const Faculty = require("../model/Faculty");
const Student = require("../model/Student");
const Course = require("../model/Course");
const SuperAdmin = require("../model/SuperAdmin");
const Phase=require("../model/Phase");

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

  // let student_pref = {
  // 'A': ['ME', 'CE', 'CS'],
  // 'B': ['CE', 'ME', 'CS'],
  // 'C': ['CE', 'ME', 'CS'],
  // 'D': ['ME', 'CS', 'CE'],
  // 'E': ['CS', 'ME', 'CE'],
  // 'F': ['ME', 'CE', 'CS'],
  // 'G': ['CS', 'CE', 'ME'],
  // 'H':['ME','CE','CS'],
  // 'I':['CE','ME','CS'],
  // 'J':['CS','ME','CE']
  // };

  // let course_pref = {
  // 'ME': ['A', 'B', 'C', 'D','H','I','J'],
  // 'CE': ['C', 'F', 'B', 'G'],
  // 'CS': ['E', 'A', 'J','G', 'F','I','H']
  // };

  // let course_pos = {
  // 'ME': 3,
  // 'CE': 2,
  // 'CS': 3,
  // };
  let student_pref = {};
  let course_pref = {};
  let course_pos = {};
  let res1 = await Student.find().populate({
    path: "preferences",
    model: Course,
  });
  for (let i of res1) {
    let arr = [];
    for (let j of i.preferences) {
      arr.push(j.code);
    }
    student_pref[i.rollNumber] = arr;
  }
  //console.log(student_pref);
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
  // console.log(course_pref);
  // console.log(course_pos);

  let temp_alloc = [];
  let free_students = Object.keys(student_pref);

  function begin_match(student) {
    let removed = false;
    for (let pref of student_pref[student]) {
      let taken_match = temp_alloc.filter((couple) => couple.includes(pref));
      if (!course_pref[pref].includes(student)) {
        continue;
      }
      if (taken_match.length < course_pos[pref]) {
        temp_alloc.push([student, pref]);
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
          temp_alloc = temp_alloc.filter((couple) => couple[0] !== max_rank[1]);
          //console.log(`removed from temp_alloc [${[max_rank[1], pref]}]`);
          free_students.push(max_rank[1]);
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
  }

  function stable_matching() {
    while (free_students.length > 0) {
      begin_match(free_students[0]);
    }
  }

  function main() {
    stable_matching();
    //console.log("Final Allocation list is: ");
    // console.log(temp_alloc);
  }

  main();
  //console.log(temp_alloc);

  try {
    res.status(200).send({
      data: temp_alloc,
    });
  } catch (e) {
    res.status(418).send({
      message: "not working",
    });
  }
};
exports.postPh1 = async (req,res,next)=>{
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
 
  try{
    const {ph1} = req.body;
    let ph=await Phase.findOne();
    ph.course_phase=ph1;
    await ph.save();

    res.status(200).json({
      statusCode: 200,
      message: "Course Phase has been changed",
    });

  }catch(e){
    console.log(e);
    res.status(404).json({
      statusCode: 404,
      message: "Something Went Wrong",
    });
  }

};
exports.postPh2 = async (req,res,next)=>{
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
  
  try{
    const {ph2} = req.body;
    let ph=await Phase.findOne();
    ph.student_phase=ph2;
    await ph.save();

    res.status(200).json({
      statusCode: 200,
      message: "Student Phase has been changed",
    });

  }catch(e){
    console.log(e);
    res.status(404).json({
      statusCode: 404,
      message: "Something Went Wrong",
    });
  }

};

exports.postPh3 = async (req,res,next)=>{
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

  try{
    const {ph3} = req.body;
    let ph=await Phase.findOne();
    ph.faculty_phase=ph3;
    await ph.save();

    res.status(200).json({
      statusCode: 200,
      message: "Faculty Phase has been changed",
    });

  }catch(e){
    console.log(e);
    res.status(404).json({
      statusCode: 404,
      message: "Something Went Wrong",
    });
  }

};
