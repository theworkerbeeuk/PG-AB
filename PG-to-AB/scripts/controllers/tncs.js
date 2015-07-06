'use strict';

angular.module('yellowJacketApp')
    .controller('TncsCtrl', function ($rootScope, $scope, $http, $location, storage, $timeout) {

    // get the tncs from the server.
    $scope.loaded = false;


    

    storage.init().then(function() {
        return storage.load("tncs");
    })
    .then(function (data) {
        if (data) {
            $scope.tncs = data;
            $scope.loaded = true;
        }
    })

    $http.get($scope.config.docs + "/tncs.html")
        .success(function (data) {
        $scope.tncs = data;
        storage.save("tncs", data);
        $scope.loaded = true;
    });


//    // fix for keyboard up ipad
//    $('#nbar').css('position', 'absolute');
//    $('#nbar').css('bottom', '0');
//

    $scope.agree = function () {
        saveObject('tncs', '1');
        $location.path("createpin");
    }
    $scope.disagree = function () {
        $location.path("signin");
    }

    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
});