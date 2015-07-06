'use strict';

angular.module('yellowJacketApp')
    .controller('MainCtrl', function (pinService, $scope, $rootScope, $location, $document, $timeout, yjService) {

    ga_storage._trackPageview('/index.html','main');
        
        
    $rootScope.enableBackground = true;
    // These are used for navigation so reset here to be at their start values      
    $rootScope.selectedCommission = null;
    $rootScope.returnToMain = null;
    $rootScope.rtnToSelectedCommission = null;
    //
    console.log("main-returnto " + $rootScope.returnToMain);
// remove load commissions to avoid lack of a key
//    if (!$rootScope.commissions)
//        $rootScope.commissions = loadObject("commissions");

    $scope.coms = $rootScope.commissions;
    $scope.actions = $rootScope.actionList;
    $rootScope.$watch('actionList', function () {
        $scope.actions = $rootScope.actionList;
    });
    $rootScope.$watch('commissions', function () {
        $scope.coms = $rootScope.commissions;
    });
                
    $rootScope.sessiontimeout = false;



    $('#mcid').idleTimer('destroy');
    console.log("Time " + $scope.config.idleTimeout);
    $('#mcid').idleTimer($scope.config.idleTimeout); 
    $('#mcid').on("idle.idleTimer", function(){
        console.log("Bone idle");
        $('#mcid').idleTimer('destroy');
       $scope.$apply(function() {
          $rootScope.sessiontimeout = true;
          $rootScope.loggedIn = false;
        
          $rootScope.backg(false);
          $rootScope.error="has-error";
          $rootScope.menu = false;
          $location.path("signin");
       });
    });
        
    if (!$rootScope.fromLogon) {
        yjService.synchroniseWithUnity(true);
    }
    else {
        $rootScope.fromLogon = null; 
    }
        
    
    $scope.sync = function() {
        if($rootScope.enableBackground == false) return; // can't do - we're synching
        $rootScope.enableBackground = false;
        $scope.syncing = true;
        $rootScope.backg(true);
        yjService.synchroniseWithUnity().then(function() {
            
            $rootScope.enableBackground = true;
            $scope.actions = $rootScope.actionList;
            $scope.coms = $rootScope.commissions;
            console.log(">>>>>  insplist ", $rootScope.insplist);
            $timeout(function() {
                $scope.syncing = false;
            }, 1000);
        });
    }
    
    
    var al = $rootScope.audlist;
    var il = $rootScope.insplist;
    var allen = 0,
        illen = 0;
    angular.forEach($rootScope.commissions, function (c) {
        if (al && al[c.title])
            allen += al[c.title].length;
        if (il && il[c.title])
            illen += il[c.title].length;
    });
    $scope.audits = {
        length: allen
    };
    $scope.inspects = {
        length: illen
    };

    var allength = function() {
        var al = $rootScope.audlist;
        var allen = 0;
        angular.forEach($rootScope.commissions, function (c) {
            if (al && al[c.title])
                allen += al[c.title].length;
        });
        $scope.audits = {
            length: allen
        };
    }
    
    $rootScope.$watch('audlist', function () {
        allength();
    });
    $rootScope.$on('audlist', function () {
        allength();
    });
        
    var illength = function() {
        var il = $rootScope.insplist;
        var illen = 0;
        angular.forEach($rootScope.commissions, function (c) {
            if (il && il[c.title])
                illen += il[c.title].length;
        });
        $scope.inspects = {
            length: illen
        };
    }
    
   $rootScope.$watch('insplist', function () {
       illength();
    });
   $rootScope.$on('insplist', function () {
       illength();
    });


    // are we signed in - no - go to signin page
    if ($rootScope.registered) {
        $rootScope.menu = true;
        $rootScope.signedIn = true;
    } else {
        $rootScope.enableBackground = false;
        $rootScope.menu = false;
        $location.path("signin"); // no pin registered..
    }

    if (!$rootScope.pword) {
        $rootScope.enableBackground = false;
        $location.path("signin");
    }


    $scope.commissions = function () {
        if($rootScope.enableBackground == false) return; // can't do - we're synching
        $rootScope.enableBackground = false;
        if ($scope.coms && $scope.coms.length > 0)
            $location.path("commissn");
    };

    $scope.actionlist = function () {
        if ($scope.actions  && $scope.actions.length > 0) {
            if($rootScope.enableBackground == false) return; // can't do - we're synching
            $rootScope.enableBackground = false;
            $rootScope.returnToMain = "y";
            $location.path("actionlist");
        }
    };
    $scope.audstatus = function () {
        if ($scope.audits && $scope.audits.length > 0) {
            if($rootScope.enableBackground == false) return; // can't do - we're synching
            $rootScope.enableBackground = false;
            $scope.noaudits = false;
            $rootScope.returnToMain = "y";
            console.log("got to returnto audit main it is now =" + $rootScope.returnToMain);
            $location.path("audstatus");
        }
    }


    $scope.inspstatus = function () {
        console.log("got to function");
        if ($scope.inspects  && $scope.inspects.length > 0) {
            if($rootScope.enableBackground == false) return; // can't do - we're synching
            $rootScope.enableBackground = false;
            $scope.noinsp = false;
            $rootScope.returnToMain = "y";
            console.log("got to returnto isp main it is now =" + $rootScope.returnToMain);
            $location.path("inspstatus");
        }
    }


    $scope.hideNot = function() {
        $rootScope.notification = null;
    }

    $scope.hideCom = function () {
        $rootScope.hideComNote = true;
    }
    
    $scope.clearSent = function() {
        $rootScope.sentArray = [];
    }
    
    
    $scope.showSent = function() {
        if ($scope.sent > 3) $scope.sent=0;
        if (!$scope.sent) $scope.sent = 1;
        else
            $scope.sent++;
    }
    
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
});