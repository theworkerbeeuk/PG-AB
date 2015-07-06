'use strict';
angular.module('yellowJacketApp') //,['ngAnimate', 'toaster'])//, ['ngAnimate', 'toaster']
.controller('CreatepinCtrl', function (pinService, yjService, storage, $scope, $timeout, $rootScope, $location, $http) { 

    
    if (!$rootScope.pword) {
        $rootScope.pword = loadObject("userpwd");
        if (!$rootScope.pword) {
            console.log("WARNING: password missing");
            $location.path("signin");   
        }
        return;
    }

            
    $rootScope.retrypin = false;
    $rootScope.signedIn = pinService.hasPin();
    
    $scope.dot = [false, false, false, false];
    $scope.pina = ["", "", "", ""];
    $scope.bc = 0;
    $scope.buttonHit = function (button) {
        if (button == "back") {
            if ($scope.bc > 0) $scope.bc = $scope.bc - 1;
            $scope.dot[$scope.bc] = false;
            $scope.pina[$scope.bc] = "";
        } else if (button == "go") {} // ignore for now...
        else {

            $scope.dot[$scope.bc] = true;
            $scope.pina[$scope.bc] = button;
            $scope.bc++;


            if ($scope.bc >= 4) {
                
                $scope.error = "";
                $rootScope.pinmismatch = false;
                $rootScope.pininvalid = false;
                
                //we check if at least one of the numbers differs from the others
                var pinsAreIdentical = true;
                for (var i = 1; i < $scope.pina.length; i++) {
                    if ($scope.pina[i] !== $scope.pina[0]) {
                        pinsAreIdentical = false;
                        break;
                    }
                }

                //if all are identical we reset the screen and display an error
                if (pinsAreIdentical) {
                   if (!$rootScope.signedIn || $rootScope.changepin) { 
                       // why this test? coz diffrent behaviour when signed in bug: MACE-705
                        $scope.bc = 0;
                        $scope.dot = [false, false, false, false];
                        $scope.pina = ["", "", "", ""];
                        $scope.pininvalid = "true";
                        $scope.error="has-error";
                    }
                    else {
                        // else let the watch on pina[3] take care of this
                    }
                    
                } else {
                    $scope.pininvalid = "false";
                }
            }
        }
    };

    $scope.clearall = function () {
        $rootScope.registered = false;
        $rootScope.signedIn = false;
        $rootScope.menu=false;
        $rootScope.actionList=null;
        $location.path("main");
        $scope.error = "";
        $rootScope.error="";
        $rootScope.floorPlans = null;
        $rootScope.pin = null;
        storage.remove();
        localStorage.clear(); // all
    };


    $scope.$watch('pina[3]', function () {
        if ($scope.pina[3]) {
            $timeout(function() {
            // move to confirmpin
            $rootScope.pinfail = $rootScope.pinmismatch = $rootScope.sessiontimeout = null;
            $rootScope.pin = $scope.pina[0] + $scope.pina[1] + $scope.pina[2] + $scope.pina[3];
            
            //if routed here from changepin for entering new, then move to else
            //without rootScope.changepin==false this will go into the changepin cycle
            //and send you to confirm
            //Therefore it is important to set rootScope.changepin to false in main.js
            if (pinService.hasPin() && $rootScope.changepin == false) {
                if (pinService.check($rootScope.pin)) {
                    if (loadObject("netprefs") == null) {
                        // resetting error to "" as the remaining error  forces the display of the error in the next screen
                        $rootScope.error = "";
                        $scope.error = "";
                        $location.path("netprefs");
                    } else {
                        
                        //resetting error to "" as the remaining error  forces the display of the error in the next screen
                        $rootScope.error = "";
                        $scope.error = "";
                        $rootScope.loggedIn = true;
                        $rootScope.fromLogon = true;

                        if (!$rootScope.changepin) {
                            $timeout(function() {
                                  yjService.uploadData();
                              },1000);
                        }
                        $rootScope.registered = true; // pin entered correctly
                        $rootScope.loading = "Loading...";
                        $rootScope.loadingLarge = true; // location data
                        console.log("Path main");
                        $location.path("main");
                    }
                    

                } else { // pin expected but wrong...
                    $scope.dot = [false, false, false, false];
                    $scope.pina = ["", "", "", ""];

                    $scope.failCounter = pinService.getFailedCount();
                    $scope.maxCounter = pinService.getMaxCount();
                    $scope.pinfail = "true";
                    $scope.bc = 0;
                    if ($scope.failCounter >= $scope.maxCounter) {
                        pinService.clearPin();
                        $rootScope.registered = null; // pin entered correctly
                        $rootScope.error = "has-error"; // makes sure that error transmits to Signin
                        $scope.error = "";
                        $rootScope.logonstatus = "TOOMANY";
                        //alert('failed too many times - need to delete this users data!!!');
                        $rootScope.doUserChange();
//                        console.log("too many failures, re-direct with error to signin");
                        $location.path("signin");
                    } else {
                        
                        $rootScope.error = "has-error";
                        $scope.error = "has-error";
                        $location.path("createpin");
                    }
                }
            } else {
                $rootScope.error = "";
                $scope.error = "";
                $location.path("confirmpin"); // establishing a pin - i.e. hasPin false!
            }
                
        }, 100);
        }
                     
    });

//    $rootScope.signedIn = false;

    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
});