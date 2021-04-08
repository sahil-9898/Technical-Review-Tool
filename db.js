const Mongoose = require("mongoose");
require("dotenv/config");

//connection to DB
module.exports = () => {
  Mongoose.connect(
    process.env.DB_CONNECTION,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => {
      console.log("database connected");
    }
  );
};
