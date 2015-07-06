'use strict';

angular.module('yellowJacketApp')
    .controller('SatactionCtrl', function ($scope, $rootScope, $location, $timeout, yjService) {

    $scope.requireAction = $scope.observation.situation 
                           ? ($scope.observation.situation.name == 'Unsatisfactory' 
                                && $rootScope.observation.actions == null)
                           : false;
    
    var appendObservationToSuspendedAudit = function()
    {   
        var suspendedAudit = $rootScope.observation.suspendedAudit;
        var slideIndex = suspendedAudit.slide;
        var observationClone = jQuery.extend(true, {}, $rootScope.observation);
        var question = suspendedAudit.header.questions[slideIndex];

        if(!question.observationClientList) question.observationClientList = [];
        question.observationClientList.push(observationClone);
    };
    
    $scope.addAnotherObservation = function()
    {
        appendObservationToSuspendedAudit();
        
        $rootScope.observation.summary = null;
        $rootScope.observation.locdesc = null;
        $rootScope.observation.actions = [];
        $rootScope.observation.photos = [];
        
        $location.path("obsrvtn");
    };

    $scope.sendObservation = function () 
    {
        if ($rootScope.sendingObs) return;

        if ($scope.observation.situation.name == 'Unsatisfactory' &&
            $rootScope.observation.actions == null) {
            $location.path('createaction');
        } 
        else 
        {
            // send obs to server: observation subject type and id are used ? obs mapped to audresult -> auditid
            var suspendedAudit = $rootScope.observation.suspendedAudit;
            if (suspendedAudit) 
            {
                $rootScope.selectedQuestionHeaders = suspendedAudit.audinsp.selectedQHs;
                $rootScope.audinsp = suspendedAudit.audinsp;
                $rootScope.observation.aid = null;
                appendObservationToSuspendedAudit();
                $location.path("audanswer");
            } 
            else 
            {
                if (!$rootScope.sendingObs) 
                { 
                    // prevent double click
                    $rootScope.sendingObs = true;
                    var obs = jQuery.extend(true, {}, $rootScope.observation);
                    yjService.sendObservation(obs).then(function (os) {
                        $rootScope.sendingObs = false;
                        $location.path('commsndtl');
                    });
                }
            }
        }
    }

    $scope.close = function () {
        $timeout(function () {
            var sa = $rootScope.observation.suspendedAudit;
            if (sa) {
                var au = sa.audinsp;
                $rootScope.selectedQuestionHeaders = au.selectedQHs;
                $rootScope.audinsp = au;

                var ix = sa.slide;
                var qh = sa.header;
                $rootScope.observation.aid = null;

                var question = qh.questions[ix];
                question.norating = false;
                question.rating = -1;
                question.satisfaction = null;
                question.answered = false; //extra flag for UI decisions
                question.observationClientList = null;
                qh.answeredQuestions.pop(); // on cancel MACE-717 fix, pop the most recent answer off the list!
                $rootScope.observation = null;
                $location.path("audanswer");
            } else {
                $rootScope.observation = null;
                $location.path("commsndtl");
            }

        }, 1000); // need time for modal to die

    }
    $scope.cancel = function () {
        $('#cancelObsModal').modal();
    }

    $scope.add = function () {
        $rootScope.action = {};
        $location.path("createaction");
    }

    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
});