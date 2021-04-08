const express = require("express");
const { urlencoded } = require("body-parser");
const dbConnect = require("./db");
const users = require("./models/users");
const reviews = require("./models/reviews.js");
const session = require("express-session");
const redis = require("redis");
const redisConnect = require("connect-redis");

const app = express();
dbConnect();
//middlewares
app.use(urlencoded({ extended: true }));
app.use(express.static("public"));

let RedisStore = redisConnect(session);
let redisClient = redis.createClient();
app.use(
  session({
    name: "eid",
    store: new RedisStore({ client: redisClient, disableTouch: true }),
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
      httpOnly: true,
      sameSite: "lax",
    },
    secret: "sadfdsfdsa",
    resave: false,
  })
);

let currentUser = "abcd";

//routes
app.get("/", (_, res) => {
  res.render("index.ejs");
});

app.post("/", (req, res) => {
  const eid = req.body.eid;
  users.findOne({ eid: eid }, (err, user) => {
    if (err) {
      console.log(err);
      res.redirect("/");
    } else {
      if (user.length === 0) {
        res.redirect("/");
      } else {
        currentUser = user.designation;
        res.redirect("/reviews");
      }
    }
  });
});

app.get("/reviews", (req, res) => {
  reviews.find({}, (err, reviews) => {
    if (err) {
      console.log(err);
    } else {
      res.render("reviews.ejs", { reviews: reviews });
    }
  });
});

app.get("/reviews/:id", (req, res) => {
  reviews.findById(req.params.id, (err, review) => {
    if (err) {
      console.log(err);
    } else {
      res.render("reviewDetails.ejs", { review: review });
    }
  });
});

app.get("/addChanges/:id/:comment", (req, res) => {
  if (currentUser === "developer") {
    reviews.findById(req.params.id, (err, review) => {
      if (err) {
        console.log(err);
      } else {
        res.render("addChanges.ejs", {
          comment: review.panelMembers[req.params.comment],
          id: req.params.id,
          comment: req.params.comment,
          review: review,
        });
      }
    });
  } else {
    console.log("You Do not have permission to add changes");
    res.redirect("/reviews/" + req.params.id);
  }
});

app.post("/addChanges/:id/:comment", (req, res) => {
  reviews.findById(req.params.id, (err, review) => {
    if (err) {
      console.log(err);
    } else {
      review.panelMembers[req.params.comment].comment.changeDesc =
        req.body.changeDesc;
      review.panelMembers[req.params.comment].comment.commitLink =
        req.body.commitLink;
      review.panelMembers[req.params.comment].comment.status = "Acknowledged";
      review.save();
      res.redirect("/reviews/" + req.params.id);
    }
  });
});

app.get("/viewChanges/:id/:comment", (req, res) => {
  reviews.findById(req.params.id, (err, review) => {
    if (err) {
      console.log(err);
    } else {
      res.render("viewChanges.ejs", {
        review: review,
        comment: review.panelMembers[req.params.comment],
      });
    }
  });
});

app.get("/reviewForm", (req, res) => {
  if (currentUser == "manager") {
    res.render("reviewForm1.ejs");
  } else {
    console.log("You do not have permission to conduct a review");
    res.redirect("/reviews");
  }
});

app.post("/reviewForm", (req, res) => {
  const form1 = req.body;
  reviews.create(
    {
      name: form1.reviewName,
      objective: form1.objective,
      panelMembers: [
        { name: form1.name[0] },
        { name: form1.name[1] },
        { name: form1.name[2] },
        { name: form1.name[3] },
        { name: form1.name[4] },
      ],
    },
    (err, form1) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/reviewForm/" + form1._id);
      }
    }
  );
});

app.get("/reviewForm/:id", (req, res) => {
  const id = req.params.id;
  reviews.findById(id, (err, review) => {
    if (err) {
      console.log(err);
    } else {
      res.render("reviewForm2.ejs", { review: review });
    }
  });
});

app.post("/reviewForm/:id", (req, res) => {
  reviews.findOne({ _id: req.params.id }, (err, review) => {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < 5; i++) {
        review.panelMembers[i].comment.comment = req.body.comments[i];
        review.panelMembers[i].comment.severity = req.body.severity[i];
      }
      review.save();
      res.redirect("/reviews");
    }
  });
});

app.get("/logout", (req, res) => {
  currentUser = "";
  res.redirect("/");
});

//starting the server on localhost
app.listen(3000, () => {
  console.log("Server started on localhost 3000");
});
