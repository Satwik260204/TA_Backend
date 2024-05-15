const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: false,
    default:"",
  },
  degree: {
    type: String,
    required: false,
    default:"",
  },
  rollNumber: {
    type: Number,
    required: true,
  },
  isAssgined: {
    type: Boolean,
    required: true,
    default: false,
  },
  assignedFaculty: {
    type: Schema.Types.ObjectId,
    ref: "Faculty",
  },
  assignedCourse: {
    type: Schema.Types.ObjectId,
    ref: "Course",
  },
  otherDepartment:{
    type:String,
    required: false,
    default: "",
  },
  google_id: {
    idToken: {
      type: String,
      required: false,
    },
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  preferences:[{course:{type: Schema.Types.ObjectId, ref: "Course"},number:{type:Number,default:-1}}],
});

module.exports = mongoose.model("Student", studentSchema);