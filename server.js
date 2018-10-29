var express = require("express");
var mongoose = require("mongoose");
var path = require("path");

var MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = 3000;

var app = express();

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.use("/public", express.static(path.join(__dirname, "public")));

app.set("view engine", "handlebars");

// Connect to the Mongo DB
mongoose.connect(
  "mongodb://localhost/unit18Populater",
  { useNewUrlParser: true }
);

// Routes
app.get("/", function(req, res) {
  db.Article.find({}, function(err, data) {
    if (data.length === 0) {
      res.send("There's nothing scraped yet.");
    } else {
      res.render("index", { articles: data });
    }
  });
});

app.get("/scrape", function(req, res) {
  axios.get("http://www.nytimes.com/section/world").then(function(response) {
    var $ = cheerio.load(response.data);

    var result = {};

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

      result.title = title;
      result.link = link;
      result.summary = summary;

      db.Article.create(result)
        .then(function(result) {
          console.log(result);
        })
        .catch(function(err) {
          return res.json(err);
        });
    });
    console.log("Scrape finished.");
    res.redirect("/");
  });
});

app.get("/saved", function(req, res) {
  db.Article.find({ saved: true }, null, { sort: { created: -1 } }, function(
    err,
    data
  ) {
    if (data.length === 0) {
      res.send("There's nothing saved yet.");
    } else {
      res.render("index", { articles: data });
    }
  });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
