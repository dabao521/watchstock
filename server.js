var express = require("express"),
  dotenv = require("dotenv"),
  mongoose = require("mongoose"),
  bodyParser = require("body-parser"),
  routes = require(process.cwd() + "/server/routes"),
  sockets = require(process.cwd() + "/server/socket/socket.js");
  
var app = express();
var server = require("http").Server(app);

dotenv.load();

var db = mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/stockwatch");

// middleware
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use("/public", express.static(process.cwd() + "/public"));
app.use("/controllers", express.static(process.cwd()  + "/client/controllers"));
app.use("/client", express.static(process.cwd()  + "/client"));
app.use("/services", express.static(process.cwd() + "/client/services"));

//routes
routes(app);

//socket
var io = require("socket.io")(server);
sockets(app, io);

server.listen(process.env.PORT || "8080", function(){
  console.log("express server is listening on port : " + process.env.PORT || "8080");
});