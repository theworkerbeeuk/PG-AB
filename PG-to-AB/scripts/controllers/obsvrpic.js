'use strict';

angular.module('yellowJacketApp')
  .controller('ObsvrpicCtrl', function ($scope, $rootScope, $location) {
      
    $scope.manage = function() { // go back to text and possibly other bits
        $location.path("obsrvsum");
    };
      
    $scope.takepic = false;
    $scope.photo = function() { // take and store a new photo
//        alert("no new pictures please");
        $scope.takepic = true;
    };
      
      
    $scope.addphoto = function() { // add existing pics
 //       alert('no old pics please..');
    }
      
      
    $scope.$watch("observation.picture", function(n,o) {
//        alert("obs pic " + $scope.observation.picture);
        if (typeof $scope.observation == 'undefined') return;
        if (typeof $scope.observation.picture != 'undefined' &&
            $scope.observation.picture  != null
           ) {
            $rootScope.picture = $scope.observation.picture;
            $scope.observation.picture = null;
            $rootScope.returnTo = "obsvrpic";
            $location.path("capturepic");
        }
    }, true);
      
    $scope.continue = function() {
        
        if ($scope.observation.situation.name=='Unsatisfactory') {
            $location.path('createaction');
        }
        else $location.path('sataction');
    }
    
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
