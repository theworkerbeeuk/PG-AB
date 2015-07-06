'use strict';


angular.module('yellowJacketApp')
    .controller('SigninCtrl', function ($scope, $location, pinService, cryptoService, unityService, yjService, $rootScope, $window,$timeout, storage) {

     $scope.ready=true;
     $scope.$on('NETSTAT', function() {
        $rootScope.netstat = $scope.netstat;
        if ($scope.netstat == Connection.UNKNOWN ||
            $scope.netstat == Connection.NONE) {
            // no connection.
            $scope.error = "has-error";
            $scope.logonstatus = 'NONETWORK';
            $('#unameInput').blur();
            $('#pwordInput').blur();
            $('#errorModal').delay(100).modal();
            return false;
        }
        else {
            $scope.error = "";
        }
     });
    
    // new logic to try and load password from disk..
    
    // happening too soon crypto and file system not yet loaded
    $scope.waiting = true;
    console.log("____ WAITING");
    $scope.$on('ready4work', function() {
        $scope.waiting = false;
        $rootScope.pword = loadObject('userpwd');

        if (pinService.hasPin() && $rootScope.pword) {
            $rootScope.changepin = false; // make sure that createpin will ask for pin and not for pin change
            $location.path("createpin"); // user has a pin, enter it
            return;
        }

    })
    
    if ($rootScope.ready4Work) {
        $scope.$broadcast('ready4work'); // race issue what if we are ready before this page loads.
    }
    
    
    $scope.uname = null;
    $scope.pword = null;
    
                
    $scope.register = function (useAnyNetwork) {
        $scope.error = false;
        $scope.ready=true;
        
        $('#unameInput').blur();
        $('#pwordInput').blur();
        $window.scrollTo(0,0);
        
//        var networkState=checkConnection();// >> need to watch $scope.netstat - as call is already made so have to be a bit more clever - waiting on netstat object -- perhaps we disable buttons until we have netstat set up by the broadcast catcher above - need to have timeout for desktop though
        //Paul: I intentionally make another call, as I am not sure that we can guarantee that the network connection is still available once we register. People won't necessarily turn it off like it did, but they may enter a tunnel or elevator or lose connection through other means, so I think that it might be saver to check for a connection just before we save, register etc. What do you think?
        
        var broadband=true;
        var mobile=false;
        try {
            var networkState=checkConnection(); // checking here <-- device has to be ready before we do this. 
            broadband=isBroadband(networkState);
            $rootScope.haveWifi = broadband;
            mobile=isMobile(networkState);
            $rootScope.haveG3 = mobile;
        }
        catch(e) {
            console.log(">> " +e);
        }
        var cont=true;
        //DEVPATCH for forcing the mobile question on a PC
        //broadband=false;mobile=true;
        

        if (!$scope.uname || !$scope.pword) {
            $scope.error = "has-error";
            $scope.logonstatus = "INVALIDPASSWORD";
            $('#errorModal').delay(100).modal();
            cont=false;
            return false;
        }
        //if no "big" data connection is available, then we consider that we cannot register.
        else if (broadband==false && mobile==false) {
            $scope.error = "has-error";
            $scope.logonstatus = 'NONETWORK';
            $('#errorModal').delay(100).modal();
            cont=false;
            return false;
        }
        //if user says use mobile, then bypass furhter checks
        else if (useAnyNetwork==true) {
            cont=true;
        }
        //if no "cheap big" data connection is available, then we consider that we have to ask the user.
        else if (broadband==false && mobile==true) {
            //alert("domodal");
            $('#commsModal').delay(100).modal();
            cont=false;
            return false;
        }
                
        if (cont==true) {

            $scope.error = "";
            $scope.ready=false;
            //console.log("signin.ifhasunamepword");
            var p = $rootScope.doUserChange(); // make sure old data is removed.

            p.then(function() {
                var v = $rootScope.config.version;
                $rootScope.uname = $scope.uname;
                $rootScope.pword = $scope.pword;
                
                var request = "/services/rest/userservice/loginWithQP?userId=" + encodeURIComponent($scope.uname) + "&password=" + encodeURIComponent($scope.pword) + "&appName=YellowJacket&appVersion=1.0&deviceId="+$rootScope.deviceid+"&notificationToken="+$rootScope.notificationToken+"&deviceType="+$rootScope.deviceType+
                    "&clientVersion="+v+"&locale=GB_en.json";
                
                
//                var request = "/services/rest/userservice/login/" + encodeURIComponent ($scope.uname) + "/" + encodeURIComponent($scope.pword) + "/YellowJacket/1.0/"+$rootScope.deviceid+"/"+$rootScope.notificationToken+"/"+$rootScope.deviceType+"/"+v+"/GB_en.json";
                unityService.fetch(request)
                .error(function (data, status, headers, config) {
                    console.log("signin.error (" + data + ")");
                    $scope.error = "has-error";
                    $scope.logonstatus = 'NONETWORK'; 
                    $scope.ready=true;
                    $('#errorModal').delay(100).modal();
                    return false;
                }).done(function (data) {
                    $scope.error = "";
                    console.log("signin.done");
                    $scope.ready=true;
                    var yju = data.yellowJacketUser;
                    $scope.logonstatus = yju.status;
                    if (yju.status == "SUCCESS") {
                        $rootScope.yju = yju;
                        $rootScope.error = "";//makes sure that no error bleeds over to PIN entry
                        $scope.error = "";
                        saveObject('userpwd',yju.userPassword);
                        $rootScope.pword = yju.userPassword; // push digest into system instead of password!!!                        
//                        saveObject('userpwd',$rootScope.pword);
    //                    $rootScope.pword = storage.load('userpwd');
                        //console.log("signin.success");
                        var tmp = loadObject("user");
                        if(tmp && (tmp.userId.toUpperCase() != $scope.uname.toUpperCase())) {
                            //alert('logged in as a different (stored) ['+tmp.userId+'] entered ['+$scope.uname+'] !!!');
                            $rootScope.doUserChange();
                        }
                        saveObject("user", yju);
                        
                        $rootScope.hasRegistered = loadObject('tncs') != null;
                        if (!$rootScope.hasRegistered) { // are we already registered?
                            $rootScope.tncFirst = true;
                            $location.path("tncs");
                        } else {
                            if (pinService.hasPin()) {
                                $rootScope.changepin = false;
                            }
                            $location.path("createpin"); //yes
                        }
                        // commit to local memory for service calls!!
                        //$rootScope.getUserMeta();           //*********** leave for later
                        
                        //$rootScope.getUserWorkLoad();
                        
                    } else {
                        //console.log("signin.failure");
                        $scope.error = "has-error";
                        if (!$scope.logonstatus) $scope.logonstatus = "INVALIDPASSWORD";
                        $('#errorModal').delay(100).modal();
                        return false;
                    }
                })
            })
        }
    }

    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
});
