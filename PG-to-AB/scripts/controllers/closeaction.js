'use strict';

angular.module('yellowJacketApp')
  .controller('CloseactionCtrl', function (yjService, $scope, $rootScope, $location) {
    
    $('textarea').bind("blur", function (event) { //input[type=text]
       $scope.$apply(function() { //wait for angular..
         setTimeout(function() {
           window.scrollTo(0, 0);
         },500);
       });
    });

      
    $scope.finish = function() { 
        // send action to server
        $rootScope.actionupd.state = "close"
        $rootScope.actionupd.commissionId = $rootScope.selectedal.commissionId;

        yjService.sendActionUpdate ($rootScope.actionupd);
        var ix = $rootScope.actionList.indexOf($rootScope.selectedal);
        if (ix > -1) {
            $rootScope.actionList.splice(ix, 1);
        }
        updAlObj ($rootScope.actionList, $rootScope.actionListTs);
        $location.path('actionlist');
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
