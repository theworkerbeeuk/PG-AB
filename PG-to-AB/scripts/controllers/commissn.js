'use strict';

angular.module('yellowJacketApp')
    .controller('CommissnCtrl', 
function ($scope, $rootScope, $location, storage, $q) {

    ga_storage._trackPageview('/index.html','commissions');
    
    
    var setCommissions = function(al, il) {
        angular.forEach($rootScope.commissions, function (c) {
            var len = 0;
            if (al && al[c.title])
                len += al[c.title].length;
            if (il && il[c.title])
                len += il[c.title].length;

            angular.forEach($rootScope.actionList, function(al) {
              if (al.commissionTitle == c.title) len++;
            });

            c.items = len;
         });
    }
    
    var p = [];
    if (!$rootScope.audlist) {
//        $rootScope.audlist = loadObject("audlist");
        p[0] = storage.load("audlist");
        p[0].then(function(v) {
           $rootScope.audlist = angular.fromJson(v); 
        })
    }
    
    if (!$rootScope.insplist) {
        p[1] = storage.load("insplist");
        p[1].then(function(v) {
           $rootScope.insplist = angular.fromJson(v); 
        })
    }
    
    $q.all(p).then(function() {
        setCommissions($rootScope.audlist, $rootScope.insplist);
    })
    

    $scope.goback = function () {
        $location.path("main");
    };

    $scope.onCommission = function (cm) {
        $rootScope.selectedCommission = cm;
        $location.path("commsndtl");
    }

    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];


});