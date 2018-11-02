//Depedencies
//------------------------------------
var express = require("express");
var exphbs = require("express-handlebars");
var cheerio = require("cheerio");
var axios = require("axios");
var mongoose = require("mongoose");
var body = require("body-parser");

//Require
//------------------------------------
var Note = require("./models/Note");
var Article = require("./models/Article");

//Initialize/Port
//------------------------------------
var app = express();
var PORT = process.env.PORT || 3000;

// Set Up
//--------------------------------------------
app.use(express.static("public"));
app.use(body.urlencoded({ extended: false }));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//Mongoose
//------------------------------------

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(
  MONGODB_URI,
  { useNewUrlParser: true }
);

// mongoose.Promise = Promise;

var db = mongoose.connection;

db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function() {
  console.log("Mongoose connection successful.");
});

//Mongoose
//------------------------------------
app.get("/", function(req, res) {
  Article.find({}, null, { sort: { created: -1 } }, function(err, data) {
    if (data.length === 0) {
      res.render("placeholder", { message: "Click Scrape for New Articles!" });
    } else {
      res.render("index", { articles: data });
    }
  });
});

//Scrape
//------------------------------------
app.get("/scrape", function(req, res) {
  var result = {};

  axios.get("http://www.nytimes.com/section/world").then(function(response) {
    var $ = cheerio.load(response.data);
    //Scrape elements
    $("div.story-body").each(function(i, element) {
      var link = $(element)
        .find("a")
        .attr("href");
      var title = $(element)
        .find("h2.headline")
        .text()
        .trim();
      var summary = $(element)
        .find("p.summary")
        .text()
        .trim();
      var img = $(element)
        .parent()
        .find("figure.media")
        .find("img")
        .attr("src");
      //store in obj
      result.link = link;
      result.title = title;

      if (summary) {
        result.summary = summary;
      }
      if (img) {
        result.img = img;
      } else {
        result.img = $(element)
          .find(".wide-thumb")
          .find("img")
          .attr("src");
      }

      //New article
      var entry = new Article(result);

      Article.find({ title: result.title }, function(err, data) {
        if (data.length === 0) {
          entry.save(function(err, data) {
            if (err) throw err;
          });
        }
      });
    });
    console.log("Scrape finished.");
    res.redirect("/");
  });
});

//Saved Articles
//------------------------------------
app.get("/saved", function(req, res) {
  Article.find({ issaved: true }, null, { sort: { created: -1 } }, function(
    err,
    data
  ) {
    if (data.length === 0) {
      res.render("placeholder", { message: "Save Articles" });
    } else {
      res.render("saved", { saved: data });
    }
  });
});

//id
//------------------------------------
app.get("/:id", function(req, res) {
  Article.findById(req.params.id, function(err, data) {
    res.json(data);
  });
});

//Save Id
//------------------------------------
app.post("/save/:id", function(req, res) {
  Article.findById(req.params.id, function(err, data) {
    if (data.issaved) {
      Article.findByIdAndUpdate(
        req.params.id,
        { $set: { issaved: false, status: "Save Article" } },
        { new: true },
        function(err, data) {
          res.redirect("/");
        }
      );
    } else {
      Article.findByIdAndUpdate(
        req.params.id,
        { $set: { issaved: true, status: "Saved" } },
        { new: true },
        function(err, data) {
          res.redirect("/saved");
        }
      );
    }
  });
});

//note
//------------------------------------
app.post("/note/:id", function(req, res) {
  var note = new Note(req.body);
  note.save(function(err, doc) {
    if (err) throw err;
    Article.findByIdAndUpdate(
      req.params.id,
      { $set: { note: doc._id } },
      { new: true },
      function(err, newdoc) {
        if (err) throw err;
        else {
          res.send(newdoc);
        }
      }
    );
  });
});

app.get("/note/:id", function(req, res) {
  var id = req.params.id;
  Article.findById(id)
    .populate("note")
    .exec(function(err, data) {
      res.send(data.note);
    });
});
// Server Running
// ------------------------------------
app.listen(PORT, function() {
  console.log("App running on port " + PORT + ".");
});
