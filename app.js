const { urlencoded } = require("body-parser");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
require('dotenv/config');


//connection to DB
mongoose.connect(process.env.DB_CONNECTION,{useNewUrlParser: true, useUnifiedTopology: true});
const user = require("./models/user");


//middlewares
app.use(urlencoded({extended:true}));


//routes
app.get('/', (_, res) => {
    res.render("index.ejs");
});






//starting the server on localhost
app.listen(3000, () => {
    console.log("Server started on localhost 3000");
});