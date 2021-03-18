const express = require("express");
const mongoose = require("mongoose");
require('dotenv/config');
const app = express();



//routes
app.get('/', (_, res) => {
    res.send("Root route");
});



//connection to DB
mongoose.connect(process.env.DB_CONNECTION,{useNewUrlParser: true },
    () =>{console.log("Connected to database");}
    );


//starting the server on localhost
app.listen(3000, () => {
    console.log("Server started on localhost 3000");
});