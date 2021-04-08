const Mongoose = require("mongoose");
require("dotenv/config");
//connection to DB
const dbConnect = () => {
  Mongoose.connect(
    process.env.DB_CONNECTION,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => {
      console.log("database connected");
    }
  );
};

module.exports = dbConnect;
