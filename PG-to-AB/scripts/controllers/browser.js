'use strict';

angular.module('yellowJacketApp')
  .controller('BrowserCtrl', function ($scope,  $rootScope, $routeParams, $window, $sce) {
      
    $window.toUrl = $routeParams.locationID;
    $rootScope.toUrl = $sce.trustAsResourceUrl($routeParams.locationID);
    
    // Wait for Cordova to load
    //
    document.addEventListener("deviceready", onDeviceReadyBrowse, false);

    //onDeviceReadyBrowse();
      
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
