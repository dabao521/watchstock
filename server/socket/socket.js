"use strict";

var Stocks = require("../../models/Stock.js");
var https = require("https");

//var eventEmitter = require("events");

module.exports = function(app, io){
    io.on("connection", function(socket){
        console.log("new customer is stepping in: " + socket);
        //socketRegister(socket);
        socket.emit("socket id", socket.id); // send back socket id to client for future use
        socket.on("disconnect", function(){
            console.log("Customer is leaving the websocket");
        });
    });
    
    //start db listening service
    var events = ["save", "remove"];
    
    events.forEach(function(event){
        if(event == "remove") {
            Stocks.schema.post("remove", function(doc){
                console.log("removing doc : ", doc);
                io.sockets.connected[doc.socketID].broadcast.emit("socket:remove", doc.code);
            });
            return;
        }        
        Stocks.schema.post(event, function(doc){
             console.log("saving listener : ", doc);
            //console.log(io.sockets.connected[doc.socketID]);
            //get the stock data
            var promise = new Promise(function(resolve, reject){
                https.get(getFinalUrl(doc.code), function(res){
                    var data = "";
                    res.on("data", function(chunk){
                        data = data + chunk;
                    });
                    
                    res.on("end", function(){
                        data = JSON.parse(data);
                        resolve(data);
                    });
                    
                    res.on("error", function(err){
                        throw err;
                    });
                });
            });
            promise.then(function(data){
                console.log("saving broadcasting!!!");
                io.sockets.connected[doc.socketID].broadcast.emit("socket:"+event, data);
            });             
        });
    });
    
    function getFinalUrl(code){
        var date = new Date();
        var endDate = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
        var year = date.getFullYear() - 1;
        var startDate = year + "-" + date.getMonth() + "-" + date.getDate();
        var queryUrl = "https://www.quandl.com/api/v3/datasets/WIKI/";
        return queryUrl + code + ".json?api_key=vvsDHjAZgTmmisp2k2ZB&" + "start_date=" + startDate + "&end_date="  + endDate  + "&order=asc&column_index=4"
    }
    
    
}