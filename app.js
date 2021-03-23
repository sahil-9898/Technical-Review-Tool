const { urlencoded } = require("body-parser");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
require('dotenv/config');


//connection to DB
mongoose.connect(process.env.DB_CONNECTION,{useNewUrlParser: true, useUnifiedTopology: true}, ()=>{
    console.log("database connected");
});
const users = require("./models/users");
const reviews = require("./models/reviews");


//middlewares
app.use(urlencoded({extended:true}));

let currentUser = "abcd";

//routes
app.get('/', (_, res) => {
    res.render("index.ejs");
});

app.post("/",(req, res) => {
    const eid = req.body.eid;
    users.findOne({eid: eid}, (err, user)=>{
        if(err){
            console.log(err);
            res.redirect("/");
        }else{
            if(user.length===0){
                res.redirect("/");
            }else{
                currentUser = user.designation;
                res.redirect("/home");
            }
        }
    });
});

app.get("/home", (req, res)=>{
    reviews.find({}, (err, reviews)=>{
        if(err){
            console.log(err);
        }else{
            res.render("home.ejs", {reviews:reviews});
        }
    });
});

app.get("/reviewForm", (req, res)=>{
    if(currentUser=="manager"){
        res.render("reviewForm1.ejs");
    }else{
        console.log("You do not have permission to conduct a review");
        res.redirect("/home");
    }
});

app.post("/reviewForm", (req, res)=>{
    const form1 = req.body;
    reviews.create({
        name:form1.reviewName,
        objective:form1.objective,
        panelMembers:[
            {name:form1.name[0]},
            {name:form1.name[1]},
            {name:form1.name[2]},
            {name:form1.name[3]},
            {name:form1.name[4]}
        ]
    },(err, form1)=>{
        if(err){
            console.log(err);
        }else{
            res.redirect("/reviewForm/"+form1._id);
        }
    });
});

app.get("/reviewForm/:id", (req, res)=>{
    const id = req.params.id;
    reviews.findById(id, (err, review)=>{
        if(err){
            console.log(err);
        }else{
            res.render("reviewForm2.ejs", {review:review}); 
        }
    });
});

app.post("/reviewForm/:id", (req, res)=>{
    reviews.findOne({_id:req.params.id}, (err, review)=>{
        if(err){
            console.log(err);
        }else{
            for(let i=0;i<5;i++){
                review.panelMembers[i].comment.comment = req.body.comments[i];
                review.panelMembers[i].comment.severity = req.body.severity[i];
            }
            review.save();
            res.redirect("/home");
        }
    });
});









app.get("/logout", (req,res)=>{
    currentUser = "";
    res.redirect("/");
});


//starting the server on localhost
app.listen(3000, () => {
    console.log("Server started on localhost 3000");
});