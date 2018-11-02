//Mongoose
//------------------------------------
var mongoose = require("mongoose");

//db
//------------------------------------
var Schema = mongoose.Schema;

//db articles obj
//------------------------------------

//Title, link, summary, img, saved boolean, status boolean, date & note
var Articleschema = new Schema({
  title: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    default: "unavailable summary."
  },
  img: {
    type: String,
    default: "unavailable image."
  },
  issaved: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: "Save Article"
  },
  created: {
    type: Date,
    default: Date.now
  },
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

Articleschema.index({ title: "text" });

var Article = mongoose.model("Article", Articleschema);

//Export
//------------------------------------
module.exports = Article;
