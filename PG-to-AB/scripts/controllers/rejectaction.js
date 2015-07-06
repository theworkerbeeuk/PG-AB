'use strict';

angular.module('yellowJacketApp')
    .controller('RejectactionCtrl', function (yjService, $scope, $rootScope, $location, $window) {


    $('textarea').bind("blur", function (event) { //input[type=text]
       $scope.$apply(function() { //wait for angular..
         setTimeout(function() {
           window.scrollTo(0, 0);
         },500);
       });
    });


    $scope.finish = function () {
        if (!$rootScope.actionupd ||
            ($rootScope.actionupd.actionTaken == null || $rootScope.actionupd.actionTaken.length < 1)) {
            $scope.error = true;
        } else {
            // send action to server
            $rootScope.actionupd.state = "reject";
            $rootScope.actionupd.commissionId = $rootScope.selectedal.commissionId;

            yjService.sendActionUpdate($rootScope.actionupd);
            var ix = $rootScope.actionList.indexOf($rootScope.selectedal);
            if (ix > -1) {
                $rootScope.actionList.splice(ix, 1);
            }
            //console.log("about to save actionlist" + angular.toJson ($rootScope.actionList));
            updAlObj($rootScope.actionList, $rootScope.actionListTs);
            $location.path('actionlist');
        }
    };

    $scope.back = function () {
        $rootScope.actionupd = {}
        $location.path('actdetview');
    };
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
});