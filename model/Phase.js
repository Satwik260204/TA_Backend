const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const phaseSchema = new mongoose.Schema({
    course_phase : {
        type:Boolean,
        default:false,
    },
    student_phase : {
        type:Boolean,
        default:false,
    },
    faculty_phase : {
        type:Boolean,
        default:false,
    }
  });
  
  module.exports = mongoose.model("Phase", phaseSchema);