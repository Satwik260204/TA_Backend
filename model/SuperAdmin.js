const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const facultySchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  google_id: {
    idToken: {
      type: String,
      required: false,
    },
  },
});

module.exports = mongoose.model("SuperAdmin", facultySchema);
