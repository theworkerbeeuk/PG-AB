'use strict';

angular.module('yellowJacketApp')
    .controller('NetprefsCtrl', function ($scope, $timeout, $rootScope, $location, yjService) {
    
    // fix for keyboard up ipad
//    $('#nbar').css('position', 'absolute');
//    $('#nbar').css('bottom', '0');

    var nprefs = loadObject("netprefs");
    if(nprefs != null) {
      if(nprefs.g3 == true) $scope.g3=true;
      if(nprefs.wifi == true) $scope.wifi=true;
      $scope.nprefsSet=true;//displays Done button
    }
    else { // set default values - note this doesn't work!!
      $scope.g3=false;
      $scope.wifi=true;
      $scope.nprefsSet=false;//displays Continue button
    }
        
        
    $scope.setpref = function() {
        
        if ($scope.wifi == true || $scope.g3 == true) 
        {
            $scope.error = "";
            var nprefs = new Object();
            if($scope.g3) nprefs.g3=true;
            else nprefs.g3 = false;
            if($scope.wifi) nprefs.wifi=true;
            else nprefs.wifi = false;
            saveObject("netprefs", nprefs);

            //if we entered the netprefs while they were already set, return to previous page
            if ($rootScope.registered) $rootScope.back();
            else { 
                $scope.nocomms = false;
                $rootScope.registered = true;
                $rootScope.hideComNote = false;
                
                yjService.uploadData(); 
                $location.path("main");
            }
        }
        else {
            $location.path("netprefs"); // neither picked - go again!
            $scope.error="has-error";
        }
    }
    
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
});
