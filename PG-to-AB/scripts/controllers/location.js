'use strict';

angular.module('yellowJacketApp')
  .controller('LocationCtrl', function ($scope, $rootScope, $location, $timeout) {
    
      
    $('textarea').bind("blur", function (event) { //input[type=text]
       $scope.$apply(function() { //wait for angular..
         setTimeout(function() {
           window.scrollTo(0, 0);
         },500);
       });
    });

    if ($rootScope.selectedCommission == null) {
        $rootScope.selectedCommission = loadObject("selectedCommission");
    }
      
    if ($rootScope.floordata && $rootScope.observation.selectedfloor) {
        $rootScope.observation.selectedfloor.x = $rootScope.floordata.x;
        $rootScope.observation.selectedfloor.y = $rootScope.floordata.y;
        $rootScope.floordata = null;
    }
    $scope.cid = $rootScope.selectedCommission.id;
    
    if ($rootScope.location && $rootScope.location[$scope.cid] != null &&
        $rootScope.location[$scope.cid].floorPlans != null &&
        $rootScope.location[$scope.cid].floorPlans.length > 0) {
        $scope.floors = $rootScope.location[$scope.cid].floorPlans;
        $scope.haveloc = true;
    }

//    $scope.$watch('haveUserMeta', function() {
//            // $scope.cid = $rootScope.selectedCommission.id;
//            //console.log('lo: ' +  $rootScope.haveUserMeta + ", " + $scope.cid + $rootScope.location[$scope.cid]);
//            if ($rootScope.haveUserMeta && $rootScope.location[$scope.cid]) {
//                $scope.haveloc = true;
//                $scope.floors = $rootScope.location[$scope.cid].floorPlans;
//            }
//    });
    
    $scope.selfloor = function(fp) {
        
        window.scrollTo(0, 0);

        $timeout(function() {
          $rootScope.observation.selectedfloor = fp;
          $rootScope.returnTo = "obsrvsum";
          $location.path("floorplan");
        }, 100);        
        
    }
    
    $scope.goback = function() {
        $location.path("obsrvtn");
    };
    
    $scope.location = function() {
//        console.log ("Got to location function");
        $scope.locplan = true;
    };
      
    $scope.confirm = function(payload) { 
        
        if ( ($scope.observation.locdesc == null || $scope.observation.locdesc.length < 1) && $scope.selectedfloor == null) {
            $scope.locnerror=true;
        }
        else 
            $location.path("obsrvsum");
    }

    
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
