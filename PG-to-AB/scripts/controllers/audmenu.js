'use strict';

angular.module('yellowJacketApp')
  .controller('AudmenuCtrl', function ($scope, $rootScope, $location, $timeout) {
       
    if ($rootScope.selectedCommission == null) {
        $rootScope.selectedCommission = loadObject("selectedCommission");
    }
    $scope.cid = $rootScope.selectedCommission.id;
  // these dont seem to serve any purpose>>>>>  
  //  $rootScope.currentInspection = null;
  //  $rootScope.currentAudit = null;
    
    $scope.audit = {};
    $scope.audit.org = "";
    $scope.audit.cat = "";
    $scope.audit.contact = "";
    $scope.audit.type = "";
    $scope.audmenuError=false;
    $scope.orgopen=true;
    $scope.cntopen=false;
    $scope.catopen=false;
    $scope.typopen=false;
   
    $scope.selectedAllocation='A';
    $scope.audit.organisations = {};
    $scope.audit.categories = {};

//    if (!$rootScope.audits && !$rootScope.isInspection) {
//        $rootScope.audits = loadObject("audits");
////        console.log("audmenu $rootScope.audits ===>>>>>>> " + angular.toJson($rootScope.audits));
//    }

    if ($rootScope.isInspection) {
        $scope.audit.categories = $rootScope.inspectionCategory.inspectionCategories;
        
        if (!$rootScope.inspectionTypes) {
            $location.path("commsndtl");
            $timeout(function() {
                alert("No inspection types assigned to commission");
            }, 100);
        }
        else {
            $scope.audit.types = $rootScope.inspectionTypes.inspectionTypes;
            $scope.audit.recType = "3";
        }
    }
    else { 
        if (!$rootScope.auditCategory || !$rootScope.auditCategory.auditCategories) {
            $rootScope.auditCategory = loadObject("auditCategory");
        }
        $scope.audit.categories = $rootScope.auditCategory.auditCategories;
        if (!$rootScope.auditTypes || !$rootScope.auditTypes.auditTypes) {
            $rootScope.auditTypes = loadObject("auditTypes");
        }
        if (!$rootScope.auditTypes) {
            $location.path("commsndtl");
            $timeout(function() {
                alert("No audit types assigned to commission");
            }, 100);
        }
        else {
            $scope.audit.types = $rootScope.auditTypes.auditTypes;
            $scope.audit.recType = "1";
        }
    }
  
    $scope.goback = function() {
        $location.path("commsndtl");
    };
      
    $scope.continue = function() {
        if ($scope.audit.org=="" || $scope.audit.contact=="" || $scope.audit.cat=="" || $scope.audit.type=="") {
            $scope.audmenuError=true;
        }
        else {
            $scope.audmenuError=false;
            $rootScope.audit = $scope.audit;
            $location.path("audselqs");
        }
    };
      
    //Removes the whole error block when all has been filled in
    //Calling this on each data entry avoids to keep an error box open without an specific error
    $scope.removeError = function () {
        if ($scope.audit.org!="" && $scope.audit.contact!="" && $scope.audit.cat!="" && $scope.audit.type!="") {
            $scope.audmenuError=false;
        }
    };
      
    $scope.setOrganisation = function(org) {
//         console.log("set contact org ====>>>> " + angular.toJson(org));
        $scope.audit.org = org;
        $scope.orgopen=false;
        $scope.cntopen=true;
        $scope.catopen=false;
        $scope.typopen=false;
        $scope.removeError();
    };  

    $scope.setContact = function(org) {
 //       console.log("set contact org ====>>>> " + angular.toJson(org));
        $scope.audit.contact = org.userInfoName;
        $scope.audit.contactId = org.userId;
        $scope.orgopen=false;
        $scope.cntopen=false;
        $scope.catopen=true;
        $scope.typopen=false;
        $scope.removeError();
    };  

    $scope.setCategory = function(cat) {
        $scope.audit.cat=cat;
        $scope.orgopen=false;
        $scope.cntopen=false;
        $scope.catopen=false;
        $scope.typopen=true;
        //| filter:{categoryId:audit.cat.id}
        $scope.faudit = [];
        for (var t=0; t<$scope.audit.types.length; t++) {
            var tt = $scope.audit.types[t];
            if (tt.categoryId == cat.id) $scope.faudit.push(tt);
        }
        $scope.removeError();
    };  
      
    $scope.setType = function(type) {
        $scope.audit.type=type;
        
        var hdrs;
        
        if ($rootScope.isInspection) { // this should clear out the previously answered questions
            var o = "inspectionQuestions";
            $rootScope.inspectionQuestions = loadObject(o);
        }
        else {
            var o = "auditQuestions";
            $rootScope.auditQuestions = loadObject(o);
        }
        
        $rootScope.auditHeaders = [];
        var hdrs = $rootScope.isInspection ? $rootScope.inspectionQuestions.headers :  $rootScope.auditQuestions.headers;
        angular.forEach(hdrs, function (h) {
            if (h.typeId == type.id) {
                 h.isActive = true;
                 $rootScope.auditHeaders.push(h);
            }
        });
        $scope.noqs=null;
        if ($scope.auditHeaders.length < 1) {
            $scope.noqs = "No questions for type: " + type.id + ", category: " + $scope.audit.cat.id;
        }
        $scope.orgopen=false;
        $scope.cntopen=false;
        $scope.catopen=false;
        $scope.typopen=false;
        $scope.removeError();
        
        $rootScope.audinsp = {};
        $rootScope.audinsp.commission = $rootScope.selectedCommission;
        $rootScope.audinsp.recType = $scope.audit.recType;
        var ts = new Date().getTime(); 
        $rootScope.audinsp.auditId = "-1";
        // spelling let server sort this.
//        $rootScope.audinsp.recurranceFrequency = "0";
//        $rootScope.audinsp.recurranceUntil = null;
//        $rootScope.audinsp.recurranceFrom = null;
        $rootScope.audinsp.categoryId = $scope.audit.cat.id;
        $rootScope.audinsp.categoryName= $scope.audit.cat.categoryName;
        $rootScope.audinsp.contact = $scope.audit.contact;
        $rootScope.audinsp.contactId = $scope.audit.contactId;
        $rootScope.audinsp.createdBy = $rootScope.yju.id;
 //       $rootScope.audinsp.org = $scope.audit.org;
        $rootScope.audinsp.organisationId = $scope.audit.org.organisationId; 
        $rootScope.audinsp.organisation = $scope.audit.org.organisationName;
        $rootScope.audinsp.typeId = $scope.audit.type.id;
        $rootScope.audinsp.typeName = $scope.audit.type.name;
        $rootScope.audinsp.dateCreated = $rootScope.dateString();
//        $rootScope.audinsp.typeId = $rootScope.isInspection ? 
//            $scope.audit.type.id :
//            $scope.audit.type.auditTypeId;
//        $rootScope.audinsp.typeName =  $rootScope.isInspection ? 
//            $scope.audit.type.name : $scope.audit.type.auditTypeName;
        
//        console.log($rootScope.auditHeaders);
    };  
      
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
