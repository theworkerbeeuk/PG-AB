'use strict';

angular.module('yellowJacketApp')
  .controller('AudanswerCtrl', function (yjService, $scope, $rootScope, $location, $timeout, storage) {
    
    $scope.hasObservations = false;
    $scope.observationsCount = 0;
    $scope.totalActionsCount = 0;
    
    $scope.calcObservationsStats = function() {
        if($scope.question){
            $scope.hasObservations = $scope.question.observationClientList && $scope.question.observationClientList.length > 0;
            $scope.observationsCount = $scope.hasObservations ? $scope.question.observationClientList.length : 0;
            $scope.totalActionsCount = 0;

            if($scope.hasObservations) {
                angular.forEach($scope.question.observationClientList, function(obs){
                    $scope.totalActionsCount += (obs.actions ? obs.actions.length : 0);
                });
            }
        }else{
            $scope.hasObservations = false;
            $scope.observationsCount = 0;
            $scope.totalActionsCount = 0;
        }
    };
    
    
    $scope.nextfree = function(qh, ix) {
        $scope.ratingerr = false;
        $scope.satiserr = false;
        var totalSlides=qh.questions.length;
        var oix = ix;
        ix++;
        if (ix >=totalSlides) ix = 0;
        var dol=false;
        if (!qh.answeredQuestions) dol=true;
        else if (qh.answeredQuestions.length < totalSlides)
            dol = true;
        if (dol)
        {
            while (qh.questions[ix].answered && ix != oix) {
                ix++;
                if (ix >=totalSlides) ix = 0;
            };
        }
        $rootScope.currentSlide = ix;
        $rootScope.currentHeader = qh;
        $scope.question = qh.questions[ix];
        $scope.calcObservationsStats();
    }
 
    $scope.ratings = $rootScope.auditRating;
    $scope.comment = true;  
    
    //MACE 727 FIX - Moved resetAnswer() as it is required to be invoked by init and get loaded before.
    //This resets the rating and satisfaction to null
    //This also removes the question from the answeredQuestions to make sure that the count is right
    $scope.resetAnswer = function(question, qheader) {
        
        if (question) 
        {
            question.norating = false;

            question.rating = -1;
            question.satisfaction = null;
            question.answered = false; // extra flag for UI decisions
            
            angular.forEach(qheader.answeredQuestions, function(aq, ix) {
                if (aq.id == question.id) 
                {
                    qheader.answeredQuestions.splice(ix, 1);
                }
            })
            question.observationClientList = null; // remove any observations
            $scope.calcObservationsStats();
        }
        
    }
    
    var open = 0;
    $scope.init = function() {

        for (var i = 0; i < $rootScope.selectedQuestionHeaders.length; i++)
        {
            var sq = $rootScope.selectedQuestionHeaders[i];
            sq.questions = $rootScope.makeArray(sq.questions);
            
            // Remember current selection
            // if it is selected, then keep it open
            if (sq.open == true) {
                open = i;
            }
            
            // (Re)set defaults
            sq.open = false;
            sq.in = " ";
            
            // Convenience attribtue for valid and unique div Ids
            sq.qdiv = "div" + i;
            
            // Prepare the array to store the questions, if not already done
            if (!sq.answeredQuestions) sq.answeredQuestions = [];
            var ox = -1;
            
            angular.forEach(sq.questions, function(q, ix) {
                 
                /*
                 * MACE 727 FIX -     
                 * specialScenario represents condition where a question was answered with 'NO' but during action
                 * obsrvation creation user abandon the flow and go to home page, synch page and come back later 
                 * to inspection/audits, we need to display the same question and not next one. and need to display
                 * questions within right question header to avoid mismatch of questions.
                 */

                 if(q.satisfaction == 'N' && (!q.observationClientList || q.observationClientList.length == 0))
                 {  
                    // MACE 727 FIX - reset answer for question with 'NO' and no observation client
                    $scope.resetAnswer(q, sq); 
                    // Even after removing answer of question for which we had no observationClientList (because    
                    // observation/action was not finished with final click finish button). Make sure we empty
                    // observation of it has suspended audit.

                    if ($rootScope.observation && $rootScope.observation.suspendedAudit) 
                    {
                        $rootScope.observation = null;
                    }

                 }
                 if (typeof(q.rating) == 'undefined') 
                 {
                     q.rating = -1;
                     q.norating = false;
                 }
                 q.active = "";
                 if (!q.answered && ox == -1) ox = ix;
             });
            
             if (ox == -1) ox = 0;
             sq.questions[ox].active = "active";
                        
             // FIX for Ticket 445 - make sure we do not have duplicate answered questions
            if (sq.answeredQuestions.length > sq.questions.length) { // problem try and fix
                var aqtemp = [];
                angular.forEach(sq.answeredQuestions, function(aq) {
                    // is this id in questions
                    var valid = false;
                    angular.forEach(sq.questions, function(qq) {
                        if (aq.id == qq.id) { // valid
                           valid = true;   
                        }
                    });
                    
                    if (valid) {
                        // check if not already there
                        var dup = false;
                        angular.forEach(aqtemp, function(aqt) {
                            if (aqt.id == aq.id) dup = true;
                        })
                        if (!dup) {
                            aqtemp.push(aq);
                        }
                    }
                });

                sq.answeredQuestions = aqtemp; 
            }
            
        }
        //Open current selection
        var oh = $rootScope.selectedQuestionHeaders[open];
        oh.open=true;
        oh.in="in";
        
        $scope.nextfree(oh, oh.questions.length);
    }
     
   
    $scope.init(); 


      
    //This closes all headers but the selected one
    $scope.expandThis = function(qheader,allheaders) {
        $scope.ratingerr = false;
        $scope.satiserr = false;

        for (var i=0; i<allheaders.length; i++) {
            allheaders[i].open=false;
            //MACE-727 fix , decide on is open true based on match of question header so that we dont loose value
            // because of copy of questions header passed between method calls and rootScope data not affected.
            if(allheaders[i].id == qheader.id)
            {
                   allheaders[i].open=true;
            }
        }
        //This makes sure that if the selected header was already open, that it will close on tap, too
        qheader.open=true;
        
        $scope.nextfree(qheader, qheader.questions.length);
    };
      
      
      
      

    //This resets the rating and satisfaction to null
    //This also removes the question from the answeredQuestions to make sure that the count is right
    $scope.resetAnswer = function(question,qheader) {
        if (question) {
            question.norating=false;

            question.rating=-1;
            question.satisfaction=null;
            question.answered=false;//extra flag for UI decisions
            
            angular.forEach(qheader.answeredQuestions, function(aq, ix) {
                if (aq.id == question.id) {
                    qheader.answeredQuestions.splice(ix, 1);
                }
            })
            question.observationClientList = null; // remove any observations
            $scope.calcObservationsStats();
        }
        
    }
    
    
    $scope.continue = function(stayPut) { //pause
        $rootScope.audinsp.noOfQs = 0; 
        $rootScope.audinsp.answQs = 0;
        angular.forEach($rootScope.selectedQuestionHeaders, function(h) {
            $rootScope.audinsp.noOfQs += h.questions.length;
            if (h.answeredQuestions)
                $rootScope.audinsp.answQs += h.answeredQuestions.length;
        });
        $rootScope.audinsp.selectedQHs = $rootScope.selectedQuestionHeaders;
        
        
        var cm = $rootScope.audinsp.commission.title;
       
        if (!$rootScope.isInspection) {
            if (!$rootScope.audlist) $rootScope.audlist = {};
            if (!$rootScope.audlist[cm]) $rootScope.audlist[cm] = [];
            if ($rootScope.audlist[cm].indexOf($rootScope.audinsp) == -1) {
                if ($rootScope.audlist[cm].indexOf($rootScope.audinsp) == -1)
                    $rootScope.audlist[cm].push($rootScope.audinsp);
            }
            console.log("**** Audlist>>> " + $rootScope.audlist);
            
            storage.save("audlist", angular.toJson($rootScope.audlist));
        }
        else {
            if (!$rootScope.insplist) $rootScope.insplist = {};
            if (!$rootScope.insplist[cm]) $rootScope.insplist[cm] = [];
            if ($rootScope.insplist[cm].indexOf($rootScope.audinsp) == -1) {
                if ($rootScope.insplist[cm].indexOf($rootScope.audinsp) == -1)
                $rootScope.insplist[cm].push($rootScope.audinsp);
            }
            console.log(">>>>>> " +angular.toJson($rootScope.insplist).length);
            console.log(">>>>>> ", $rootScope.insplist);
            storage.save("insplist", angular.toJson($rootScope.insplist));
        }
        
        if (!stayPut)
            $location.path($rootScope.audinspReturnTo);
    };      
    
    if ($rootScope.observation && $rootScope.observation.suspendedAudit) 
    { 
        var sa = $rootScope.observation.suspendedAudit;
        var qh = sa.header;
        $scope.expandThis(qh,$rootScope.selectedQuestionHeaders);
        angular.forEach(qh.questions, function(q) {
            
            q.active = "";
            
            if (q.observationClientList && q.observationClientList.length > 0) 
            {
                angular.forEach(q.observationClientList, function(observationClient) {
                    
                    observationClient.suspendedAudit = null;
                    
                    angular.forEach(observationClient.actions, function(a) {
                        if (a.organisation) a.organisation.organisationUsers = null;
                    })

                    if (observationClient.cat) {
                        observationClient.cat.observationTypes = null;
                    }
                });
            }
            
        }); 
        
        
        angular.forEach(qh.answeredQuestions, function(aq) {
            
            aq.question = null;
            
            if (aq.observationClientList && aq.observationClientList.length > 0) 
            {
                angular.forEach(aq.observationClientList, function(observation){
                    observation.suspendedAudit = null;
                });
            }
        });
        
        
        if (qh.questions[sa.slide] 
            && (!qh.questions[sa.slide].observationClientList 
                || qh.questions[sa.slide].observationClientList.length == 0)) 
        {
            $scope.resetAnswer(qh.questions[sa.slide], qh);
        }
        else sa.slide++;
        
        if(sa.slide >= qh.questions.length) 
        {
            sa.slide = 0;
        }
        
        if (qh.questions[sa.slide])
            qh.questions[sa.slide].active = "active";
        
        $rootScope.observation.suspendedAudit = null;
        
        // save
        $scope.continue(true);
    }
      
      
    
    if (!$rootScope.currentHeader) {
        $rootScope.currentHeader = $rootScope.selectedQuestionHeaders[0];
    }

    if (!$rootScope.currentSlide) {
       $rootScope.currentSlide = 0;   
    }
      
    // question in qheader.questions 
    $scope.question = $rootScope.currentHeader.questions[$rootScope.currentSlide];
    
    
    
    $scope.goback = function() {
        $location.path($rootScope.audinspReturnTo);
    };
    
    $scope.newobs = function(satis, qh, ix) {
        $rootScope.observation = {};
        var sa = {};
        sa.aid = $rootScope.audinsp.id;
        sa.slide = ix;
        sa.header = qh;
        sa.audinsp = $rootScope.audinsp;
        angular.forEach($rootScope.observationPerformance, function(p) {         
            if (p.name=="Satisfactory" && satis == 'Y') {
                $rootScope.observation.situation = p;
            }
            if (p.name=="Unsatisfactory" && satis == 'N') {
                $rootScope.observation.situation = p;
            }
        });
        $rootScope.observation.suspendedAudit = sa;
        $rootScope.observation.cid = $rootScope.selectedCommission.id;

        var org = {
             "organisationId": $rootScope.audinsp.organisationId,
             "organisationName": $rootScope.audinsp.organisation
        }
        $rootScope.observation.resporg = org;
        
        $location.path("obsrvtn");
    }
    
    
    $scope.selectnext = function(qh, ix, goToEmpty) {
        $scope.ratingerr = false;
        $scope.satiserr = false;

        $scope.comment = true;
        var carouselId = "#"+qh.qdiv+"Carousel";
        var totalSlides=qh.questions.length; //$(carouselId+ ' .item').length;
        
        ++$rootScope.currentSlide;
        if ($rootScope.currentSlide>=totalSlides) $rootScope.currentSlide=0;
        
        
        $rootScope.currentHeader = qh;
            
        $scope.question = $rootScope.currentHeader.questions[$rootScope.currentSlide];
        $scope.calcObservationsStats();
    }
    
    $scope.selectprev = function(qh, ix, goToEmpty) {
        $scope.ratingerr = false;
        $scope.satiserr = false;
        $scope.comment = true;
        var carouselId = "#"+qh.qdiv+"Carousel";
//        var totalSlides=$(carouselId+ ' .item').length;
        
        
        var totalSlides=qh.questions.length; //$(carouselId+ ' .item').length;
        
        --$rootScope.currentSlide;
        if ($rootScope.currentSlide<0) $rootScope.currentSlide=totalSlides-1;
        
//        
//        --ix;
//        if (ix<0) ix = totalSlides-1;
//        $rootScope.currentSlide = ix;
        $rootScope.currentHeader = qh;
//        $(carouselId).carousel(ix);
        
        $scope.question = $rootScope.currentHeader.questions[$rootScope.currentSlide];
        $scope.calcObservationsStats();
        
    }
    
    $scope.getNextIndex = function(ix,totalSlides) {
        ++ix;
        if (ix>=totalSlides) ix=0;
        else if (ix<0) ix = totalSlides-1;
        return ix;
    }
    
    $scope.getPreviousIndex = function(ix,totalSlides) {
        --ix;
        if (ix>=totalSlides) ix=0;
        else if (ix<0) ix = totalSlides-1;
        return ix;
    }
    

    
    $scope.addComment = function(q, qh, ix) {
        $scope.comment = !$scope.comment; 
        
        if (!$scope.comment) {
            var id = '#'+qh.qdiv+"comment"+ix;
            $(id).bind("blur", function (event) { //input[type=text]
               $scope.$apply(function() { //wait for angular..
                 setTimeout(function() {
                   window.scrollTo(0, 0);
                 },500);
               });
            });            
        }
    }
    
      
      
    // send  to server
    $scope.sending = false;
    $scope.finish = function() {
        if ($scope.sending) return;
        
        $scope.sending = true;
        
        $rootScope.audinsp.isInspection = $rootScope.isInspection;
        try {
             yjService.finishAudit($rootScope.audinsp).then(function (v) {
                var auditId = v;
                $scope.sending = false;
                $location.path($rootScope.audinspReturnTo);
            });
        }
        catch(ex) {
            alert(ex);
            $scope.sending = false;
            $location.path($rootScope.audinspReturnTo);
        }
    }
      
    
    $scope.test = function() {
        
        angular.forEach($rootScope.selectedQuestionHeaders, function(qh) {
            qh.answeredQuestions = [];
            angular.forEach(qh.questions, function(q) {
                q.answered=true;
                q.satisfaction='Y';
                qh.answeredQuestions.push(q);
            })
        })
        $scope.finish();
    }

    
    //Manages the rating set and unset
    $scope.setRating = function (rating,question) {
        if (question.answered==true) return false;//do not permit modifications
        question.rating = rating;
        $scope.ratingerr = false;

    };
    
      
      
    //Manages the satisfaction buttons
    $scope.setSatisfaction = function (eva,question) {
        if (question.answered==true) return false;//do not permit modifications
        question.satisfaction=eva;
        
        question.norating=false;
        $scope.satiserr = false;
        
        //If satisfied, fill the thumbs up, empty the others
        if (eva=="Y") {
            $("#eval"+question.id+"_Y").addClass("fa-thumbs-up");
            $("#eval"+question.id+"_Y").removeClass("fa-thumbs-o-up");
            $("#eval"+question.id+"_N").addClass("fa-thumbs-o-down");
            $("#eval"+question.id+"_N").removeClass("fa-thumbs-down");
            $("#eval"+question.id+"_X").addClass("fa-circle-o");
            $("#eval"+question.id+"_X").removeClass("fa-circle");
            //$("#obs"+question.id).blur();
            //$("#obsDiv"+question.id).hide();
        }
        //If unsatisfied, fill the thumbs down, empty the others
        else if (eva=="N") {
            $("#eval"+question.id+"_Y").addClass("fa-thumbs-o-up");
            $("#eval"+question.id+"_Y").removeClass("fa-thumbs-up");
            $("#eval"+question.id+"_N").addClass("fa-thumbs-down");
            $("#eval"+question.id+"_N").removeClass("fa-thumbs-o-down");
            $("#eval"+question.id+"_X").addClass("fa-circle-o");
            $("#eval"+question.id+"_X").removeClass("fa-circle");
            //$("#obsDiv"+question.id).show();
            ////$("#obs"+question.id).focus();
        }
        //If not applicable, fill the circle and empty the others
        else {
            $("#eval"+question.id+"_Y").addClass("fa-thumbs-o-up");
            $("#eval"+question.id+"_Y").removeClass("fa-thumbs-up");
            $("#eval"+question.id+"_N").addClass("fa-thumbs-o-down");
            $("#eval"+question.id+"_N").removeClass("fa-thumbs-down");
            $("#eval"+question.id+"_X").addClass("fa-circle");
            $("#eval"+question.id+"_X").removeClass("fa-circle-o");
            question.norating=true;
            question.rating = -1;
            $scope.ratingerr = false;
        }
    }
    
    $scope.isFinished = function() {
        // easy fix here - only enable the 'finished' button when ALL of the question sets have been answered
        // previous logic only effectively checked the 'last' list...
        var f = true;
        angular.forEach($rootScope.selectedQuestionHeaders, function(qh) {
            if (!qh.answeredQuestions) f = false;
            else
            if (qh.answeredQuestions.length != qh.questions.length) f = false;
            
        });
        return f;          
    }
    
    //Manages the Done button action DONE BUTTON _______
    //    
    $scope.validateAnswer = function(question,qheader,offset, ix, doObservation) {
        //console.log(question);
        //console.log(qheader);
        $scope.comment = true;
        $scope.error = "";
        $scope.errmsg = "";
        var error=false;
        var carouselId = "#"+qheader.qdiv+"Carousel";
        $scope.ratingerr = false;
        $scope.satiserr = false;
        if (question) {
            //No rating -> show inline error message
            if (!$rootScope.isInspection && (question.rating == -1) && !question.norating) {
                $scope.ratingerr = true;
                error=true;
            }
            //Rating -> hide inline error message for the case that it is still visible
//            else {
//                $("#err"+question.id+"_rating").hide();
//                $("#title"+question.id+"_rating").removeClass("redText");
//            }
            //No satisfaction set -> show inline error message
            if (!question.satisfaction) {
                $scope.satiserr = true;
                error=true;
            }
            //Satisfaction set -> hide inline error message for the case that it is still visible
//            else {
//                $("#err"+question.id+"_satisfaction").hide();
//                $("#title"+question.id+"_satisfaction").removeClass("redText");
//            }
        } 
        else {
            error=true;
        }

        //Go to next slide, please note that with an offset of -1 this would go to the previous slide
        //As we only use a Done button, we only go forward, but this code could be used for 
        //implementing a visual slider, a bullet list for going to ANY slide etc.
        if (!error) {
            //if question answered then add to answered questions if not yet there
            //we need an array so that we can easily know how many have been answered
            
            var exists = false;
            angular.forEach(qheader.answeredQuestions, function(aq) { // fix for ticket 445
                if (aq.id == question.id) exists = true;
            });
            if (!exists) { // only push unique answered questions
                var q = jQuery.extend(true, {}, question);
                qheader.answeredQuestions.push(q); 
            }
                        
            question.answered=true;//extra flag for UI decisions
            
            if (question.satisfaction == 'N') {
                /*MACE 727 FIX - Make sure we call continue to persiste the initial answer before moving to nedt    
                  screen onsistently like other flows.*/
                 $scope.continue(true);
                $scope.newobs('N', qheader, ix);
                return; //don;t go to next slide
            }
            if (doObservation) {
                /*MACE 727 FIX - Make sure we call continue to persiste the initial answer before moving to nedt    
                  screen onsistently like other flows.*/
                $scope.continue(true);
                $scope.newobs('Y', qheader, ix)
                return;
            }
            
            // save
            $scope.continue(true);
            
            $scope.selectnext(qheader, ix);
        }
    }


    $scope.showObservation =function(question) {
        if (question.satisfaction=='Y' && !question.answered) {
            if ($rootScope.isInspection) return true;
            if (question.rating != -1) return true;
        }
        return false;
    }
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });