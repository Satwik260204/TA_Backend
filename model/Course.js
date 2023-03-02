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
});

module.exports = mongoose.model("Course", courseSchema);
