const { urlencoded } = require("body-parser");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
require('dotenv/config');


//connection to DB
mongoose.connect(process.env.DB_CONNECTION,{useNewUrlParser: true, useUnifiedTopology: true}, ()=>{
    console.log("database connected");
});
const user = require("./models/user");


//middlewares
app.use(urlencoded({extended:true}));


//routes
app.get('/', (_, res) => {
    res.render("index.ejs");
});

app.post("/",(req, res) => {
    const eid = req.body.eid;
    user.find({eid: eid}, (err, user)=>{
        if(err){
            console.log(err);
            res.redirect("/");
        }else{
            if(user.length===0){
                res.redirect("/");
            }else{
                res.render("home.ejs", {user:user[0]});
            }
        }
    });
});






//starting the server on localhost
app.listen(3000, () => {
    console.log("Server started on localhost 3000");
});