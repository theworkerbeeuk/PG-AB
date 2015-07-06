'use strict';

angular.module('yellowJacketApp')
.filter('overdueinsp', function() {
    return function (input, filterd) {
        if (!filterd) return input;
        
        var output = [];
        angular.forEach(input, function (i) {
            var dd = i.dueDate; //$rootScope.revDate(i.dueDate);
            if (!dd) {
              //output.push(i);
            }
            else {
              var ds = dd.split("-");
              var d = new Date();
              var m = Number(ds[1]) - 1;
              d.setFullYear(ds[0], m, ds[2]);
              if (!(d > filterd)) {
                  output.push(i);
              }
           }
        });
        return output;
    }
})
.filter('unreadinsp', function() {
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
  .controller('InspstatusCtrl', function ($scope, $rootScope, $location, storage) {
        
    ga_storage._trackPageview('/index.html','inspections');

     if (!$rootScope.insplist) {
        storage.load("insplist", function(v) {
            $rootScope.insplist = angular.fromJson(v);
        })
     }

    //console.log("insp status - insplist ", $rootScope.insplist);
    
    $scope.ct = $rootScope.selectedCommission;

    $scope.reverse=true;

      
    $scope.unread = function() {
        $scope.filterur = !$scope.filterur;
    }
        
    $scope.overduefilter = function() {
        // toggle
        if ($scope.filterod) $scope.filterod = null;
        else
            $scope.filterod = new Date();
    }
     
    if ($rootScope.isInspection) {
        if ($rootScope.inspectionCategory)
            $scope.auditCategories = $rootScope.inspectionCategory.inspectionCategories;
        if ($rootScope.inspectionTypes)
            $scope.auditTypes = $rootScope.inspectionTypes.inspectionTypes;
    } else {
        if ($rootScope.auditCategory)
            $scope.auditCategories = $rootScope.auditCategory.auditCategories;
        if ($rootScope.auditTypes)
            $scope.auditTypes = $rootScope.auditTypes.auditTypes;
    }

    $rootScope.updateAuditsCount($rootScope.insplist);
    
    var getAll = function() {
        $scope.al = [];
        angular.forEach($rootScope.commissions, function (c) {
            if ($rootScope.insplist && $rootScope.insplist[c.title]) {
                var ar = $rootScope.insplist[c.title];
                angular.forEach(ar, function(a) {
                    a.commission = c;
                    /* MACE-727 Fix - as we started to make consistent persistence of question answers (even for 
                    'NO') so there is a need to fix the number of answered question count if answer is 'NO' and no 
                    observationClientList associated so far*/
                    $scope.artemp = a;
                    var selectedQHs = a.selectedQHs;
                    if(selectedQHs)
                    {
                         angular.forEach(selectedQHs, function(selcHq) {
                         $scope.tempSelectedQH = selcHq;
                         var questions = selcHq.questions;
                         if(questions)
                          {
                              angular.forEach(questions, function(q) 
                              {
                                  if(q.satisfaction == 'N' && (!q.observationClientList || q.observationClientList.length == 0)) 
                                  {
                                       /* Needed to check specially if we have answer too for this question with 
                                       'NO' because if it is not checked and user just select 'NO' 'No' and 
                                       navigate to other question with > & < then there is unnecessary mismatch in 
                                       total number of questions (less shown than answered.)*/
                                       if( $scope.tempSelectedQH &&  $scope.tempSelectedQH.answeredQuestions &&  
                                          $scope.tempSelectedQH.answeredQuestions.length > 0)
                                       {
                                         var answers = $scope.tempSelectedQH.answeredQuestions;
                                           
                                         angular.forEach(answers, function(ans) 
                                         {
                                            if(ans.id == q.id)
                                            {
                                            $scope.artemp.answQs = $scope.artemp.answQs - 1;
                                            }
                                            
                                          });
                                         
                                       }
                                        // $scope.artemp.answQs = $scope.artemp.answQs - 1;
                                    }
                               });
                             }
                             $scope.tempSelectedQH =null;
                         });
                    }
                 $scope.artemp =null;
                });
                $scope.al = $scope.al.concat(ar);
            }
        });

    }
    if (!$scope.ct) {
        getAll();
        $scope.ct = {title: 'All Commissions'};
        $scope.alTot = $scope.al;
    }
    else {
        if ($rootScope.insplist)
           $scope.al = $rootScope.insplist[$scope.ct.title];
    }
     
    $scope.all = function() {
        //$scope.al = $scope.alTot;
        getAll();
        $scope.ct = {title: 'All Commissions'};
    }
    
    $scope.select = function (c) {
        $scope.ct = c;
        $rootScope.selectedCommission = c;c
        $scope.al = $rootScope.insplist[$scope.ct.title];
    }
    
    $scope.goback = function() {
         if ($rootScope.returnToMain == "y") {
            $location.path("main");
        } else {
            $location.path("commsndtl");
        }
    };
      
    $scope.audit = function(au) {
        $rootScope.selectedCommission = au.commission; // need this for observation kick off to work
        $rootScope.selectedQuestionHeaders = au.selectedQHs;
        $rootScope.audinsp = au;
        $rootScope.isInspection = true;
        $rootScope.audinspReturnTo = "inspstatus"; 

        au.read = true;
        
        $location.path("audanswer");
    };  
      
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
