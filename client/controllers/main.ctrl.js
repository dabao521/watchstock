"use strict";

function mainCtrl($scope, stockService, mySocketService, $state){
   $scope.stocks = [];
  // $scope.data = [];
   //set up io socket
   //ioSocketSetup(mySocketService, $scope);
   var socket = io.connect();
            
   socket.on("socket:save", function(data){
      console.log("Wow, someone else is touching me!!! ",data)
      if(!data.hasOwnProperty("quandl_error")) {
            console.log("pushing me");
            $scope.$apply(function(){//very important, $scope.$apply is used when outside angular framework
               $scope.stocks.push(data);
            });
                     
            console.log($scope.stocks);
            var seriesOptions = getSeriesOptions($scope.stocks);
            createChart(seriesOptions);
      }
   });
   
   socket.on("socket:remove", function(data){
      console.log("removing code : ", data);
      var index = findIndexByCode(data, $scope.stocks);
      console.log(index);
      if(index != -1) {
         $scope.$apply(function(){
            $scope.stocks.splice(index, 1);
            var seriesOptions = getSeriesOptions($scope.stocks);
            createChart(seriesOptions);
         });

      }
   });
            
   socket.on("socket id", function(socketID){
      console.log("You are assigned with socket id : " + socketID);
      mySocketService.setSocketID(socketID);
   });
            
   
   //get all stored stock info from backend and update inside stock chart
   
   stockService.get({}).$promise
      .then(function(res){
         $scope.stocks = [];
         var count = 0;
         console.log(res);
         // return;// for debug
         if(res.length == 0) {
            createChart([]);
         }
         res.forEach(function(data){
            console.log(data);
           // $scope.stocks = [];
           // return;
               if(data.hasOwnProperty("quandl_error")){
                  console.log(data.quandl_error);
               }else {
                  $scope.stocks.push(data);
               }
               count++;
               if(count == res.length) {
                  var seriesOptions = getSeriesOptions($scope.stocks);
                  createChart(seriesOptions);   
               }
         });
      })
      .catch(function(err){
         throw err;
      });
   
   //addStock interface
   $scope.addStock = function(){
      if(!window.angular.isDefined($scope.userCode) || $scope.userCode.length == 0) {
         $scope.showErr = true;
         $scope.errInfo = "The userCode cannot be empty";
         return;
      }
      $scope.showErr = false;
      stockService.post({},{
         code : $scope.userCode.toUpperCase(),
         socketID : mySocketService.getSocketID()
      }).$promise
         .then(function(res){
            if(res.hasOwnProperty("quandl_error")){
               $scope.showErr = true;
               $scope.errInfo = res.quandl_error;
               return;
            }
            console.log(res);
            $scope.stocks.push(res);
            var seriesOptions = getSeriesOptions($scope.stocks);
            console.log("seriesOptions : ", seriesOptions);
            createChart(seriesOptions);
         });
   };
   
   //remove stock
   $scope.removeStock = function(index){
      var code = $scope.stocks[index].dataset.dataset_code;
      $scope.stocks.splice(index, 1);
      var seriesOptions = getSeriesOptions($scope.stocks);
      console.log("index, ", index);
      createChart(seriesOptions);
      stockService.delete({
         id : code,
         socketID : mySocketService.getSocketID()
      });
   };
   
   function findIndexByCode(code, stocks){
      var index = -1;
      for(var i = 0; i < stocks.length; i++) {
         if(stocks[i].dataset.dataset_code == code) {
            index = i;
            break;
         }
      }
      return index;
   }
   
   function getSeriesOptions(stocks){
      var rt = [];
      stocks.forEach(function(stock){
         rt.push({
            name : stock.dataset.dataset_code, 
            data : dataMassage(stock.dataset.data)
         });
      });
      return rt;
   }
   
   function dataMassage(data) {
      var rt = [];
      data.forEach(function(item){
         rt.push([new Date(item[0]).getTime(), item[1]]);
      });
      return rt;
   }
   
   function createChart(seriesOptions){
      $("#stockChart").highcharts("StockChart", {
         rangeSelector : {
            selected : 4
         },
         
         yAxis : {
            labels : {
               formatter : function(){
                  return (this.value > 0 ? ' + ' : '') + this.value+ '%'; 
               },
               plotLines : [{
                  value : 0,
                  width : 2,
                  color : 'silver'
               }]
            },
         },
         
         plotOptions : {
            series : {
               compare : "percent"
            }
         },
         
         tooltip : {
            pointFormat : '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
            valueDecimals : 2
         },
         
         series : seriesOptions
      });
   }
}