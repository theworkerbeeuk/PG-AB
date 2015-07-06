'use strict';

angular.module('yellowJacketApp')
    .filter('commission', function () {
    return function (input, title) {
        if (title.commissionTitle.indexOf("All Commissions") != -1) {
            return input;
        }
        var output = [];
        angular.forEach(input, function (i) {
            if (i.commissionTitle == title.commissionTitle) {
                output.push(i);
            }
        });
        return output;
    }
})
.filter('overdue', function() {
    return function (input, filterd) {
        if (!filterd) return input;

        var yes = new Date();
        yes.setDate(filterd.getDate() - 1);
        var output = [];
        angular.forEach(input, function (i) {
            var ds = i.dueDate.split("-");
            var ddate;
            ddate = new Date(ds[1]+"/"+ds[0]+"/"+ds[2]);
            if (ddate < yes) {
                output.push(i);
            }
        });
        return output;
    }
})
.filter('unread', function() {
    return function (input, ur) {
        if (!ur) {
            return input;
        }
        var output = [];
        angular.forEach(input, function (i) {
            if (!i.read) {
                output.push(i);
            }
        });
        return output;
    }
})
    .controller('ActionlistCtrl', function ($scope, $rootScope, $timeout, $location, $q) {

        
    ga_storage._trackPageview('/index.html','actions');
        
        
    if (BrowserDetection.name() == "WP") {
        $scope.imgw = "60";
    }
    $rootScope.yju = loadObject("user");
    $scope.uid = $rootScope.yju.id;
    if (!$rootScope.actionList) {
        $rootScope.actionList = loadObject("actionList");
    }
        
    //Testing all actions for commissions
    //This clone loses a commission once we found it, thus reducing cycles when checking
    var commissionsToTest=$rootScope.commissions.slice();
        
    for (var i=0; i<$rootScope.actionList.length; i++) {
        //If no commissions remain to be tested (all have actions) we exit
        if (commissionsToTest.length==0) break;
        var actionCommId = $rootScope.actionList[i].commissionId;
        for (var k=0; k<commissionsToTest.length; k++) {
            var comm = commissionsToTest[k];
            if (actionCommId==comm.id) {
                //This commission has an action, we remove it, then exit
                commissionsToTest.splice(k, 1);
                break;
            }
        }
    }
    //Here we make the fact that a commission has no action easily accessible for ng-hide
    $scope.commissionsWithoutAction={};
    for (var k=0; k<commissionsToTest.length; k++) {
        $scope.commissionsWithoutAction[commissionsToTest[k].id]=true;
    }
        
    if (!$rootScope.rtnToSelectedCommission) {
        if (!$rootScope.selectedCommission) {
            console.log("actionlist not selected commission value is " + angular.toJson($rootScope.selectedCommission));
            $scope.selectedCommission = {
                title: "All Commissions"
            };
        } else {
            console.log("actionlist selected commission value is " + angular.toJson($rootScope.selectedCommission));
            $scope.selectedCommission = $rootScope.selectedCommission;
        }
    } else {
        $scope.selectedCommission = $rootScope.rtnToSelectedCommission;
    }

    $scope.reverse=true;

//    var p=[];
//    var i =0;
//    angular.forEach($rootScope.actionList, function(a) {
//        // get photos for this observations. do this when user selects actionlist
//        console.log('Got action ' + angular.toJson(a));
//        p[i++] = $rootScope.getActionPhoto(a);
//    });
//        
//    $scope.loadingPhotos = true;
//    $q.all(p).then(function(s) {
//        // photos loaded
//        $scope.loadingPhotos = false;
//    });
//        
    // unread logic.
    if (!$rootScope.readactions)
        $rootScope.readactions = loadObject("readactions");
    // should be array of actionIds
    if (!$rootScope.readactions) $rootScope.readactions = [];

    $scope.unread = function() {
        $rootScope.filterur = !$rootScope.filterur;
    }
        
    $scope.overduefilter = function() {
        // toggle
        if ($rootScope.filterod) $rootScope.filterod = null;
        else
            $rootScope.filterod = new Date();
    }

//    $scope.overdue = function (dueDate) {
//        var now = new Date();
//        now.setDate(now.getDate() - 1);
//
//        var ds = dueDate.split("-");
//        var ddate = new Date();
//        var m = Number(ds[1]) - 1;
//        ddate.setFullYear(ds[2], m, ds[0]);
//        return (ddate < now);
//    }


    $scope.all = function () {
        $rootScope.rtnToSelectedCommission = null;
        $scope.selectedCommission = {
            title: "All Commissions"
        };
    }

    $scope.select = function (c) {
        $scope.selectedCommission = c;
        $rootScope.rtnToSelectedCommission = c;
        saveObject("selectedCommission", c);
    }

    $scope.detail = function (al) {
        $rootScope.selectedal = al;
        $rootScope.readactions.push(al.actionId);
        al.read = true;
        $location.path('actdetview');
    }
    $scope.goback = function () {
        console.log("got to goback and the returnto  main it is now =" + $rootScope.returnToMain);
        if ($rootScope.returnToMain == "y") {
            $location.path("main");
        } else {
            $location.path("commsndtl");
        }
    }
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
});