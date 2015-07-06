'use strict';

angular.module('yellowJacketApp')
  .controller('ReassignactionCtrl', function ($scope, $rootScope, $location) {
    
      
    $('textarea').bind("blur", function (event) { //input[type=text]
       $scope.$apply(function() { //wait for angular..
         setTimeout(function() {
           window.scrollTo(0, 0);
         },500);
       });
    });

      
    $scope.finish = function() { 
        if (!$rootScope.actionupd ||
            ($rootScope.actionupd.reason == null || $rootScope.actionupd.reason.length < 1)) {
            $scope.error=true;
        }
        else 
            $location.path('actionlist');
    };
    
      $scope.back = function() { 
        $rootScope.actionupd = {}
        $location.path('actdetview');
        };
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });