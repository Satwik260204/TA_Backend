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
    required: true,
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
});

module.exports = mongoose.model("Student", studentSchema);
