'use strict';

angular.module('yellowJacketApp')
    .controller('DeregCtrl', function (storage, $scope, $rootScope, $location, yjService, unityService) {

    $scope.check = false;
    $scope.workpending = false;
    $scope.failed = false;


    yjService.synchroniseWithUnity(true).then(function () {
        $scope.check = true;
        $scope.workpending = $rootScope.isOffline > 0;
    })

    $scope.
    continue = function () {
        $location.path("main");
    }

    $scope.dereg = function (discard) {
        // need to do the following here:
        // Check network connection is correct sort 
        // Make sure all observations, actions, audits and inspections have been sent so nothing is left in local storage

        // ^^^^^^ All above done by syncwithUnity - once they get here all should have been sent

        // After the data is sent then send a degregister notification to Unity server so details can be removed 

        // send dereg message to unity

        // check connection.
        if ($rootScope.isDevice && !discard) {
            var networkState = checkConnection(); // checking here <-- device has to be ready before we do this. 
            $rootScope.haveWifi = isBroadband(networkState);
            $rootScope.haveG3 = isMobile(networkState);

            var netprefs = loadObject("netprefs");
            console.log("Net prefs " + JSON.stringify(netprefs) + ", havewifi " + $rootScope.haveWifi + ", have3G " + $rootScope.haveG3);
            if (netprefs)
            {
                if(!($rootScope.haveWifi || $rootScope.haveG3)) // have prefs but FULLY off line!!!
                {
                 $scope.failed = true;
                 $scope.workpending = true;
                 return;
                }
                // check to see if either selected option is available - and if its not... bang out..
                if(!( (netprefs.wifi && $rootScope.haveWifi) || (netprefs.g3 && $rootScope.haveG3) ))
                {
                   $scope.failed = true;
                   $scope.workpending = true;
                   return;
                }
            }
        }
        $scope.deregistering = true;
//        var request = "/services/rest/userservice/deregister/" + $rootScope.yju.userId + "/" + $rootScope.deviceid + "/" + $rootScope.deviceType;
        try {
            var request = "/services/rest/userservice/deregister/" + $rootScope.yju.digest + "/" + $rootScope.deviceid + "/" + $rootScope.deviceType+".json";
            unityService.fetch(request); // fire and forget.
        }
        catch(e) {}
        // Delete all the user based data - if its easier delete everything fine but the generic meta data can be left
        //This bit copied from the clear all button so may be some of what we need. 
        
        $rootScope.doUserChange().then(function () {
            $scope.deregistering = false;
//            $rootScope.deinitCrypto();                              
            $location.path("signin");
        })

    };
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
});