const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  eid: String,
  designation: String,
});

module.exports = mongoose.model("users", userSchema);
