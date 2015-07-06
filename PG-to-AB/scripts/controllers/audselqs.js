'use strict';

angular.module('yellowJacketApp')
    .controller('AudselqsCtrl', function (yjService, $scope, $rootScope, $location, $timeout, storage) {


    //Resets the current selection to [] and repopulates it based on the switches
    $scope.save = function () {
        $rootScope.selectedQuestionHeaders = [];
        if ($rootScope.auditHeaders) {
            console.log("Aud hdrs " + $rootScope.auditHeaders);
            for (var i = 0; i < $rootScope.auditHeaders.length; i++) {
                var ah = $rootScope.auditHeaders[i];
                if (ah.isActive == true) {
                    if (!$.isArray(ah.questions)) {
                        var q = ah.questions;
                        ah.questions = [q];
                    }
                    $rootScope.selectedQuestionHeaders.push(ah);
                }
            }
        }
        return $rootScope.selectedQuestionHeaders.length;
    }

    //Saves the switches, but does not force people to select something
    //Then goes back to the menu
    $scope.goback = function () {
        $scope.save();
        $location.path("audmenu");
    };

    
    $scope.isContinue = false;
    //Saves the switches and enforces the selection of at least one header before continuing
    //Then goes back to the menu
    $scope.
    continue = function () {
        if ($scope.save() > 0) {

            $scope.isContinue = true;
            $timeout(function() {
                if ($rootScope.observation)
                    $rootScope.observation.suspendedAudit = null;
                $rootScope.audinsp.selectedQHs = $rootScope.selectedQuestionHeaders;

                var cm = $rootScope.audinsp.commission.title
                //console.log("audisp ready to go into audlist " + angular.toJson($rootScope.audinsp));

                if (!$rootScope.isInspection) {
                    if (!$rootScope.audlist) $rootScope.audlist = {};
                    if (!$rootScope.audlist[cm]) $rootScope.audlist[cm] = [];
                    if ($rootScope.audlist[cm].indexOf($rootScope.audinsp) == -1) {

                        $rootScope.audlist[cm].push($rootScope.audinsp);
                        //console.log("audlist " + angular.toJson($rootScope.audlist[cm]));
                    }
                    storage.save("audlist", angular.toJson($rootScope.audlist));
                } else {
                    if (!$rootScope.insplist) $rootScope.insplist = {};
                    if (!$rootScope.insplist[cm]) $rootScope.insplist[cm] = [];
                    if ($rootScope.insplist[cm].indexOf($rootScope.audinsp) == -1) {

                        $rootScope.insplist[cm].push($rootScope.audinsp);
                    }
                    storage.save("insplist", angular.toJson($rootScope.insplist));
                }

    //            $rootScope.sending = true;
                $rootScope.returnTo = "commsndtl";
                $location.path("audanswer");

    //            yjService.saveAudit($rootScope.isInspection).then(function(v) { 
    //                $rootScope.sending = false;
    //            })
            }, 100);
            
        } else {
            //$location.path("audselqs"); // neither picked - go again!
            $('#errorModal').delay(100).modal();
            //$scope.error="has-error";
        }
    };

    $('#change-color-switch').bootstrapSwitch('setOnClass', 'success');
    $('#change-color-switch').bootstrapSwitch('setOffClass', 'danger');

    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
});