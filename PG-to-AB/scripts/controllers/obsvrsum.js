'use strict';
angular.module('yellowJacketApp')
  .controller('ObsvrsumCtrl', function ($scope, $rootScope, $location, storage, yjService) {
      
    $('textarea').bind("blur", function (event) { //input[type=text]
       $scope.$apply(function() { //wait for angular..
         setTimeout(function() {
           window.scrollTo(0, 0);
         },500);
       });
    });

    var maxpics = $rootScope.config.MAXPHOTOS;
    if ($rootScope.picture) {
        if (!$scope.observation) $scope.observation = {};
        if (!$scope.observation.photos) $scope.observation.photos = [];
        if ($scope.observation.photos.length > maxpics) $scope.observation.photos.splice(0,1);
        
        // Photo object....
        var p = {};
        p.picture = $rootScope.picturedata;
        p.name= "obs";
        p.type = "observ";
        
        
        p.id = yjService.txid();
        p.imgsrc = p.name + p.type + p.id;
        $scope.observation.photos.push(p);
        $rootScope.picture = null; // prevent double entry
        
        if (!$rootScope.piclist) $scope.piclist = [];
        $rootScope.piclist.push({
            pic: $rootScope.lastPic,
            haveMark: p.picture.x});
    }
    else {
        console.log("****>>> no picture at obsvrsum");
        
        if ($scope.observation && $scope.observation.photos && $scope.observation.photos.length > 0) {
        }
        else 
            $rootScope.piclist = [];
    }
      
    
    
    $scope.$watch("observation.picture", function(n,o) {
        if (typeof $scope.observation == 'undefined') return;
        
        if (typeof $scope.observation.picture != 'undefined' &&
            $scope.observation.picture  != null
           ) 
        {
            if ($scope.observation.photos && $scope.observation.photos.length >= maxpics) return;
            
            $rootScope.picture = $scope.observation.picture;
            $scope.observation.picture = null; 
            $rootScope.returnTo = "obsrvsum";
            $location.path("capturepic");
        }
    }, true);

      
    $scope.photo = function() {
        try {
            if (Camera) {
            }
        }
        catch (e) { // web browser special
            if (!$scope.observation) $scope.observation = {};
//            $rootScope.picture = '../img/testx2.jpg'; // small
            $rootScope.picture = '../img/m.png';
            $scope.observation.picture = null; 
            $rootScope.returnTo = "obsrvsum";
            $location.path("capturepic");
        }
//            var c = document.getElementById('ocan');
//            var ctx = c.getContext("2d");
//            var img = document.getElementById("ocpic");
//            ctx.drawImage( img,10,10);
//            var z = Base64String.compressToUTF16($rootScope.picture);
//            console.log("-----> " + z.length);
//            $rootScope.returnTo = "obsrvsum";
//            $location.path("capturepic");

//        }
//        console.log($scope.imgdata);
    }
    $scope.confirm = function() {
        if (!$scope.observation ||
            ($scope.observation.summary == null || $scope.observation.summary.length < 1)) {
            $scope.error=true;
        }
        else if ($scope.observation.situation.name=='Unsatisfactory') {
            $rootScope.action = {};
            $location.path('createaction');
        }
        else {
            $rootScope.action = {};
            $location.path('sataction');
        }
    }
    
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
