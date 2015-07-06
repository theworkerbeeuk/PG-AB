'use strict';

angular.module('yellowJacketApp')
.filter('overdueaud', function() {
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
.filter('unreadaud', function() {
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
    .controller('AudstatusCtrl', function ($scope, $rootScope, $location, storage) {

         
    ga_storage._trackPageview('/index.html','audits');
        
        
    if (!$rootScope.audlist) {
        storage.load("audlist", function(v) {
            $rootScope.audlist = angular.fromJson(v);
        })
    }
        
    
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


    $scope.ct = $rootScope.selectedCommission;

    if ($rootScope.returnToMain == "y")
        $scope.ct = null;

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

    
    // fix counter
    $rootScope.updateAuditsCount($rootScope.audlist);
        
    var getAll = function() {
        $scope.al = [];
        angular.forEach($rootScope.commissions, function (c) {
            if ($rootScope.audlist && $rootScope.audlist[c.title]) {
                var ar = $rootScope.audlist[c.title];
                angular.forEach(ar, function (a) {
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
                                  if(q.satisfaction == 'N' 
                                     && (!q.observationClientList || q.observationClientList.length == 0))
                                   { 
                                       /* Needed to check specially if we have answer too for this question with 
                                       * 'NO' because if it is not checked and user just select 'NO' 'No' and 
                                       navigate to other question with > & < then there is unnecessary mismatch in 
                                       total number of questions (less shown than answered.)*/
                                       if($scope.tempSelectedQH 
                                          && $scope.tempSelectedQH.answeredQuestions 
                                          && $scope.tempSelectedQH.answeredQuestions.length > 0)
                                        {
                                         var answers = $scope.tempSelectedQH.answeredQuestions;
                                           
                                         angular.forEach(answers, function(ans) 
                                         {
                                            if(ans.id == q.id)
                                            {
                                                $scope.artemp.answQs = $scope.artemp.answQs - 1;
                                            }
                                            
                                          });
                                         //$scope.artemp.answQs = $scope.artemp.answQs - 1;
                                        }
                                    }
                               });
                             }
                             $scope.tempSelectedQH = null;
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
        $scope.ct = {
            title: 'All Commissions'
        };
        $rootScope.alTot = $rootScope.al;
    } else {
        if ($rootScope.audlist)
            $rootScope.al = $rootScope.audlist[$scope.ct.title];

    }

    $scope.all = function () {
        getAll();
        $scope.ct = {
            title: 'All Commissions'
        };
    }

    $scope.select = function (c) {

        $scope.ct = c;
        $rootScope.selectedCommission = c;
        $rootScope.al = $rootScope.audlist[$scope.ct.title];
    }

    $scope.goback = function () {
        if ($rootScope.returnToMain == "y") {
            $location.path("main");
        } else {
            $location.path("commsndtl");
        }
    };

    $scope.audit = function (au) {
//        console.log("audit au -- ct - now = " + angular.toJson($scope.ct));
        //       $rootScope.selectedCommission = au.commission.title;
        $rootScope.selectedCommission = au.commission; // need this for observation kick off to work
        $rootScope.selectedQuestionHeaders = au.selectedQHs;
//        console.log("audit au -- selectcommission - now = " + angular.toJson($rootScope.selectedCommission));

        console.log('AU ' , au);
        $rootScope.audinsp = au;
        au.read = true;
        $rootScope.isInspection = false;
        $rootScope.audinspReturnTo = "audstatus"; 
        $location.path("audanswer");
    };


    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
});