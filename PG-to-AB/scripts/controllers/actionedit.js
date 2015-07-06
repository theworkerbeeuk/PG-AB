'use strict';

angular.module('yellowJacketApp')
  .controller('ActioneditCtrl', function ($scope,$rootScope, $location) {
      
      
    $scope.$watch("observation.picture", function(n,o) {
//        alert("obs pic " + $scope.observation.picture);
        if (typeof $scope.observation == 'undefined') return;
        if (typeof $scope.observation.picture != 'undefined' &&
            $scope.observation.picture  != null
           ) {
            $rootScope.picture = $scope.observation.picture;
            $scope.observation.picture = null;
            $rootScope.returnTo = "actiondetails";
            $location.path("capturepic");
        }
    }, true);
      
      
    $scope.continue = function() {
    
      if ($rootScope.observation.actions == null) $rootScope.observation.actions=[];
    
      console.log($rootScope.action);
      $rootScope.observation.actions.push($rootScope.action);
      console.log($rootScope.observation.actions);
      $location.path('sataction');
    };
      
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
