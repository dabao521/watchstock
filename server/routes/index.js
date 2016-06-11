"use strict";

var cntlClass = require("./route.controller.js");

module.exports = function(app){
    app.get("/", function(req, res, next){
        return res.sendfile(process.cwd() + "/public/index.html");
    });
    
    var cntl = new cntlClass(app);
    
    app.get("/api/stocks", cntl.getStocksFromDB);
    
    app.post("/api/stocks", cntl.storeStocksInDB);
    
    app.delete("/api/stocks/:id/:socketID", cntl.removeStock)
};