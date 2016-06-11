'use strict';

(function(angular){
    angular.module("mainApp")
        .controller("mainCntl", function(mySocketService){
            var socket = io.connect();
            
            socket.on("socket:save", function(data){
                console.log("Wow, someone else is touching me!!! " + data);
            });
            
            socket.on("socket id", function(socketID){
                console.log("You are assigned with socket id : " + socketID);
                mySocketService.setSocketID(socketID);
            })
        });
})(window.angular);