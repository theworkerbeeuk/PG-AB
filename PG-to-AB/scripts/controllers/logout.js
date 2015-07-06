'use strict';

angular.module('yellowJacketApp')
  .controller('LogoutCtrl', function ($scope, $rootScope, $location) {
    
    $rootScope.menu = false;
    $rootScope.loggedIn = false;
    $rootScope.backg(false);

    $location.path("createpin");
      
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
