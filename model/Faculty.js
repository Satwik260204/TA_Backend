const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const facultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  google_id: {
    idToken: {
      type: String,
      required: false,
    },
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Faculty", facultySchema);
