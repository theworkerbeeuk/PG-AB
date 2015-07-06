'use strict';

angular.module('yellowJacketApp')
  .controller('CommsndtlCtrl', function ($scope, $rootScope, $location) {
    $rootScope.returnToComDet = null;
      
    if (!$rootScope.selectedCommission) {
         $location.path("commissn");
    }
    
    var t = $rootScope.selectedCommission.title
    $scope.actionsLen = 0;
    angular.forEach($rootScope.actionList, function(al) {
        if (al.commissionTitle == t) $scope.actionsLen++;
    });


    $scope.goback = function() {
        $location.path("commissn");
    }

    $scope.newObservation = function() {
        $rootScope.observation = {};
        $location.path("obsrvtn");
        $rootScope.returnToComDet = "commsndtl";
    }
    
    $scope.newInspection = function() {
        $rootScope.isInspection = true;
        $rootScope.audinspReturnTo = "commsndtl";
        $location.path("audmenu");
    } 
    $scope.newAudit = function() {
        $rootScope.isInspection = false;
        $rootScope.audinspReturnTo = "commsndtl";
        $location.path("audmenu");
    } 
        
    
    $scope.inProgressActions = function() {
        if ($scope.actionsLen && $scope.actionsLen > 0) {
            $rootScope.rtnToSelectedCommission = null;
            $rootScope.actionlist = {};
            $location.path("actionlist");
        }
    } 
    $scope.inProgressInspections = function() {
        if ($scope.insplist && $scope.insplist[t] && $scope.insplist[t].length > 0) 
            $location.path("inspstatus");
    } 
    $scope.inProgressAudits = function() {
        if ($scope.audlist && $scope.audlist[t] && $scope.audlist[t].length > 0) 
        $location.path("audstatus");
    } 
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
      
  });
