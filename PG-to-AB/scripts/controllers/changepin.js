'use strict';

angular.module('yellowJacketApp')
  .controller('ChangepinCtrl', function (pinService, $scope, $timeout, $rootScope, $location) {
        
//    $('blockquote').on('click', function () {
//        var elem = $(this);
//        //eventually we could use another "on" function to reduce errors automatically
//        //setTimeout(function() {
//        //console.log("error action");
//        $("#chevron").toggleClass('fa-chevron-down fa-chevron-up');
//        elem.toggleClass(' short');
//        //}, 1000);
//
//    });

    $scope.dot = [false, false, false, false];
    $scope.chpina = ["","","",""];
    $scope.bc = 0;
    
    // settings this to "" in order to avoid that the has-error from previous screens bleeds over to this one here
    //$scope.error = "";

    $scope.buttonHit = function (button) {
        if (button === "back") {
            if ($scope.bc > 0) { $scope.bc = $scope.bc - 1; }
            $scope.dot[$scope.bc] = false;
            $scope.chpina[$scope.bc] = "";
        } else {
            $scope.dot[$scope.bc] = true;
            $scope.chpina[$scope.bc] = button;
            $scope.bc++;
        }
    };
            
    $scope.$watch('chpina[3]', function () {
        if ($scope.chpina[3]) {
            $scope.error = "";
             $timeout(function() {
                 
            // move to createpin for creating new pin
            $rootScope.pinfail = null;
            $rootScope.pin = $scope.chpina[0] + $scope.chpina[1] + $scope.chpina[2] + $scope.chpina[3];
            //Before we set the new PIN, we will check again that the old PIN is valid
            //This happens in confirmpin.js
            $rootScope.oldpin = $rootScope.pin;
            if(pinService.check($rootScope.pin)) {
               $rootScope.error = "";
               $scope.error = "";
               $rootScope.changepin = true;
               $location.path("createpin");
            }
            else { // pin expected but wrong...
                $scope.dot = [false, false, false, false];
                $scope.chpina = ["", "", "", ""];
                $scope.failCounter = pinService.getFailedCount();
                $scope.maxCounter = pinService.getMaxCount();
                $scope.pinfail = "true";
                $scope.bc = 0;
                if($scope.failCounter >= $scope.maxCounter) {
                    pinService.clearPin();
                    $rootScope.registered = null; // pin entered correctly
                    $scope.error = "has-error";
                    $rootScope.logonstatus = "TOOMANY";
                    $location.path("signin");
                }
                else {
                    $rootScope.error = "has-error";
                    $scope.error = "has-error";
                    $location.path("changepin");
                }
            }
             },100);
        }
    });

  $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
