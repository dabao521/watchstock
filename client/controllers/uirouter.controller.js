'use strict';

(function(angular){
    angular.module("mainApp")
        .config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider){
            $stateProvider.state("home", {
                url : "/", 
                templateUrl : "/public/main.html", 
                controller : mainCtrl
            });
            
            $urlRouterProvider.otherwise("/");
        }]);
})(window.angular);