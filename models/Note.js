//Mongoose
//------------------------------------
var mongoose = require("mongoose");

//db
//------------------------------------
var Schema = mongoose.Schema;

//note obj
//------------------------------------
//title and body
var Noteschema = new Schema({
  title: {
    type: String
  },
  body: {
    type: String
  }
});

var Note = mongoose.model("Note", Noteschema);

//export
//------------------------------------
module.exports = Note;
