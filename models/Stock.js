"use strict";

var mongoose =  require("mongoose");
var stockSchema = mongoose.Schema({
    code : String,
    socketID : String
});

module.exports = mongoose.model("Stock", stockSchema);