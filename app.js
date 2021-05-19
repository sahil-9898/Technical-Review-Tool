const express = require("express");
const { urlencoded } = require("body-parser");
const dbConnect = require("./db");
const users = require("./models/users");
const reviews = require("./models/reviews.js");
const session = require("express-session");
const redis = require("redis");
const redisConnect = require("connect-redis");
const app = express();
require("dotenv/config");
dbConnect();

app.use(urlencoded({ extended: true })); //bodyParser
app.use(express.static("public")); //Styles

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
    secret: process.env.SECRET,
    resave: false,
  })
);

// let currentUser = "abcd";

//---------------routes-------------------------------------------
app.get("/", (req, res) => {
  if (!req.session.currentUser) res.render("index.ejs");
  else res.redirect("/reviews");
});

app.post("/", (req, res) => {
  const eid = req.body.eid;
  users.findOne({ eid: eid }, (err, user) => {
    if (err) {
      console.log(err);
      res.redirect("/");
    } else {
      if (user == null) {
        res.redirect("/");
      } else {
        req.session.currentUser = user.designation;
        // currentUser = user.designation;
        res.redirect("/reviews");
      }
    }
  });
});

app.get("/reviews", (req, res) => {
  if (!req.session.currentUser) {
    res.redirect("/");
  } else {
    reviews.find({}, (err, reviews) => {
      if (err) {
        console.log(err);
      } else {
        res.render("reviews.ejs", { reviews: reviews });
      }
    });
  }
});

app.get("/reviews/:id", (req, res) => {
  if (!req.session.currentUser) {
    res.redirect("/");
  } else {
    reviews.findById(req.params.id, (err, review) => {
      if (err) {
        console.log(err);
      } else {
        res.render("reviewDetails.ejs", { review: review });
      }
    });
  }
});

app.get("/addChanges/:id/:comment", (req, res) => {
  if (req.session.currentUser === "developer") {
    reviews.findById(req.params.id, (err, review) => {
      if (err) {
        console.log(err);
      } else {
        res.render("addChanges.ejs", {
          comment: review.panelMembers[req.params.comment],
          id: req.params.id,
          commentIndex: req.params.comment,
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
  reviews.findById(req.params.id, async (err, review) => {
    if (err) {
      console.log(err);
    } else {
      review.panelMembers[req.params.comment].comment.changeDesc =
        req.body.changeDesc;
      review.panelMembers[req.params.comment].comment.commitLink =
        req.body.commitLink;
      review.panelMembers[req.params.comment].comment.status = "Acknowledged";
      await review.save();
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
  if (req.session.currentUser == "manager") {
    res.render("reviewForm1.ejs");
  } else {
    console.log("You do not have permission to conduct a review");
    res.redirect("/reviews");
  }
});

app.post("/reviewForm", (req, res) => {
  if (!req.session) {
    res.redirect("/");
  } else {
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
  }
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
  // currentUser = "";
  req.session.destroy();
  res.redirect("/");
});

//starting the server on localhost
app.listen(3000, () => {
  console.log("Server started on localhost 3000");
});
