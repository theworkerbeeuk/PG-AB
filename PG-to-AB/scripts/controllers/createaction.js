'use strict';

angular.module('yellowJacketApp')
.filter('actiontype', function () { // remove all spaces
    return function (at, oid) {
        var l = [];
        angular.forEach(at, function(a) {
            if (a.observationType.id == oid) l.push(a);
        });
        return l;
    };
})

  .controller('CreateactionCtrl', function ($scope, $rootScope, $location, $timeout) {
      
//    window.scrollTo(0, 0);
//    // fix for keyboard up ipad
//    $('.navbar.navbar-fixed-bottom').css('position', 'absolute');
//    $('.navbar.navbar-fixed-bottom').css('bottom', '0');
      
//    $rootScope.actionMeta = loadObject("actionMeta");
    if ($rootScope.selectedCommission == null) {
        $rootScope.selectedCommission = loadObject("selectedCommission");
    }
    $scope.cid = $scope.selectedCommission.id;
      
      
    $scope.selectedAllocation='A';
    $scope.select = function(a) {
        $timeout(function() {
            $scope.selectedAllocation=a;
        },100);
    }
    $scope.copen = [];
    $scope.ctoggle = function(c) {
        $scope.copen[c] = !$scope.copen[c];
        for (var i=0; i < $scope.copen.length; i++) {
          if (i != c) {
              $scope.copen[i] = false;
          }
        }
    }
          
    
    if (!$rootScope.action) {
        $rootScope.action = {};
        $rootScope.selectedAction = {};
    }

    $scope.actionType = function(t) {
     
       // $rootScope.selectedAction.type = {};
    //    $rootScope.selectedAction.type.id = t.id;
        $rootScope.action.type = t;
        $scope.copen = [];
        $scope.copen[1] = true;  
        $scope.error = null;
    }
    
    $scope.risk = function(t) {
    // $rootScope.selectedAction.risk = t;
        $rootScope.action.risk=t;
        $scope.copen = [];
        $scope.copen[2] = true;
        $scope.error = null;
    }
    
    $scope.organisation = function(s) {
        $scope.copen = [];
        $scope.copen[3] = true;    
       // $rootScope.selectedAction.organisation = s;
        s.organisationUsers = $rootScope.makeArray(s.organisationUsers);
        $rootScope.action.organisation = s;
        $scope.error = null;
    }
    
    $scope.actionOwner = function(u) {
        $scope.copen = [];
//        $scope.copen[0] = true;    
      //  $rootScope.selectedAction.owner = u
        $rootScope.action.owner = u;
        $scope.error = null;
        
        
    }
    
    $scope.continue = function() {
        if ($rootScope.action.type == null 
         || $rootScope.action.risk == null 
         || $rootScope.action.organisation == null 
         || $rootScope.action.owner == null
            ) {
            $scope.error=$rootScope.locale.actionerr;
        }
        else { 
            $location.path("actiondetails");
        }
    }
      
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
