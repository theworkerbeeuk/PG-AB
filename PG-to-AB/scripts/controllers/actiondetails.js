'use strict';

angular.module('yellowJacketApp')
    .controller('ActiondetailsCtrl', function ($scope, $rootScope, $location, storage, yjService) {
       
        
    $('textarea').bind("blur", function (event) { //input[type=text]
       $scope.$apply(function() { //wait for angular..
         setTimeout(function() {
           window.scrollTo(0, 0);
         },500);
       });
    });
  
    if ($rootScope.picture) {
        if (!$rootScope.action) $rootScope.action={}
        if (!$rootScope.action.photos) $rootScope.action.photos = [];
        if ($rootScope.action.photos.length > $rootScope.config.MAXPHOTOS) $rootScope.action.photos.splice(0,1);
        
        var p = {};
        p.picture = $rootScope.picturedata;
        p.name= "act";
        p.type = "action";
        p.id = yjService.txid();
        p.imgsrc = p.name + p.type + p.id;
        $rootScope.action.photos.push(p);
        $rootScope.picture = null;
        if (!$rootScope.piclist) $scope.piclist = [];
        $rootScope.piclist.push({
            pic: $rootScope.lastPic,
            haveMark: p.picture.x});
    }
    else {
        if ($scope.action && $scope.action.photos && $scope.action.photos.length > 0) {
        }
        else 
        $rootScope.piclist = [];
    }
        
    $scope.$watch("action.picture", function(n,o) {
        if (typeof $scope.action == 'undefined') return;
        if (typeof $scope.action.picture != 'undefined' &&
            $scope.action.picture  != null
           ) {
            $rootScope.picture = $scope.action.picture;
            $scope.action.picture = null; 
            $rootScope.returnTo = "actiondetails";
            $location.path("capturepic");
        }
    }, true);

        
    $scope.photo = function() {
        try {
            if (Camera) {}
        }
        catch (e) { // web browser special
            $rootScope.picture = '../img/testx2.jpg';
            $rootScope.returnTo = "actiondetails";
            $location.path("capturepic");
        }
    }
     
    $scope.continue = function () {

        $rootScope.action.detail = $scope.action.detail;
        if ($scope.action.detail == null || $scope.action.detail.length < 1) {
            $scope.error = $rootScope.locale.actiondetailerr;
            return;
        }

        if ($rootScope.observation.actions == null) $rootScope.observation.actions = [];

        // picture here -> $rootScope.action.photo = $rootScope.picture;
        $rootScope.observation.actions.push($rootScope.action);
        console.log($rootScope.observation.actions);
        $location.path('sataction');
    };




    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
});