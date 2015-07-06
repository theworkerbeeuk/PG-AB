'use strict';

angular.module('yellowJacketApp')
  .controller('ReassignuserCtrl', function (yjService, $scope, $rootScope, $location) {
  
    $('textarea').bind("blur", function (event) { //input[type=text]
       $scope.$apply(function() { //wait for angular..
         setTimeout(function() {
           window.scrollTo(0, 0);
         },500);
       });
    });

    $('#aurutext').focusin(function() {
        $('#collapseOrg').removeClass('in');
        $('#collapseOrg').addClass('collapse');
        $('#collapseOwner').removeClass('in');
        $('#collapseOwner').addClass('collapse');
        $scope.$apply(function() {
            $scope.copen = [];
        });
    });
            
      
    $scope.userInfoName = null;
    $scope.organisationName = null;
    $scope.cid = $scope.selectedal.commissionId;
    $scope.selectedAllocation='A';
      
    $scope.copen = [];
    $scope.ctoggle = function(c) {
        $scope.copen[c] = !$scope.copen[c];
        for (var i=0; i < $scope.copen.length; i++) {
          if (i != c) {
              $scope.copen[i] = false;
          }
        }
    }

    $scope.users = {};
    $scope.organisation = function(s) {
        $scope.copen = [];
        $scope.copen[3] = true;
        if (s.organisationUsers)
            s.organisationUsers = $rootScope.makeArray(s.organisationUsers);
        var orgs = s;
        $rootScope.actionupd.responsibleOrganisationId = orgs.organisationId;
        $scope.organisationName = orgs.organisationName;
        $scope.userInfoName = null;
        $scope.users = s;
    }
    
    $scope.actionOwner = function(u) {
        $scope.copen = [];   
        $rootScope.actionupd.assignedToUserId = u.userId;
        $scope.userInfoName = u.userInfoName;
    }

    $scope.finish = function() { 
        $scope.error=false;
        $scope.error1=false;
        $scope.error2=false;
        
        if (!$rootScope.actionupd ||
            ($rootScope.actionupd.actionTaken == null || $rootScope.actionupd.actionTaken.length < 1)) 
            $scope.error=true;
        
        if ($scope.organisationName == null)
            $scope.error1=true;
        
        if ($scope.userInfoName == null)
            $scope.error2=true;
        
        if ($scope.error == false && $scope.error1 == false && $scope.error2 == false) {
        // no errors - send action to server
            $rootScope.actionupd.state = "reassign";
            $rootScope.actionupd.commissionId = $rootScope.selectedal.commissionId;

            yjService.sendActionUpdate ($rootScope.actionupd);
            var ix = $rootScope.actionList.indexOf($rootScope.selectedal);
                if (ix > -1) {
                    $rootScope.actionList.splice(ix, 1);
                    }
             //console.log("about to save actionlist" + angular.toJson ($rootScope.actionList));
           // saveObject('actionList', $rootScope.actionList);
            updAlObj ($rootScope.actionList, $rootScope.actionListTs);
            $location.path('actionlist');
        }
    };
       
    $scope.back = function() { 
        $rootScope.actionupd = {}
        $location.path('actdetview');
    };    
      
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
