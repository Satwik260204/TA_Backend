const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
  },
  allocatedTA: [{ type: Schema.Types.ObjectId, ref: "Student" }],
  allocatedFaculty: { type: Schema.Types.ObjectId, ref: "Faculty" },
  
  taPos:{
    type:Number,
    // default:0,
  },
  BTech:{
    type:[{type:String}],
  },
  MTech:{
    type:[{type:String}],
  },
  MS:{
    type:[{type:String}],
  },
  MSc:{
    type:[{type:String}],
  },
  PhD:{
    type:[{type:String}],
  },
  preferences:[{type: Schema.Types.ObjectId, ref: "Student"}],
  appliedStudents:[{type: Schema.Types.ObjectId, ref: "Student"}],
  type:{
    type:String,
    required:true,
  }
});

module.exports = mongoose.model("Course", courseSchema);