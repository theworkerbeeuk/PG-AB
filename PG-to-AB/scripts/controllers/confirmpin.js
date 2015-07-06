'use strict';

angular.module('yellowJacketApp')
    .controller('ConfirmpinCtrl', function (pinService, yjService, unityService, cryptoService, $scope, $rootScope, $timeout, $location) {

        $scope.dot = [false, false, false, false];
        $scope.cpina = ["","","",""];
        $scope.bc = 0;
    
        // settings this to "" in order to avoid that the has-error from previous screens bleeds over to this one here
        $scope.error = "";
        $rootScope.pinmismatch = false;
        
        $scope.buttonHit = function (button) {
            if (button === "back") {
                if ($scope.bc > 0) { $scope.bc = $scope.bc - 1; }
                $scope.dot[$scope.bc] = false;
                $scope.cpina[$scope.bc] = "";
            } else {
                $scope.dot[$scope.bc] = true;
                $scope.cpina[$scope.bc] = button;
                $scope.bc++;
            }
        };

        $scope.$watch('cpina[3]', function () {
            $scope.error = "";
            if ($scope.cpina[3]) {
                 $timeout(function() {
                if ($rootScope.pin === ($scope.cpina[0] + $scope.cpina[1] + $scope.cpina[2] + $scope.cpina[3])) {

                    $rootScope.initCrypto(); // load or create CIPHER key!
                    //if confirmpin is called after a changepin request, then we have to use
                    //changePin as initPin works only for new PINS
                    //the rootScope.oldpin serves for additional security as we check
                    //that the old pin is valid before we set a new one
                    //this variable is set by changepin.js
                    if ($rootScope.changepin==true) 
                        pinService.changePin($rootScope.oldpin,$rootScope.pin);
                    else pinService.initPin($rootScope.pin);
                    
            
                    // $rootScope.registered = true; move this to selcomis and before calling main
                    //resetting error to "" as the remaining error  forces the display of the error in the next screen
                    $rootScope.error = "";
                    $scope.error = "";

                    $rootScope.loggedIn = true;
                    $rootScope.fromLogon = true;
                    if (loadObject("netprefs") === null) { 
                        $location.path("netprefs"); 
                    } else {
                            $rootScope.registered = true;
                            if (!$rootScope.changepin)
                                yjService.uploadData();
                            
                            $location.path("main");
                    }
                    //required so that createpin will display default title when we return to it after a PIN change
                    $rootScope.changepin=false;
                } else {
                    $rootScope.error = "has-error";
                    $scope.error = "has-error";
                    $rootScope.pinmismatch = true;
                    if ($rootScope.changepin) {
                        $location.path("changepin");
                    }
                    else
                        $location.path("createpin");
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