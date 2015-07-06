'use strict';

angular.module('yellowJacketApp')
  .controller('SelcomisCtrl', function ($scope, $rootScope,  $location, $window, $timeout) {

  
    $scope.nocomms = false;
    $scope.selcomis = function() {
        $location.path("main");
        $rootScope.registered = true;
    }
    
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
