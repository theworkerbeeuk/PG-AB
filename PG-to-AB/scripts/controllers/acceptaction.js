'use strict';

angular.module('yellowJacketApp')
    .controller('AcceptactionCtrl', function (yjService, $scope, $rootScope, $location, storage) {

    $('textarea').bind("blur", function (event) { //input[type=text]
       $scope.$apply(function() { //wait for angular..
         setTimeout(function() {
           window.scrollTo(0, 0);
         },500);
       });
    });

    if ($rootScope.picture) {
        if (!$rootScope.actionupd)  $rootScope.actionupd = {};
        if (!$rootScope.actionupd.photos)  $rootScope.actionupd.photos = [];
        if ($rootScope.actionupd.photos.length > $rootScope.config.MAXPHOTOS) $rootScope.actionupd.photos.splice(0, 1);
        
        
        var p = {};
        p.picture = $rootScope.picturedata;
        p.name= "act";
        p.type = "actionupd";
        p.id = yjService.txid(); //new Date().getTime();
        p.imgsrc = p.name + p.type + p.id;
        $rootScope.actionupd.photos.push(p);
        $rootScope.picture = null;
        
        if (!$rootScope.piclist) $scope.piclist = [];
        $rootScope.piclist.push({
            pic: $rootScope.lastPic,
            haveMark: p.picture.x});
    }
    else {
        if ($scope.actionupd && $scope.actionupd.photos && $scope.actionupd.photos.length > 0) {
        }
        else 
        $rootScope.piclist = [];
    }

    $scope.$watch("actionupd.picture", function (n, o) {
        if (typeof $scope.actionupd == 'undefined') return;
        
        if (typeof $scope.actionupd.picture != 'undefined' &&
            $scope.actionupd.picture != null) {
            $rootScope.picture = $scope.actionupd.picture;
            $scope.actionupd.picture = null;
            $rootScope.returnTo = "acceptaction";
            $location.path("capturepic");
        }
    }, true);


    $scope.photo = function () {
        try {
            if (Camera) {}
        } catch (e) { // web browser special
            $rootScope.picture = '../img/testx2.jpg';
            $rootScope.returnTo = "acceptaction";
            $location.path("capturepic");
        }
    }

    $scope.sending = false;
    $scope.finish = function () {
        if ($scope.sending) return;
        
        if (!$rootScope.actionupd ||
            ($rootScope.actionupd.actionTaken == null || $rootScope.actionupd.actionTaken.length < 1)) {
            $scope.error = true;
        } else {
            $rootScope.actionupd.state = "accept";
            $rootScope.actionupd.commissionId = $rootScope.selectedal.commissionId;
            
            $scope.sending = true;
            yjService.sendActionUpdate($rootScope.actionupd).then(function() {
                $scope.sending = false;
                var ix = $rootScope.actionList.indexOf($rootScope.selectedal);
                if (ix > -1) {
                    $rootScope.actionList.splice(ix, 1);  // remove from list...
                }
                 //console.log("about to save actionlist" + angular.toJson ($rootScope.actionList));
                updAlObj ($rootScope.actionList, $rootScope.actionListTs);
                $location.path('actionlist');
            })
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