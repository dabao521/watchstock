"use strict";

var Stocks = require("../../models/Stock.js");

var queryUrl = "https://www.quandl.com/api/v3/datasets/WIKI/";
var https = require("https");

module.exports = function(app){
    this.getStocksFromDB = function(req, res, next){
        Stocks.find({}, function(err, stocks){
            if(err){
                throw err;
            }
            // use a recursive call to collect all stock info
            var rt = [];
           // console.log(stocks);
         //   rt = collectStock(0, stocks, rt);
            var count = 0; // classic to record the end of async processes
            if(stocks.length == 0) {
                return res.json([]);
            }
            stocks.forEach(function(stock){
                var date = new Date();
                var endDate = date.getFullYear() + "-" + date.getMonth()+ "-" + date.getDate();
                var year = date.getFullYear() - 1;
                var startDate = year + "-" + date.getMonth() + "-" + date.getDate();
                var finalUrl = getFinalUrl(stock.code, startDate, endDate);   
                retrieveStock(finalUrl)
                    .then(function(data){
                      //  console.log(data);
                        if(data.hasOwnProperty("quandl_error")){
                        }else {
                            rt.push(data);
                        }
                        count++;
                        if(count == stocks.length) {
                          //  console.log(rt);
                            res.json(rt);
                        }
                    });
            });
        });
    };
    
    this.storeStocksInDB = function(req, res, next){
        var date = new Date();
        var endDate = date.getFullYear() + "-" + date.getMonth()+ "-" + date.getDate();
        var year = date.getFullYear() - 1;
        var startDate = year + "-" + date.getMonth() + "-" + date.getDate();
        console.log("dates: ", startDate, endDate);
        console.log(req.body);
        var finalUrl = getFinalUrl(req.body.code, startDate, endDate); 
        console.log(finalUrl);
        Stocks.findOne({"code" : req.body.code}, function(err, result){
            if(err) {
                throw err;
            }
            if(!result) {
                var newStock = new Stocks(req.body);
                retrieveStock(finalUrl)
                    .then(function(data){
                        if(!data.hasOwnProperty("quandl_error")){
                            newStock.save(function(err){
                                if(err){
                                    throw err;
                                }
                            });
                        }
                        res.json(data);
                        
                    })
                    .catch(function(err){
                        throw err;
                    });
            }else {
                return res.json({
                            quandl_error : "you already have the stock in show"
                });
            }
        })
    };
    
    this.removeStock = function(req, res, next){
      //  console.log("removing : ", req.params.id);
       // console.log("socketiD : ", req.params.socketID);
        Stocks.findOneAndUpdate({"code" : req.params.id},{"$set" : {"socketID" : req.params.socketID}}, function(err, stock){
            if(err) {
                throw err;
            }
            if(stock) {
               // console.log("updated stock : ", stock);
                Stocks.findOne({"code" : req.params.id}, function(err, newstock){
                    if(err){
                        throw err;
                    }
                 //   console.log("new stock:", newstock);
                    newstock.remove();
                })
            }
        })
    };
    
    function collectStock(index, stocks, rt) {
        if(index >= stocks.length) {
            console.log(rt);
            return rt;
        }
        var date = new Date();
        var endDate = date.getFullYear() + "-" + date.getMonth()+ "-" + date.getDate();
        var year = date.getFullYear() - 1;
        var startDate = year + "-" + date.getMonth() + "-" + date.getDate();
        var finalUrl = getFinalUrl(stocks[index].code, startDate, endDate);
        rt.push({
            code : stocks[index].code,
            pmomiseData : retrieveStock(finalUrl)
        });
        collectStock(index + 1, stocks, rt);
    }
    
    function getFinalUrl(code, startDate, endDate){
        return queryUrl + code + ".json?api_key=vvsDHjAZgTmmisp2k2ZB&" + "start_date=" + startDate + "&end_date="  + endDate  + "&order=asc&column_index=4"
    }
    
    function retrieveStock(url){
        return new Promise(function(resolve, reject){
                    https.get(url, function(res){
                                    var data= "";
                                    res.on("data", function(chunk){
                                        data = data + chunk
                                    });
                                    
                                    res.on("end", function(){
                                        data = JSON.parse(data);
                                     //   console.log(data);
                                        resolve(data);
                                    });
                                    
                                    res.on("error", function(err){
                                        throw err;
                                    });
                                })
                    })        
    }
};