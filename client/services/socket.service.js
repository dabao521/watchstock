"use strict";

(function(angular){
    angular.module("mainApp")
        .factory("mySocketService", function(){
            var socketID = undefined;
            
            return {
                setSocketID:  function(ID){
                    socketID = ID;
                    console.log("socket id : " + socketID + " is saved in the service!");
                },
                
                getSocketID : function(){
                    return socketID;
                }
            };
        });
})(window.angular);