"use strict";

(function(angular){
    angular.module("mainApp")
        .factory("stockService", function($resource){
            return $resource("/api/stocks/:id/:socketID", null, {
                get : {
                    method : "GET",
                    isArray:  true
                }, 
                
                post : {
                    method : "POST"
                },
                
                delete : {
                    method : "DELETE"
                }
            })
        })
})(window.angular);