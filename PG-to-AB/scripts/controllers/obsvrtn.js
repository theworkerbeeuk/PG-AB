'use strict';

angular.module('yellowJacketApp').controller('ObsrvtnCtrl', function ($scope, $rootScope, $location) {
    
  
    if ($rootScope.selectedCommission == null) {
        $rootScope.selectedCommission = loadObject("selectedCommission");
    }
    $scope.cid = $rootScope.selectedCommission.id;
    

    $rootScope.observationText = "";
    $scope.obserr = false;
    
    $scope.goback = function() {
        if ($rootScope.observation.suspendedAudit) {
            var cm = $rootScope.selectedCommission.title;
            var l = $rootScope.isInspection ? $rootScope.insplist[cm] : $rootScope.audlist[cm];
                
            var p = "commsndtl";
            angular.forEach(l, function(au) {
            if (au.id == $rootScope.observation.suspendedAudit.aid) {
                        $rootScope.selectedQuestionHeaders = au.selectedQHs;
                        $rootScope.audinsp = au;
                        p = "audanswer";
                    }
                });
                $rootScope.observation.aid = null;
                $location.path(p);
            }
            else 
                $location.path('commsndtl');
        
    };
        
 /*       if (!$rootScope.returnToComDet) {
        $rootScope.back (); 
            }
        else { 
            $location.path("commsndtl");
        };
    }
 */   
    $scope.dolocation = function() {
        $location.path("location");
    };
      
    
    $scope.detail = function(s) {
        if (s.name == "Satisfactory") {
            return "Evidence of Good Practice";
        }
        else
            return "Unsatisfactory Situation";
    }
    
    // validate the form and move onto next screen when fields are done!
    $scope.confirm = function() {
        $scope.obserr = false;
        if ($rootScope.observation.situation == null) {
            $scope.obserr = $rootScope.locale.selsafu;
        }
        else if ($rootScope.observation.cat == null) {
            $scope.obserr = $rootScope.locale.selcat;
        }
        else if ($rootScope.observation.type == null) {
            $scope.obserr = $rootScope.locale.seltype;
        }
        else if ($rootScope.observation.resporg == null) {  
            $scope.obserr = $rootScope.locale.selresporg;
        }
        
        $rootScope.observation.photos = []; // make sure its empty.
        $rootScope.observation.selectedfloor = null; // clear
        if(!$scope.obserr) $location.path("location");
    }
    
    
    $scope.collapse4 = ($rootScope.observation.suspendedAudit) ? "" : "#collapseFour";
    
    $scope.ctoggle = function(c) {
        if ($rootScope.observation.suspendedAudit) {
            if (c==0) { // only stop what did you see from being changed
                // cheat toggle to close it.
                $('#collapseOne').addClass('hidden');
                return;
            }
        }
        $scope.copen[c] = !$scope.copen[c];
        for (var i=0; i < $scope.copen.length; i++) {
          if (i != c) {
              $scope.copen[i] = false;
          }
        }
    }
    
    if ($rootScope.observation.suspendedAudit) {
        $scope.in = ["","in"];
        $scope.copen = [false, true, false, false];
    }
    else {
        
        $scope.in = ["in",""];
        $scope.copen = [true, false, false, false];
    }
    
    $scope.situation = function(satu) {
        $rootScope.observation.situation = satu;
        $scope.copen = [false, true, false, false];
       
    };
      
    $scope.cat = function(cat) {
        $rootScope.observation.cat = cat;
        
        $scope.copen = [false, false, true, false];
    };
      
    $scope.type = function(type) {
        $rootScope.observation.type = type;
        
        if ($rootScope.observation.suspendedAudit) {
            $scope.copen = [false, false, false, false];
            $('#collapseFour').removeClass('in');
        }
        else
            $scope.copen = [false, false, false, true];
    };
    
    $scope.organisation = function(r) {
        $rootScope.observation.resporg = r;  
        $scope.copen = [false, false, false, false];
        
        var cat = $rootScope.observation.cat;
        $rootScope.observation.cat ={};
        $rootScope.observation.cat.id = cat.id;
        $rootScope.observation.cat.name = cat.name;
        $rootScope.observation.cid = $scope.cid;
    };
    
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
