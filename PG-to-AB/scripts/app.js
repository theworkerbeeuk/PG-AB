'use strict';
angular.module('yellowJacketApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ngTouch',
  'frapontillo.bootstrap-switch',
  'pasvaz.bindonce',
  'services.steria', 
  'ui.steria',
  'config.steria'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/signin', {
        templateUrl: 'views/signin.html',
        controller: 'SigninCtrl'
      })
      .when('/createpin', {
        templateUrl: 'views/createpin.html',
        controller: 'CreatepinCtrl'
      })
      .when('/confirmpin', {
        templateUrl: 'views/confirmpin.html',
        controller: 'ConfirmpinCtrl'
      })
      .when('/tncs', {
        templateUrl: 'views/tncs.html',
        controller: 'TncsCtrl'
      })
      .when('/netprefs', {
        templateUrl: 'views/netprefs.html',
        controller: 'NetprefsCtrl'
      })
      .when('/commissn', {
        templateUrl: 'views/commissn.html',
        controller: 'CommissnCtrl'
      })
      .when('/commsndtl', {
        templateUrl: 'views/commsndtl.html',
        controller: 'CommsndtlCtrl'
      })
      .when('/obsrvtn', {
        templateUrl: 'views/obsrvtn.html',
        controller: 'ObsrvtnCtrl'
      })
      .when('/obsrvsum', {
        templateUrl: 'views/obsrvsum.html',
        controller: 'ObsvrsumCtrl'
      })
      .when('/location', {
        templateUrl: 'views/location.html',
        controller: 'LocationCtrl'
      })
      .when('/obsvrpic', {
        templateUrl: 'views/obsrvpic.html',
        controller: 'ObsvrpicCtrl'
      })
      .when('/sataction', {
        templateUrl: 'views/sataction.html',
        controller: 'SatactionCtrl'
      })
      .when('/createaction', {
        templateUrl: 'views/createaction.html',
        controller: 'CreateactionCtrl'
      })
      .when('/actiondetails', {
        templateUrl: 'views/actiondetails.html',
        controller: 'ActiondetailsCtrl'
      })
      .when('/actionedit', {
        templateUrl: 'views/actionedit.html',
        controller: 'ActioneditCtrl'
      })
      .when('/actionend', {
        templateUrl: 'views/actionend.html',
        controller: 'ActionendCtrl'
      })
      .when('/actionlist', {
        templateUrl: 'views/actionlist.html',
        controller: 'ActionlistCtrl'
      })
      .when('/actdetview', {
        templateUrl: 'views/actdetview.html',
        controller: 'ActdetviewCtrl'
      })
      .when('/rejectaction', {
        templateUrl: 'views/rejectaction.html',
        controller: 'RejectactionCtrl'
      })
      .when('/acceptaction', {
        templateUrl: 'views/acceptaction.html',
        controller: 'AcceptactionCtrl'
      })
      .when('/reassignaction', {
        templateUrl: 'views/reassignaction.html',
        controller: 'ReassignactionCtrl'
      })
      .when('/reassignuser', {
        templateUrl: 'views/reassignuser.html',
        controller: 'ReassignuserCtrl'
      })
      .when('/closeaction', {
        templateUrl: 'views/closeaction.html',
        controller: 'CloseactionCtrl'
      })
      .when('/socialnets', {
        templateUrl: 'views/socialnets.html',
        controller: 'SocialnetsCtrl'
      })
      .when('/logout', {
        templateUrl: 'views/logout.html',
        controller: 'LogoutCtrl'
      })
      .when('/browser/:locationID*', {
        templateUrl: 'views/browser.html',
        controller: 'BrowserCtrl'
      })
      .when('/inspstatus', {
        templateUrl: 'views/inspstatus.html',
        controller: 'InspstatusCtrl'
      })
      .when('/capturepic', {
        templateUrl: 'views/capturepic.html',
        controller: 'CapturepicCtrl'
      })
      .when('/audanswer', {
        templateUrl: 'views/audanswer.html',
        controller: 'AudanswerCtrl'
      })
      .when('/audselqs', {
        templateUrl: 'views/audselqs.html',
        controller: 'AudselqsCtrl'
      })
      .when('/audstatus', {
        templateUrl: 'views/audstatus.html',
        controller: 'AudstatusCtrl'
      })
      .when('/audmenu', {
        templateUrl: 'views/audmenu.html',
        controller: 'AudmenuCtrl'
      })
      .when('/floorplan', {
        templateUrl: 'views/floorplan.html',
        controller: 'FloorplanCtrl'
      })
      .when('/changepin', {
        templateUrl: 'views/changepin.html',
        controller: 'ChangepinCtrl'
      })
      .when('/contactus', {
        templateUrl: 'views/contactus.html',
        controller: 'ContactusCtrl'
      })
      .when('/dereg', {
        templateUrl: 'views/dereg.html',
        controller: 'DeregCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })

.run(function ($rootScope, $route, $q, appLocale, unityService, yjService, storage, $location, $window, $timeout, $http) {
    
    
  $rootScope.$on('$routeChangeSuccess', function(next, current) { 
      // fix for keyboard up ipad/iOS
       try {
           if (device && device.platform=='iOS') {
                     window.scrollTo(0, 0);
           }
       }
       catch(e) {}
  });


    rootS = $rootScope;
    $rootScope.wdow = {};
    $rootScope.wdow.h = $window.innerHeight;
    $rootScope.wdow.w = $window.innerWidth;

    // Set up to en
    appLocale.getResources("en-gb").then(function (localeResources) {
        $rootScope.locale = localeResources;
    });
    
    
    $rootScope.generateUUID = function(){
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x7|0x8)).toString(16);
        });
        return uuid;
    };

    
    // browser only - mobiles init on phonegap device detection vvvvv below
    var b = BrowserDetection.name();
    var andy = navigator.userAgent.match(/Android/);
    
    if(!andy && b != "iOS") {
        if (b =="Chrome" || b=="Firefox" || b =="Safari" || b =="Opera") {
            $rootScope.deviceType = "iPhone"; // not really
            $rootScope.keyValue = "dummy4www";
            
            $rootScope.deviceid = loadObject("deviceid");
            if (!$rootScope.deviceid) {
                $rootScope.deviceid = $rootScope.generateUUID();
                saveObject("deviceid",  $rootScope.deviceid);
            }
            $rootScope.notificationToken=$rootScope.deviceid;
            $rootScope.netstat = 1;
            $rootScope.agent = navigator.userAgent;
            storage.init().then(function() {
                $rootScope.ready4Work = true;
                $rootScope.$broadcast("ready4work");
                console.log("ready4work");
            })
        }
    }
   
// change of user or called from de-reg now, so promote to rootScope as function!
        // Delete all the user based data - if its easier delete everything fine but the generic meta data can be left
        //This bit copied from the clear all button so may be some of what we need. 
     $rootScope.doUserChange = function () { 
        console.log('start user change');
        $rootScope.actionList = null;
        $rootScope.floorPlans = null;
         clearObject('inspectionsTS'); // was missing...
         clearObject('auditsTS'); // was missing...
        $rootScope.audlist = null;
        $rootScope.insplist = null;
        $rootScope.al = null;
        $rootScope.commissions = null;
        clearObject('pinHashValue');
        clearObject('tncs');
        clearObject('netprefs');
        clearObject('userpwd'); // new logic to avoid uname and pass entry
         // new logic to avoid uname and pass entry

        $rootScope.registered = false;
        $rootScope.signedIn = false;
        $rootScope.menu = false;
        $rootScope.loggedIn = false;
//        $scope.error = "";
        $rootScope.error = "";
        localStorage.clear();
        $rootScope.pin = null;
        $rootScope.background = null;
         
        yjService.cancelPendingSync();
         
        console.log('done user change');
        return storage.remove();
     }

     $rootScope.sslBad = false;
     $rootScope.validateSSL = function() {
        $window.plugins.sslCertificateChecker.check(
            function() {
                $rootScope.$apply(function() {$rootScope.sslBad = false; });
                    console.log('SSL OK');
            },
            function(message) {
                var bad = false;
                if (message == 'CONNECTION_NOT_SECURE') { 
                    console.log('SSL COMPROMISED');
                    bad = true;
                }
                else if (message == 'CONNECTION_FAILED') {
                    console.log('***** NETWORK DOWN?');
                }
                $rootScope.$apply(function() {$rootScope.sslBad = bad; });
            },
            $rootScope.config.target,
            $rootScope.config.fingerprint
        );
     }
     
     $rootScope.deinitCrypto = function() {
        $rootScope.keyValue = null;
        if (!$rootScope.isDevice) {
          return;
        }
        //alert('de-init cipher');
        var key = 'YJcipher';
        var servicename = device.platform == 'Android'? device.uuid : 'YellowJacket';
        var win = function(value) {
            console.log("GET SUCCESS - Removed Key for Value: " + value);
          //  alert("GET SUCCESS - Removed Key for Value: " + value);
        };
        var fail = function(error) {
            console.log("Unable to remove Key for Value: " + value);
        //    alert("Unable to remove Key for Value: " + value);
            $rootScope.keyValue = null;
        }
        $window.Keychain.removeForKey(win, fail, key, servicename);
     }
     
     $rootScope.initCrypto = function() {
         var def = $q.defer();
        if (!$rootScope.isDevice) {
             $rootScope.keyValue = "dummy4www";
            def.resolve(1);
            return def.promise;
        }
         
        if ($rootScope.keyValue) {
            def.resolve(1);
            return def.promise;
        }
        var key = 'YJcipher';
        var servicename = device.platform == 'Android'? device.uuid : 'YellowJacket';
        var win = function(value) {
            console.log("GET SUCCESS - Retrieved Key: (" + key + ") for Value: (" + value + ")");
            $rootScope.keyValue = value;
            def.resolve(1);
        };
        var fail = function(error) {
            var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz&*!@£$%-+~|";
            var string_length = 8;
            var randomstring = '';
            for (var i=0; i<string_length; i++) {
                var rnum = Math.floor(Math.random() * chars.length);
                randomstring += chars.substring(rnum,rnum+1);
            }
            $rootScope.keyValue = randomstring;
            $window.Keychain.setForKey(function(value) { def.resolve(1); console.log('new key ('+value+') saved');},
                                       function() { def.resolve(1); console.log('Fatal error unable to store key!!');},
                                       key, servicename, randomstring);
            
        };
        $window.Keychain.getForKey(win, fail, key, servicename);
        return def.promise;
     }


    
     $rootScope.registerForPush = function() {
             var successHandler = function(result) {
            console.log("Android " + angular.toJson(result));
        }
        var errorHandler = function(result) {
            console.log("Error " + angular.toJson(result));
        }
        var tokenHandler = function(result) {
            console.log("iOS " + angular.toJson(result));
            $rootScope.notificationToken = result;
        }
        
        var pushNotification = window.plugins.pushNotification;
        if ( device.platform == 'android' || device.platform == 'Android' )
        {
            pushNotification.register(
                successHandler,
                errorHandler, {
                    "senderID":"880816754908",
                    "ecb":"onNotificationGCM"
                });
        }
        else // also check for wp8
        {
            console.log("Register APNS");
            pushNotification.register(
                tokenHandler,
                errorHandler, {
                    "badge":"true",
                    "sound":"true",
                    "alert":"true",
                    "ecb":"onNotificationAPN"
                });
        }
    }
    
    $rootScope.isDevice = false;
    $rootScope.netstat = 1;
    
    // device detection based
    $rootScope.$on('NETSTAT', function(v) {
        console.log("Device " + JSON.stringify(device));
        //Device {"available":true,"platform":"iOS","version":"7.0.2","uuid":"BF054358-5210-4B04-AB25-CAC74E3DE8B2","cordova":"3.3.0","model":"iPhone5,2"}
        $rootScope.registerForPush();
        $rootScope.deviceType = device.platform; //may need to translate to unity deviceType; or do it in unity
        if ( $rootScope.deviceType == "Android")  {
        	$rootScope.deviceType = "android";
        	//$rootScope.notificationToken = device.uuid; //temp
        }
        $rootScope.deviceid = device.uuid; 
        saveObject("deviceid",  $rootScope.deviceid);
        $rootScope.netstat = v;
        $rootScope.agent = navigator.userAgent;
        $rootScope.isDevice = true;
        $rootScope.validateSSL();
        $rootScope.initCrypto().then(function() {
            storage.init().then(function() {
                $rootScope.ready4Work = true;
                $rootScope.$broadcast("ready4work");
            })
        })
     });
    
    
    $rootScope.backg = function(v) {
        $rootScope.background = v;
    }
    
    $rootScope.go = function ( path ) {
        $location.path( path );
    };


    $rootScope.back = function() {
        $window.history.back();
    }
     
    $rootScope.toDate = function(dstr) {
        if (!dstr) return dstr;

        var ds = dstr.split("-");
        return new Date(ds[2]+"-"+ds[1]+"-"+ds[0]);
    }
    
    $rootScope.revDate = function(dstr) {
        if (!dstr) return dstr;

        var ds = dstr.split("-");
        return ds[2]+"-"+ds[1]+"-"+ds[0];
    }
    
    $rootScope.overdue = function (dueDate, rev) {
        if (!dueDate) return false;
        var yes = new Date();
        yes.setDate(yes.getDate() - 1);
        var ds = dueDate.split("-");
        
        var ddate;
        if (rev) {
            ddate = new Date(ds[1]+"/"+ds[2]+"/"+ds[0]);
        }
        else ddate = new Date(ds[1]+"/"+ds[0]+"/"+ds[2]);
        return (ddate < yes);
    }


    /*
     *  Kris Dyson
     *  6th November 2014
     *  Fix for JIRA-739
     *  I have re-written this method as the old 'server' parameter was never used. Also
     *  the 'timestamp' variable was only ever written to.  It was used in the construction of the 
     *  Unity URL, however, reset to zero just before that; so I deleted it.
     *  There was some commented code which I deleted, as it was obviously unused.
     */
    $rootScope.getCommissions = function ()
    {
        var def = $q.defer();
        var co = loadObject("commissions"); // get the commissions from the cache
        
        // if we have a payload from the cache, the get the commissions from it. 
        if (co && co.commissions) $rootScope.commissions = co.commissions;
        else $rootScope.commissions = []; // otherwise make it an empty array of commissions.
        
        $rootScope.loading = "Loading commissions";
        
        // Construct the request url
        var requestUrl = "/services/rest/commisionsservice/getUpdatedCommissionsForUser/" 
            + $rootScope.yju.digest 
            + "/" 
            + $rootScope.yju.organisation.id 
            + "/0.json"; // KHD: the timestamp value was always set to zero anyway
        
        // Dispatch the request
        unityService.fetch(requestUrl).done(function (data) {
            
            // If no commissions are returned, ensure it's an empty array rather than null.
            if(!data.result.commissions) data.result.commissions = [];
            
            $rootScope.commissions = $rootScope.makeArray(data.result.commissions); // sometimes the returned value can be a single object. This is bad. It should always return an array, even if with a length of one.
            
            saveObject("commissions", data.result); 

            def.resolve("commissions");
            
        }).error(function() {
            def.resolve('commissions');
        });
        
        return def.promise;
    };
    
    
    
    var setCategory = function (id, cat) {
        var cn = "";

        angular.forEach(cat, function (ac) {
            if (ac.id == id) {
                cn = ac.categoryName;
            }
        });
        return cn;
    }

    var setTypeName = function (cid, tid, types) {
        var cn = "";
        var t = $rootScope.makeArray(types);
        angular.forEach(t, function (at) {
            if (at.id == tid && at.categoryId == cid) {
                cn = at.name;
            }
        });
        return cn;
    }

    var setOrganisation = function (cid, a) {
        var setCu;
        angular.forEach($rootScope.actionableUsers[cid].commissionUsers, function (cu) {
            if (cu.organisationId == a.organisationId) {
                a.organisation = cu.organisationName;
                setCu = cu;
            }
        });
        if (setCu)
        angular.forEach(setCu.organisationUsers, function (ou) {
            if (ou.userId == a.contactId) {
                a.contact = ou.userInfoName;
            }
            //console.log("User id " + ou.userId + ", contact " + a.contactId);
        });

    }    
    
    /* Audlist>>> {"City University":
    //[{"commission":{"id":2088,"referenceNo":26975,"title":"City University","items":9},
    "recType":"1","auditId":"-1",
    "recurranceFrequency":"0",
    "recurranceUntil":null,"recurranceFrom":null,"categoryId":5,"categoryName":"Safety","contact":"Gordon Craig","contactId":7419,"createdBy":2311,"organisationId":816,"organisation":"Taylor Hoists","typeId":25,"typeName":"Lone Working","dateCreated":"2014-04-08","selectedQHs":[{"id":233,"name":"Training And Competence","questions":[{"id":658,"question":"Check the company has a defined standard for employees who wish to undertake lone working activities"}],"typeId":25,"isActive":true}]},{"commission":{"id":2088,"referenceNo":26975,"title":"City University","items":10},"recType":"1","auditId":"-1","recurranceFrequency":"0","recurranceUntil":null,"recurranceFrom":null,"categoryId":5,"categoryName":"Safety","contact":"Jenny Suckling","contactId":12914,"createdBy":2311,"organisationId":816,"organisation":"Taylor Hoists","typeId":25,"typeName":"Lone Working","dateCreated":"2014-04-08","selectedQHs":[{"id":233,"name":"Training And Competence","questions":[{"id":658,"question":"Check the company has a defined standard for employees who wish to undertake lone working activities"}],"typeId":25,"isActive":true}]},
    */
    
    var copyToAuditList = function(aud, def) {
        console.log("AUD ", aud);
        
        var p; 
        if (!$rootScope.audlist) {
            p = storage.load("audlist");
        }
        else {
            var def2 = $q.defer();
            def2.resolve(null);
            p = def2.promise;
        }

        p.then(function(v) {
            if (v) $rootScope.audlist = angular.fromJson(v);
            else  if (!$rootScope.audlist) $rootScope.audlist = {};
            var al;
            var comm;
            aud.assignedUserAudits = $rootScope.makeArray(aud.assignedUserAudits);
            angular.forEach(aud.assignedUserAudits, function(a) {
                al = {};
                al.auditId = a.auditId;
                al.id = a.auditId;
                al.recurrenceFrequency = a.recurrenceFrequency ;            
                al.recurringUntil = a.recurringUntil;
                al.recurrenceFrom = a.recurrenceFrom;
                al.categoryId= a.auditCategoryId;
    //            al.categoryName = // TBD
    //            al.contact = // TBD
                al.contactId = a.auditedContactId;
                al.createdBy = a.createdBy;
                al.organisationId = a.auditedOrganisationId;  // or is it createdOrganisationId
                al.auditingOrganisation = a.auditingOrganisation;
                al.auditingContactId = a.auditingContactId;
                al.createdOrganisationId = a.createdOrganisationId;
    //            al.organisation = // TBD
                al.typeId = a.auditTypeId;
    //            al.typeName = // TBD
                al.dateCreated = $rootScope.revDate(a.dateCreated); // REVerse date
                al.actualAuditDate = $rootScope.revDate(a.actualAuditDate);
                al.dateModified = $rootScope.revDate(a.dateModified);
                al.dueDate = $rootScope.revDate(a.dueDate);

                al.modifiedBy = a.modifiedBy;
                al.commission = {}
                //al.commission.id = a.commissionId;


                var resultsMap = {};
                a.auditResults = $rootScope.makeArray(a.auditResults);
                angular.forEach(a.auditResults, function (ar) {
                    if (ar)
                    resultsMap[ar.auditQuestionId.toString()] = ar.auditResultsId;
                })
                al.resultsMap = resultsMap;

                if(!$rootScope.commissions) {
                	console.log('defensive code : try and avoid null commissions list');
                	$rootScope.commissions = loadObject('commissions');
                	console.log('defensive code : after loading commissions list is ' + 
                                ($rootScope.commissions? 'not null' : 'null') );
                }

                angular.forEach($rootScope.commissions, function(c) {
                   if (c.id == a.commissionId) comm = c;
                });
                al.commission = comm;

                //console.log("A ", a);
                // check if audit id already thiere in audlist
                var haveAudit = false;
                angular.forEach($rootScope.audlist[comm.title], function(storedAl) {
                    if (storedAl.id != -1 && storedAl.id == al.auditId) {
                        haveAudit = true;
                    }
                });

                if (!haveAudit) {
        //            "selectedQHs":[{"id":233,"name":"Training And Competence","questions":[{"id":658,"question":"Check the company has a defined standard for employees who wish to undertake lone working activities"}],"typeId":25,"isActive":true}]}
        //          
                    var qharray = [];
                    a.auditQuestionHeaders = $rootScope.makeArray(a.auditQuestionHeaders);
                    angular.forEach(a.auditQuestionHeaders, function(aqh) {
                        if (aqh) {
                            var qh = {};
                            qh.id = aqh.auditQuestionHeaderId;
                            qh.name = aqh.questionHeaderName;
                            qh.typeId = aqh.auditTypeId;
                            qh.isActive = aqh.isActive;

                            qh.questions = [];
                            aqh.auditQuestion = $rootScope.makeArray(aqh.auditQuestion);
                            angular.forEach(aqh.auditQuestion, function(aq) {
                                var q = {};
                                q.id = aq.auditQuestionId; 
                                q.question = aq.question;
                                qh.questions.push(q);
                            });

                            qharray.push(qh);
                        }
                    });

                    if (!al.categoryName) {
                        al.categoryName = setCategory(al.categoryId, $rootScope.auditCategory.auditCategories);
                    }
                    if (!al.typeName) al.typeName = setTypeName(al.categoryId, al.typeId, $rootScope.auditTypes.auditTypes);

//                    console.log("AU-comm.id: " + comm.id);
                    if (!al.organisation) setOrganisation(comm.id, al);

                    if (qharray.length > 0) {

                        al.selectedQHs = qharray;

                        al.noOfQs = 0; 
                        al.answQs = 0;
                        angular.forEach(al.selectedQHs, function(h) {
                           al.noOfQs += h.questions.length;
                            if (h.answeredQuestions)
                                al.answQs += h.answeredQuestions.length;
                        });
                        if (!$rootScope.audlist[comm.title])  {
                            $rootScope.audlist[comm.title] = [];
                        }

                        if ($rootScope.audlist[comm.title].indexOf(al) == -1)
                            $rootScope.audlist[comm.title].push(al);
                    }
                }
            });
        
            console.log("Build AUD", $rootScope.audlist);
            
            var json = angular.toJson($rootScope.audlist);
            storage.save("audlist", json).then(function() {
                def.resolve("audits");
                $rootScope.$broadcast('audlist');
            })
        })
    }
    
    $rootScope.getUsersAudits = function (wait4Server) {
        var def = $q.defer();
        $rootScope.loading = "Load audits";
        //var o = loadObject("audlist"); // to get last update date 
        var ts = loadObject("auditsTS");

        storage.load("audlist").then(function(o) {
            ///
            if (o) {
                $rootScope.audlist = angular.fromJson(o);
                if (!wait4Server) def.resolve('audits');
            }
    //        if (ts ==0) {
//                var lastWeeks = new Date().getTime();
//                lastWeeks -= 1000 * 60 * 60 * 24 * 7 * 4; //last months -- ignore incremental - YJ not working so always get last months worth
//                ts = lastWeeks;
    //        }
        // SF - I've put this back because we're not seeing old and outstanding audits!!! BUG: 643!!
            ts = 0; // fixed because of issue with incremental update in YJ
            var request =
                "/services/rest/auditquestionsetservice/getAssignedAuditsForUser/" + $rootScope.yju.digest +"/"+ts+".json";
            unityService.fetch(request)
            .done(function (data) {
                if (data.result.assignedUserAudits ) {
                    var c = data.result.assignedUserAudits ;
                    var cid = data.result.assignedUserAudits.commissionId; // need title?
                    saveObject("auditsTS", data.result.timestamp);
                    copyToAuditList(data.result, def);
                }
                else def.resolve('audits');
            }).error(function() {
                def.resolve('audits');
            })
        })
        return def.promise;
    };
    
    
    
    
    
 var copyToInspectionList = function(aud, def) {
    console.log("INS ", aud); 

    var p; 
    if (!$rootScope.insplist) {
        p = storage.load("insplist");
    }
    else {
        var def2 = $q.defer();
        def2.resolve(null);
        p = def2.promise;
    }

    p.then(function(v) {
        if (v) $rootScope.insplist = angular.fromJson(v);
        else  if (!$rootScope.insplist) $rootScope.insplist = {};
        
        var al;
        var comm;
        aud.assignedUserInspections = $rootScope.makeArray(aud.assignedUserInspections);
        angular.forEach(aud.assignedUserInspections, function(a) {
            al = {};
            al.inspectionId  = a.inspectionId;
            al.id = a.inspectionId;
            al.recurrenceFrequency  = a.recurrenceFrequency;            
            al.recurringUntil = a.recurringUntil;
            al.recurrenceFrom = a.recurrenceFrom;
            al.categoryId= a.inspectionCategoryId;
//            al.categoryName = // TBD
//            al.contact = // TBD
            al.contactId = a.inspectedContactId;
            al.createdBy = a.createdBy;
            al.organisationId = a.inspectedOrganisationId;  // or is it createdOrganisationId
            al.inspectingContactId = a.inspectingContactId;
            al.inspectingOrganisationId = a.inspectingOrganisationId;
            
//            al.organisation = // TBD
            al.typeId = a.inspectionTypeId;
//            al.typeName = // TBD
            al.dateCreated = $rootScope.revDate(a.dateCreated); // REVerse date
            al.actualAuditDate = $rootScope.revDate(a.actualInspectionDate);
            al.dateModified = $rootScope.revDate(a.dateModified);
            al.dueDate = $rootScope.revDate(a.dueDate);
            al.modifiedBy = a.modifiedBy;
            al.commission = {}
            //al.commission.id = a.commissionId;
            
            
            if(!$rootScope.commissions) {
                console.log('defensive code : try and avoid null commissions list');
                $rootScope.commissions = loadObject('commissions');
                console.log('defensive code : after loading commissions list is ' + 
                                ($rootScope.commissions? 'not null' : 'null') );
            }


            
            angular.forEach($rootScope.commissions, function(c) {
               if (c.id == a.commissionId) comm = c;
            });
            al.commission = comm;
            
            
            var resultsMap = {};
            if (a.inspectionResults)
                a.inspectionResults = $rootScope.makeArray(a.inspectionResults);
            angular.forEach(a.inspectionResults, function (ar) {
                resultsMap[ar.inspectionQuestionId.toString()] = ar.inspectionResultsId;
            })
            al.resultsMap = resultsMap;
            
            //console.log("A ", a);
            // check if audit id already thiere in audlist
            var haveAudit = false;
            angular.forEach($rootScope.insplist[comm.title], function(storedAl) {
                if (storedAl.id != -1 && storedAl.id == al.inspectionId) {
                    haveAudit = true;
                }
            });

            if (!haveAudit) {
    //            "selectedQHs":[{"id":233,"name":"Training And Competence","questions":[{"id":658,"question":"Check the company has a defined standard for employees who wish to undertake lone working activities"}],"typeId":25,"isActive":true}]}
    //          
                var qharray = [];
                a.inspectionQuestionHeaders  = $rootScope.makeArray(a.inspectionQuestionHeaders);
                angular.forEach(a.inspectionQuestionHeaders , function(aqh) {
                    if (aqh) {
                        var qh = {};
                        qh.id = aqh.inspectionQuestionHeaderId;
                        qh.name = aqh.questionHeaderName;
                        qh.typeId = aqh.inspectionTypeId;
                        qh.isActive = aqh.isActive;

                        qh.questions = [];
                        aqh.inspectionQuestion  = $rootScope.makeArray(aqh.inspectionQuestion);
                        angular.forEach(aqh.inspectionQuestion, function(aq) {
                            var q = {};
                            q.id = aq.inspectionQuestionId; 
                            q.question = aq.question;
                            qh.questions.push(q);
                        });

                        qharray.push(qh);
                    }
                });

                
                if (!al.categoryName) {
                    al.categoryName = setCategory(al.categoryId,$rootScope.inspectionCategory.inspectionCategories);
                }
                if (!al.typeName) al.typeName = setTypeName(al.categoryId, al.typeId, $rootScope.inspectionTypes.inspectionTypes);

                //console.log("AU ", $rootScope.actionableUsers[c.id].commissionUsers);
                if (!al.organisation) setOrganisation(comm.id, al);

                if (qharray.length > 0) {
                    
                    al.selectedQHs = qharray;
                    al.noOfQs = 0; 
                    al.answQs = 0;
                    angular.forEach(al.selectedQHs, function(h) {
                       al.noOfQs += h.questions.length;
                        if (h.answeredQuestions)
                            al.answQs += h.answeredQuestions.length;
                    });

                    if (!$rootScope.insplist[comm.title])  {
                        $rootScope.insplist[comm.title] = [];
                    }

                    if ($rootScope.insplist[comm.title].indexOf(al) == -1)
                        $rootScope.insplist[comm.title].push(al);
                }
            }
        });
        
        
        console.log("Build INSP", $rootScope.insplist); 
        var json = angular.toJson($rootScope.insplist);
        storage.save("insplist", json).then(function() {
            def.resolve("insp");
            $rootScope.$broadcast('insplist'); 
        })
    })
  }    
    
    
   $rootScope.getUsersInspections = function (wait4Server) {
        var def = $q.defer();
        $rootScope.loading = "Load inspections";
        var ts = loadObject("inspectionsTS");
        storage.load("insplist").then(function(o) {

            if (o) {
                $rootScope.insplist = angular.fromJson(o);
                if (!wait4Server) def.resolve('insp');
            }
            if (!ts) ts = 0;

//            var lastWeeks = new Date().getTime();
//            lastWeeks -= 1000 * 60 * 60 * 24 * 7 * 4; //last months -- ignore incremental - YJ not working so always get last months worth
//            ts = lastWeeks;
        // SF - I've put this back because we're not seeing old and outstanding audits & inspections!!!! BUG: 643!!
            ts = 0; // fixed because of issue with incremental update in YJ
            var request =
                "/services/rest/inspectionquestionsetservice/getAssignedInspectionsForUser/" + $rootScope.yju.digest +"/"+ts+".json";
            unityService.fetch(request)
            .done(function (data) {
                if (data.result.assignedUserInspections  ) {
                    var c = data.result.assignedUserInspections  ;
                    var cid = data.result.assignedUserInspections.commissionId; // need title?
                    saveObject("inspectionsTS", data.result.timestamp); // copy to audit list..?

                    //$rootScope.insplist = loadObject("insplist");// force clear of servers audits
                    copyToInspectionList(data.result, def);
                }
                else 
                    def.resolve('insp');
            }).error(function() {
                def.resolve('insp');
            })
        })
        return def.promise;
    };    
    
    
    
    $rootScope.getActionableUsers = function(cid) {
        // cid = commissions id
        var def = $q.defer();

        function parseau() {
             $rootScope.actionableUsers[cid].commissionUsers = $rootScope.makeArray($rootScope.actionableUsers[cid].commissionUsers);
             angular.forEach($rootScope.actionableUsers[cid].commissionUsers, function(au) {
                var orgn = au.organisationName;
                if (au.organisationUsers) au.organisationUsers = $rootScope.makeArray(au.organisationUsers);
                var found = false;
                if ( $rootScope.commissionsOrgs == null)  $rootScope.commissionsOrgs = [];
                if ( $rootScope.commissionsOrgs[cid] == null)  $rootScope.commissionsOrgs[cid] = [];
                for (var ix=0; ix < $rootScope.commissionsOrgs[cid].length; ix++) {
                    var o = $rootScope.commissionsOrgs[cid][ix];
                    if (o.organisationName == orgn) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    var oo = {organisationId : au.organisationId, organisationName: orgn };
                    $rootScope.commissionsOrgs[cid].push(oo);
                }

            })
        }
        
        if ($rootScope.actionableUsers == null) $rootScope.actionableUsers = [];
        //clearObject("actionableusers"+cid);
//        $rootScope.actionableUsers[cid] = loadObject("actionableusers"+cid); // need to have a timestamp
//        if ($rootScope.actionableUsers[cid] != null) {
//            parseau();
//            return;
//        }
        
        var ts = 0;
//        $rootScope.actionableUsers[cid] = loadObject("actionableusers"+cid);
        
        storage.load("actionableusers"+cid).then(function(o) {
            
            console.log(">>> Loading users " + cid);
            $rootScope.loading = "Load users " + cid;
            if (o) {
                try {
                 $rootScope.actionableUsers[cid] = angular.fromJson(o);
                }
                catch(x) {}
                if ($rootScope.actionableUsers[cid]) {
                    ts = $rootScope.actionableUsers[cid].timestamp;
                    if (!ts) {
                        ts = 0;
                    }
                    else {
                        parseau();
                        console.log("USERS >>>>  Load existing " + cid);
                        def.resolve("actionableusers"+cid);
                    }
                }
            }
             
            var request =
                "/services/rest/commisionsservice/getCommissionUsersList/" + cid + "/"+ts+".json"; 
            unityService.fetch(request)
                .done(function (data) {
                    if (ts == 0 && (!data.result || (data.result.commissionUsers && data.result.commissionUsers.length < 1))) {
                        alert(cid + ', no commission users - check yellowjacket server');
                        def.resolve("actionableusers"+cid);
                    }
                    else {
                        if (data.result.commissionUsers) { 
                            $rootScope.actionableUsers[cid] = data.result;
                            
                            var dr = angular.toJson(data.result);
                            console.log(cid + " ------ length " + dr.length);
                            if (dr.length > 1000000) {
                                alert("Commission user list too large > 1MB for " + cid);
                                def.resolve("actionableusers"+cid);
                                return def.promise;
                            }
//                            console.log("Parsing data for " + cid + ":: " + angular.toJson(data.commissionActionableUser));
                            parseau();
                            var json = angular.toJson($rootScope.actionableUsers[cid]);
                            storage.save("actionableusers"+cid, json).then(function() {
                                console.log("Have loaded users " + cid);
                                def.resolve("actionableusers"+cid);
                            });
                        }
                        else {// need to resolve empty results
                                def.resolve("actionableusers"+cid);
                        }
                    }
                })
                .error(function() {
                     def.resolve("actionableusers"+cid); 
                });            
        });
        return def.promise;
    }
    

    $rootScope.getActionPhoto = function(a, wait4Server) {
        
        console.log("+++++ action ", a);
         var def = $q.defer();
        var o = a.actionId+"-"+a.observationId+"photo";
        
        var parseOA = function(d) {
            var ph; 
            var ta; 
            var descA = ['observationPhotos','actionPhotos', 'actionStateDetailsPhotos'];
            
            angular.forEach(descA, function(desc) {
                ph = d[desc];
                if (ph) {
                    ta = null;
                    if (a[desc]) ta = $rootScope.makeArray(a[desc]);
                    a[desc] = $rootScope.makeArray(ph);
                    angular.forEach (a[desc], function(ax) {
                        if (ta && ax.photoID) {
                          // photo ids need to match
                          angular.forEach(ta, function(t) {
                              if (t.photoId == ax.photoID) {
                                ax.xPosition = t.xPosition;
                                ax.yPosition = t.yPosition;
                              }
                          })
                        }
                        
                    });
                    
                    if (desc == 'actionStateDetailsPhotos') { // not done properly at backend - so we get them from actionStateDetails object
                        //loop thro' actions stateDetails
                        if (a.actionStateDetails) {
                            a.actionStateDetails = $rootScope.makeArray(a.actionStateDetails);
                            angular.forEach(a.actionStateDetails, function(asd) {
                                if (asd.photoMarkers) {
                                    asd.photoMarkers = $rootScope.makeArray(asd.photoMarkers);
                                    angular.forEach(asd.photoMarkers, function(asdpm) {
                                      angular.forEach (a[desc], function(ax, ix) {
                                          if (ax.photoID == asdpm.photoId) {
                                              ax.xPosition = asdpm.xPosition;
                                              ax.yPosition = asdpm.yPosition;
                                          }
                                      })
                                    })
                                }
                            });
                        }
                    }
                    console.log(desc + ', Got photo for ' + a.observationId+", aid: " + a.actionId + ": " + 
                        angular.toJson(a[desc]));

                }
                
            });
        }
        
        
        var imgList;
        // recursively fetch photo url data one by one - if we do it in the loop will get stack overflow in WP8
        var getImage = function(type, a, i, xdef) {
            
            var def = xdef;
            if (!xdef) def = $q.defer();
             //observationservice/getImage/action/184332-2811-act-1396450209220.jpg.json
             var desc = type; //=="action"?"actionPhotos":"observationPhotos";
            
            var fetch = "action";
            if (type == "observationPhotos") {
                fetch = "observation";
            }
            
            if (!a[desc]) {
                saveObject("imageList", imgList);
                def.resolve(1);
                return def.promise;
            }
            if (i >= a[desc].length) {
                saveObject("imageList", imgList);
                def.resolve(1);
                return def.promise;
            }
            if (i == 0) {
                imgList = loadObject("imageList"); //could be more efficient but its just list of names
                if (!imgList) imgList = [];
            }
            
            
             a[desc] = $rootScope.makeArray(a[desc]);
             var ph = a[desc][i];
             var fn = ph.photoDescription+"-"+ph.photoID+"-"+ph.fileName;
             $rootScope.loading = "Load image " + ph.photoDescription+"/"+ph.photoID;
            if (imgList.indexOf(ph.fileName) != -1) {
                // we already have it in storage
                getImage(type, a, ++i, def);
                return def.promise;
            }
             var request = "/services/rest/observationservice/getImage?imagetype="+fetch+"&name="+fn;
             unityService.fetch(request)
                .done(function (data) {
//                    a[desc][i].dataurl = data.img; // do not want to have these in mem 
                    if (imgList.indexOf(ph.fileName) == -1) imgList.push(ph.fileName);
                    storage.save(ph.fileName, data.img).then(function() {
                        getImage(type, a, ++i, def);
                    })
                })
                .error(function(d) {
                    console.log("Error fetching image " );
                    getImage(type, a, ++i, def);
                })
             return def.promise;
        }
        
        var cb = storage.load(o);
        cb.then(function(photos) {
            if (photos) {
                //console.log("Action ph " + photos);
                if (!wait4Server) {
                    var d= angular.fromJson(photos);
                    parseOA(d);
                    //def.resolve('action photo');
                }
            }
//            else {
                
                $rootScope.loading = "Load action " + a.observationId +"/"+a.actionId;
//                var request = "/services/rest/observationservice/getObservationPhotos/"+$rootScope.yju.userId
//                +"/"+$rootScope.yju.id+"/"+a.observationId+"/"+a.actionId+".json";
//                 var request = "/services/rest/observationservice/getObservationPhotos/"+$rootScope.yju.digest
//                 +"/"+$rootScope.yju.id+"/"+a.observationId+"/"+a.actionId+".json";
                 var request = "/services/rest/observationservice/getObservationPhotos/"+$rootScope.yju.digest
                 +"/"+a.commissionId+"/"+a.observationId+"/"+a.actionId+".json";
                unityService.fetch(request)
                    .done(function (data) {
                        if (data.observationactionphotos ) {
                            console.log("Obs/act/state /photo ", data.observationactionphotos);
                            parseOA(data.observationactionphotos);

                            // get them images one by one....
                            var pa = getImage("actionPhotos", data.observationactionphotos, 0);
                            pa.then(function () {
                                return getImage("observationPhotos", data.observationactionphotos, 0);
                            })
                            .then(function() {
                                return getImage("actionStateDetailsPhotos", data.observationactionphotos, 0);
                            })
                            .then(function() {
                                return storage.save(o, angular.toJson(data.observationactionphotos));
                            })
                            .then(function() {
                                 def.resolve('action photo');
                            });
                        
                        }
                        else  {
                            if (wait4Server && photos) {
                                var d= angular.fromJson(photos);
                                parseOA(d);
                            }
                            def.resolve('action photo');
                        }
                    })
                    .error(function(e) {
                        if (wait4Server && photos) {
                            var d= angular.fromJson(photos);
                            parseOA(d);
                        }
                        def.resolve('action photo err ' +e );
                    });
//            }
        });
        
        return def.promise;
    }
    
    $rootScope.getActionList = function(wait4Server) {
        var def = $q.defer();
        var reg = true;
        var ts = 0;
        var d = loadObject("actionList");
        if (d) {
            $rootScope.actionList = d.actions;
            ts = d.timestamp;
            reg = false;
//            if (!wait4Server)
//                def.resolve('actionlist'); -- let the request resolve or we get late loading of data
        }

        if (typeof $rootScope.actionList =='undefined') $rootScope.actionList={};
        if ($rootScope.actionList == null) $rootScope.actionList={};
        $rootScope.loading = "Load action list";
        // true/false incremental access
        if (!ts) {
            ts = 0;
            reg = true;
        }
        
        if (!wait4Server) ts = 0; // logout/login special
        var request = "/services/rest/actionservice/getUserActions/"+$rootScope.yju.digest +"/"+reg+"/"+ts+".json";
//        var request = "/services/rest/actionservice/getUserActions/"+$rootScope.yju.userId +"/"+reg+"/"+ts+".json";
        unityService.fetch(request)
            .done(function (data) {
                // console.log("********** data = " + angular.toJson(data));
            if (data.result) {
                if (data.result.actions) {
                    var p = [];
                    var i = 0;
                    data.result.actions = $rootScope.makeArray(data.result.actions);
                    angular.forEach(data.result.actions, function(a) {
                        var ds = a.raisedOnDate.split("-");
                        a.rdate = new Date();
                        var m = Number(ds[1]) - 1;
                        a.rdate.setFullYear(ds[2], m, ds[0]);   

                        ds = a.dueDate.split("-");
                        a.ddate = new Date();
                        m = Number(ds[1]) - 1;
                        a.ddate.setFullYear(ds[2], m, ds[0]);
                        // get photos for this observations. have to do this for offline working
                        p[i++] = $rootScope.getActionPhoto(a, wait4Server);
                                                
                    });
                    
                    // wait for images..4 actions
                    $q.all(p).then(function() {
                        $rootScope.actionList = data.result.actions;
                        $rootScope.actionListTs = data.result.timestamp;
                        saveObject('actionList', data.result);
                        def.resolve('actionlist');
                    });
                }
                else def.resolve('actionlist');
            }
            else {
              //  console.log("********** err data = " + angular.toJson(data));
                def.resolve('actionlist');
            }
        })
        .error(function() {
             def.resolve('actionlist'); 
        });            
        
        return def.promise;
    }
    
    var floorList;
    $rootScope.fetchAFloor= function(cid, afp, ix, qdef) {
        // recursively load floor images
//        console.log("Flpimage for " + cid + " ix " + ix )
        afp.floorPlans = $rootScope.makeArray(afp.floorPlans);
        var fp = afp.floorPlans[ix];
        if (!fp) { // all done
            saveObject("floorList", floorList);
            qdef.resolve('floor'+cid);
            return;
        }
        var ds = fp.floorPlanId +"_"+cid; // need to tie up with floorplan.js
        
        if (ix == 0) {
            floorList = loadObject("floorList");
            if (!floorList) floorList = [];
        }
        if (floorList && floorList.indexOf(ds) != -1) {
            // dont load - we have it
            $rootScope.loading = 'Load floor ' + ds;
            $rootScope.fetchAFloor(cid, afp, ++ix, qdef); // next one
        }
        else {
//                    alert(ix + "Loading: " + cid + ", " + fp.floorPlanName);
            $rootScope.loading = "Load " + cid + ", " + fp.floorPlanName;

            //http://206.132.43.219:8080/YellowJacket/services/rest/commisionsservice/getFloorPlanImage/2088/5-Floorplan%20Test001%20HG.JPG.json
            var request = "/services/rest/commisionsservice/getFloorPlanImage/"+cid+"/"+fp.floorPlanId +"-"+fp.fileType+".json";
            unityService.fetch(request)
            .done(function (data) {
//                      $rootScope.floorPlans[ds] = data.img;
              var z = data.img; //LZString.compressToUTF16(data.img); //<-- blob write problem
//                          var z = LZString.compressToUTF16(data.img); //<-- blob write problem
              if (z) {
                  var lt = "Load "+fp.floorPlanName  + " ("+z.length/1000 + "k)";
                  $rootScope.loading = lt;
                  console.log(lt);
                  console.log("Got fp " + ds + ", z " + z.substr(0,32));
                  // write to file system

                  if (floorList.indexOf(ds) == -1) floorList.push(ds);

                  storage.save(ds, z).then(function() {
                       $rootScope.fetchAFloor(cid, afp, ++ix, qdef); // recursively fetch the next one
                  })
              }
              else {
                //alert(cid+"/"+fp.floorPlanId +"-"+fp.fileType +", not found");
                $rootScope.fetchAFloor(cid, afp, ++ix, qdef); // recursively fetch the next one
              }
            })
            .error(function(d) {
              console.log('problem with fp '+ds + "," + ix);
              //alert("Error " + cid+"/"+fp.floorPlanId +"-"+fp.fileType +", not found");
              $rootScope.fetchAFloor(cid, afp, ++ix, qdef)
            });
        }
        
     }
    
     $rootScope.fetchFloorImage = function(def, cid, fp) {
//        if (!$rootScope.floorPlans) $rootScope.floorPlans= [];
        $rootScope.fetchAFloor(cid, fp, 0, def);
    }
    
    
    $rootScope.getLocation = function(cid) {
     
        var def = $q.defer();
        
//        $rootScope.loading = "Loading locations for " + cid;
        if ($rootScope.location == null) $rootScope.location = [];
        $rootScope.location[cid] = loadObject("location"+cid);
        if ($rootScope.location[cid]) {
            $rootScope.fetchFloorImage(def, cid, $rootScope.location[cid]);
        }
        else 
        {
            // do you fetch these all the time? yup but go round the old ones as well
                       // new one.. http://localhost:25888/YellowJacket/services/rest/commisionsservice/getCommissionFloorPlans/2088/0.json
            
            var request = "/services/rest/commisionsservice/getCommissionFloorPlans/"+cid+"/0.json";
            unityService.fetch(request)
            .done(function (data) {
                if (data.commissionFloorPlan) {
                    $rootScope.location[cid] = data.commissionFloorPlan;
                    saveObject("location"+cid, data.commissionFloorPlan);
                    $rootScope.location[cid].floorPlans = $rootScope.makeArray($rootScope.location[cid].floorPlans);
                    console.log(cid + "__fp___> " +  angular.toJson($rootScope.location[cid] ));
                    $rootScope.fetchFloorImage(def, cid, $rootScope.location[cid]);
                }
                else {
                    def.resolve('floor'+cid); 
                }
            })
            .error(function() {
                 def.resolve('floors'+cid); 
            });            
          }
        
        return def.promise;
    }
    
    
    /** Generic meta */
    $rootScope.getObservationCategory = function() {
        var def = $q.defer();
        var o = "observationCategory";
        $rootScope.observationCategory = loadObject(o);
        var ts = "0";
        if ($rootScope.observationCategory && $rootScope.observationCategory.timestamp) {
            ts = $rootScope.observationCategory.timestamp;
            def.resolve(o);
        }
        $rootScope.loading = "Load observations";
        var request = "/services/rest/observationservice/getObservationCategories/"+ts+".json";
        unityService.fetch(request)
        .done(function (data) {
//            console.log(">>>> Obs cat " + angular.toJson(data));
            if (data.result && data.result.observationCategories) {
                $rootScope.observationCategory = data.result;
                saveObject(o, $rootScope.observationCategory);
            }
            def.resolve(o);
        })
        .error(function() {
            def.resolve(o);
        });

        return def.promise;
      }
    
    
    $rootScope.getObservationPerformance = function() {
        var def = $q.defer();
        var o = "observationPerformance";
        $rootScope.observationPerformance = loadObject(o);
        if ($rootScope.observationPerformance) {
        	def.resolve(o);
        }
        var request = "/services/rest/observationservice/getObservationPerformanceCategories.json";
        unityService.fetch(request)
        .done(function (data) {
            if (data && data.observationPerformanceCategory) {
                $rootScope.observationPerformance  = data.observationPerformanceCategory;
                saveObject(o, $rootScope.observationPerformance);
            }
            def.resolve(o);
        })
        .error(function() {
            def.resolve(o);
        });
        return def.promise;
    }
    
    
    $rootScope.getActionMeta = function() {
        var def = $q.defer();

        $rootScope.actionMeta = loadObject("actionMeta");
        if ($rootScope.actionMeta) {
            def.resolve("actionmeta");
        }
        if (typeof $rootScope.actionMeta =='undefined') $rootScope.actionMeta={};
        if ($rootScope.actionMeta == null) $rootScope.actionMeta={};
        
        var request = "/services/rest/actionservice/getActionTypes.json";
        unityService.fetch(request)
            .done(function (data) {
            if (data.actionType) {
                $rootScope.actionMeta.type = data.actionType;
            }
            $rootScope.$emit("ACTION", "meta"); 
        })
        .error(function() {
            $rootScope.$emit("ACTION", "meta"); 
        });
                
        var request = "/services/rest/actionservice/getRiskRatings.json";
        unityService.fetch(request)
            .done(function (data) {
            if (data.RiskRating) {
                $rootScope.actionMeta.risk = data.RiskRating;
            }
            $rootScope.$emit("ACTION", "meta"); 
        })
        .error(function() {
            $rootScope.$emit("ACTION", "meta"); 
        });
        
        var allActmeta=0;
        $rootScope.$on('ACTION', function(src) {
            allActmeta++;
            if (allActmeta > 1) {
                // ok have all meta store it
                saveObject("actionMeta", $rootScope.actionMeta);
                def.resolve("actionmeta");
            }
        });

        return def.promise;
    }    
    
    
    /** Aggregate */
    $rootScope.getGenericMeta = function() {
        $rootScope.loading = "Load";
        $rootScope.loadingLarge = true; // location data
        
        console.log("********* Get generic meta ");
        var def = $q.defer();
        $rootScope.haveGenericMeta = null;
        var p = [];
        var i = 0;
        p[i++] = $rootScope.getObservationPerformance()
        .then(function() {
            return $rootScope.getObservationCategory();
        })
        .then(function() {
            return $rootScope.getActionMeta();
        })
        .then(function(s) {
            console.log("***** have generic meta");
            $rootScope.haveGenericMeta = true; 
            $rootScope.loading = null;
            $rootScope.loadingLarge = false; // location data
            def.resolve(1);
        });
        return def.promise;
    }
    
    
  $rootScope.getInspectionCategory = function() {
    var def = $q.defer();
    var o = "inspectionCategory";
    $rootScope.inspectionCategory = loadObject(o);
    var ts = "0";
    if ($rootScope.inspectionCategory && $rootScope.inspectionCategory.timestamp) {
        ts = $rootScope.inspectionCategory.timestamp;
        def.resolve(o);
    }
      
    if (ts == "0")
        $rootScope.loading = "Load categories";
    var request = "/services/rest/inspectionquestionsetservice/getInspectionCategories/"+ts+".json";
    unityService.fetch(request)
    .done(function (data) {
        //console.log(">>>> Insp cat " + angular.toJson(data));
        if (data.result && data.result.inspectionCategories) {
            data.result.inspectionCategories = $rootScope.makeArray(data.result.inspectionCategories);
            $rootScope.inspectionCategory = data.result;
            saveObject(o, $rootScope.inspectionCategory);
        }
        def.resolve(o);
    })
    .error(function() {
        def.resolve(o);
    });

    return def.promise;
  }

  $rootScope.getInspectionTypes = function() {
    var def = $q.defer();
    var o = "inspectionTypes";
    $rootScope.inspectionTypes = loadObject(o);
    var ts = "0";
    if ($rootScope.inspectionTypes && $rootScope.inspectionTypes.timestamp) {
        ts = $rootScope.inspectionTypes.timestamp;
        def.resolve(o);
    }

    if (ts == "0")
        $rootScope.loading = "Load types ";
    var request = "/services/rest/inspectionquestionsetservice/getInspectionTypes/"+$rootScope.yju.digest+"/"+ts+".json";
//    var request = "/services/rest/inspectionquestionsetservice/getInspectionTypes/"+$rootScope.yju.userId+"/"+ts+".json";
    unityService.fetch(request)
    .done(function (data) {
//         console.log(">>>> Insp typ " + angular.toJson(data));
        if (data.result && data.result.inspectionTypes) {
            data.result.inspectionTypes = $rootScope.makeArray(data.result.inspectionTypes);
            $rootScope.inspectionTypes = data.result;
            saveObject(o, $rootScope.inspectionTypes);
        }
        else {
            console.log("no data from inspection types");
        }
        def.resolve(o);
    })
    .error(function() {
        def.resolve(o);
    });

    return def.promise;
  }
    
  $rootScope.getInspectionQuestions = function() {
    var def = $q.defer();
    var o = "inspectionQuestions";
    $rootScope.inspectionQuestions = loadObject(o);
    var ts = "0";
    if ($rootScope.inspectionQuestions && $rootScope.inspectionQuestions.timestamp) {
        ts = $rootScope.inspectionQuestions.timestamp;
        def.resolve(o);
    }
    if (ts == "0")
        $rootScope.loading = "Load questions ";
//    var request = "/services/rest/inspectionquestionsetservice/getInspectionQuestionSetForUserOrganisation/"+$rootScope.yju.userId+"/"+ts+".json";
    var request = "/services/rest/inspectionquestionsetservice/getInspectionQuestionSetForUserOrganisation/"+$rootScope.yju.digest+"/"+ts+".json";
    unityService.fetch(request)
    .done(function (data) {
        //console.log(">>>> Insp ques " + angular.toJson(data));
        if (data.result && data.result.headers) {
            data.result.headers = $rootScope.makeArray(data.result.headers);
            $rootScope.inspectionQuestions = data.result;
            saveObject(o, $rootScope.inspectionQuestions);
        } 
        else {
            console.log("no data from inspection questions");
        }
        def.resolve(o);
    })
    .error(function() {
        def.resolve(o);
    });
      
    return def.promise;
  }
   
  
  ///// Audits
  $rootScope.getAuditRating = function() {
    var def = $q.defer();
    var o = "auditRating";
    $rootScope.auditRating = loadObject(o);
    if ($rootScope.auditRating) def.resolve(o);
    var request = "/services/rest/auditquestionsetservice/getAuditRatings.json";
    unityService.fetch(request)
    .done(function (data) {
        if (data.auditrates  && data.auditrates.auditRatingResponse ) {
            $rootScope.auditRating = data.auditrates.auditRatingResponse;
            saveObject(o, $rootScope.auditRating);
        }
        def.resolve(o);
    })
    .error(function() {
        def.resolve(o);
    });

    return def.promise;
  }
  
  $rootScope.getAuditCategory = function() {
    var def = $q.defer();
    var o = "auditCategory";
    $rootScope.auditCategory = loadObject(o);
    var ts = "0";
    if ($rootScope.auditCategory && $rootScope.auditCategory.timestamp) {
        ts = $rootScope.auditCategory.timestamp;
        def.resolve(o);
    }

    if (ts == "0")
        $rootScope.loading = "Load categories";
    var request = "/services/rest/auditquestionsetservice/getAuditCategories/"+ts+".json";
    unityService.fetch(request)
    .done(function (data) {
        //console.log(">>>> Audit cat " + angular.toJson(data));
        if (data.result && data.result.auditCategories) {
            data.result.auditCategories = $rootScope.makeArray(data.result.auditCategories);
            $rootScope.auditCategory = data.result;
            saveObject(o, $rootScope.auditCategory);
        }
        def.resolve(o);
    })
    .error(function() {
        def.resolve(o);
    });

    return def.promise;
  }

  $rootScope.getAuditTypes = function() {
    var def = $q.defer();
    $rootScope.auditTypes = loadObject("auditTypes");
    var ts = "0";
    if ($rootScope.auditTypes && $rootScope.auditTypes.timestamp) {
        ts = $rootScope.auditTypes.timestamp;
        def.resolve("auditTypes");
    }

    if (ts == "0")
        $rootScope.loading = "Load types";

    if (!$rootScope.yju) $rootScope.yju = loadObject("user");

//    var request = "/services/rest/auditquestionsetservice/getAuditTypes/"+$rootScope.yju.userId+"/"+ts+".json";
    var request = "/services/rest/auditquestionsetservice/getAuditTypes/"+$rootScope.yju.digest+"/"+ts+".json";
    unityService.fetch(request)
    .done(function (data) {
         //console.log(">>>> Audit typ " + angular.toJson(data));
        if (data.result  && data.result.auditTypes) {
            data.result.auditTypes = $rootScope.makeArray(data.result.auditTypes);
            $rootScope.auditTypes = data.result;
            saveObject("auditTypes", $rootScope.auditTypes);
        }
        def.resolve('auditTypes');
    })
    .error(function() {
        def.resolve('auditTypes');
    });

    return def.promise;
  }
    
  $rootScope.getAuditQuestions = function() {
    var def = $q.defer();
    $rootScope.auditQuestions = loadObject("auditQuestions");
    var ts = "0";
    if ($rootScope.auditQuestions && $rootScope.auditQuestions.timestamp) {
        ts = $rootScope.auditQuestions.timestamp;
        def.resolve('auditQuestions');
    }

    if (ts == "0")
        $rootScope.loading = "Load questions";
    // use inspection set while we wait
    var request = "/services/rest/auditquestionsetservice/getAuditQuestionSetForUserOrganisation/"+$rootScope.yju.digest+"/"+ts+".json";
//    var request = "/services/rest/auditquestionsetservice/getAuditQuestionSetForUserOrganisation/"+$rootScope.yju.userId+"/"+ts+".json";
    unityService.fetch(request)
    .done(function (data) {
        //console.log(">>>> >>>>>>>>>>>>>>>>>>>>>>>> Insp ques " + angular.toJson(data));
        if (data.result && data.result.headers) {
            $rootScope.auditQuestions = data.result;
            saveObject("auditQuestions", $rootScope.auditQuestions);
        }
        def.resolve('auditQuestions');
    })
    .error(function() {
        def.resolve('auditQuestions');
    });
      
    return def.promise;
  }
   
  /////
  
   $rootScope.getUserMeta = function() {
         
        console.log("==== Get user meta");
       
        var def = $q.defer();
       
        $rootScope.haveUserMeta = null;
        var p = [];
        if (!$rootScope.yju) $rootScope.yju = loadObject("user");

        $rootScope.loading = "Load";
        $rootScope.loadingLarge = true; // location data

        var i=0;
        var cids = [];
        $rootScope.loadingState = "Commissions";
        var pc = $rootScope.getCommissions(); 
        pc.then(function() { // cannot wait on defer since we want the response from server
            $rootScope.loadingState += ", Actions";

            console.log("Get action list");
            return $rootScope.getActionList();
        })
        .then(function() {
            $rootScope.loadingState += ", Locations";
            console.log("Get locations");
            // got commissions
            angular.forEach($rootScope.commissions, function(c) {
               cids.push(c.id);
            });
            
            // load location each commission at a time....recursively
            var ldef = $q.defer()
            p[++i] = ldef.promise;
            var getloc = function(cids, cix) {
                var c = cids[cix];
                if (c) {
                    $rootScope.getLocation(c).then(function() { getloc(cids, ++cix) });
                }
                else 
                  ldef.resolve(cix);
            }
            getloc(cids, 0);
            
            return ldef.promise;
        })
        .then(function() {
            console.log("Get actionable users");
            $rootScope.loadingState += ", Users";
            var adef = $q.defer()
            p[++i] = adef.promise;
            var getau = function(cids, cix) {
                var c = cids[cix];
                if (c) {
                    console.log('>>>>>>  c ' + c);
                    $rootScope.getActionableUsers(c).then(function() { 
                        getau(cids, ++cix); 
                    });
                }
                else 
                  adef.resolve(cix);
            }
            getau(cids, 0);
            return adef.promise;
            
        })
        .then(function() {
            $rootScope.loadingState += ", Audits";

            console.log("get user audits");
            
            return $rootScope.getUsersAudits();
        })
        .then(function() {
            $rootScope.loadingState += ", Inspections";
            console.log("Get user inspections");
            return $rootScope.getUsersInspections();
        })
        .then(function() {
            $rootScope.loadingState = "";
            if ($rootScope.loggedIn)
                $rootScope.background = true;
            console.log("********* Have usermeta ");
            $rootScope.haveUserMeta = true;

            if ($rootScope.haveUserWL) {
                $rootScope.loading = null;
                $rootScope.loadingLarge = false; //controls main menu spinner
            }

            def.resolve(1);
        })
            
       return def.promise;
        
  }
   
   
   
/// Update Meta
$rootScope.updateMeta = function() {
         
        console.log("==== Update meta");
    
        var def = $q.defer();
       
        var p = [];
        if (!$rootScope.yju) $rootScope.yju = loadObject("user");

        //$rootScope.loading = "Loading";

        var i=0;
        var cids = [];
        $rootScope.loadingState = "Commissions";
        var currComm = [];
        if ($rootScope.commissions && $rootScope.commissions.length > 0)
            currComm = $rootScope.commissions.slice(0);
    
        var wait4Server = true;
        var pc = $rootScope.getCommissions(); 
        pc.then(function() { 
            if(!$rootScope.auditCategory || !$rootScope.inspectionCategory) {
                return $rootScope.getUserWorkLoad();
            }
            else {
                var xd = $q.defer();
                xd.resolve(1);
                return xd.promise;
            }
        })
        .then(function() { // cannot wait on defer since we want the response from server
            $rootScope.loadingState += ", Actions";
            console.log("Get action list");
            
            $rootScope.getActionList(wait4Server)
            .then(function() {
                $rootScope.loadingState += ", Locations";
                console.log("Get locations");
                // have changed commissions
                angular.forEach($rootScope.commissions, function(c) {
                   var found = false;
                   angular.forEach(currComm, function(xc) {
                       if (xc.id == c.id) found = true;
                   })
                   if (!found) cids.push(c.id);
                });

                // load location each commission at a time....recursively
                var ldef = $q.defer()
                p[++i] = ldef.promise;
                var getloc = function(cids, cix) {
                    var c = cids[cix];
                    if (c) {
                        $rootScope.getLocation(c).then(function() { getloc(cids, ++cix) });
                    }
                    else 
                      ldef.resolve(cix);
                }
                if (cids.length > 0)
                    getloc(cids, 0);
                else 
                    ldef.resolve(0);

                return ldef.promise;
            })
            .then(function() {
                console.log("Get actionable users");
                $rootScope.loadingState += ", Users";
                var adef = $q.defer()
                p[++i] = adef.promise;
                var getau = function(cids, cix) {
                    var c = cids[cix];
                    if (c) {
                        console.log('>>>>>>  c ' + c);
                        $rootScope.getActionableUsers(c).then(function() { 
                            getau(cids, ++cix); 
                        });
                    }
                    else 
                      adef.resolve(cix);
                }
                if (cids.length > 0)
                    getau(cids, 0);
                else
                    adef.resolve(0);

                return adef.promise;

            })
            .then(function() {
                $rootScope.loadingState += ", Audits";

                console.log("get user audits");

                return $rootScope.getUsersAudits(wait4Server);
            })
            .then(function() {
                $rootScope.loadingState += ", Inspections";
                console.log("Get user inspections");
                return $rootScope.getUsersInspections(wait4Server);
            })
            .then(function() {
                $rootScope.loading = null;
                $rootScope.loadingState = "";
                if ($rootScope.loggedIn)
                    $rootScope.background = true;
                console.log("********* Have update usermeta ");
                def.resolve(1);
            })
        })
            
       return def.promise;
        
  }   
   
  $rootScope.getUserWorkLoad = function() {
      
      console.log("Get user workload");
      var def = $q.defer();
      
      $rootScope.haveUserWL = null;
      $rootScope.loading = "Loading";
      $rootScope.loadingLarge = true; // location data
      var p = [];
      var i=0;
      var cid=0; // for now -- later loop thro' commissions
      p[i++] = $rootScope.getAuditRating();
      p[i++] = $rootScope.getAuditCategory();
      p[i++] = $rootScope.getAuditTypes();
      p[i++] = $rootScope.getAuditQuestions();
    
//      p[i-1].then(function() {
//          $rootScope.loading = "Loading inspections";
//      });

      p[i++] = $rootScope.getInspectionCategory();
      p[i++] = $rootScope.getInspectionTypes();
      p[i++] = $rootScope.getInspectionQuestions();
      
      
      $q.all(p).then(function(d) {
          $rootScope.haveAuditData = true;
          $rootScope.haveUserWL = true;
          console.log("********* Have user workload " + d);
          if ($rootScope.haveUserMeta) {
              $rootScope.loading = null;
              $rootScope.loadingLarge = false; 
          }
          
          def.resolve(1);
      });
      
      return def.promise;
  }    
  

  $rootScope.updateAuditsCount = function(alarray) {
    angular.forEach($rootScope.commissions, function (c) {
        if (alarray && alarray[c.title]) {
            var alx = alarray[c.title];
            angular.forEach(alx, function(al) {
                al.noOfQs = al.answQs = 0;
            
                angular.forEach(al.selectedQHs, function(h) {
                   al.noOfQs += h.questions.length;
                    if (h.answeredQuestions)
                        al.answQs += h.answeredQuestions.length;
                });
            
            });
        }
    });
  }

  
    $rootScope.navlist = [
        {
            "link": "/",
            "spanClass": "",
            "name": "Home",
            "activeClass": "",
            "icon": "icongw-home"
        },
        {
            "link": "/socialnets",
            "spanClass": "",
            "name": "Social Networks",
            "activeClass": "",
            "icon": "icongw-tasks"
        },
        {
            "link": "/contactus",
            "spanClass": "",
            "name": "Contact Us",
            "activeClass": "",
            "icon": "icongw-tasks"
        },
        {
            "link": "/changepin",
            "spanClass": "",
            "name": "Change PIN",
            "activeClass": "",
            "icon": "icongw-tasks"
        },
        {
            "link": "/netprefs",
            "spanClass": "",
            "name": "Network Preferences",
            "activeClass": "",
            "icon": "icongw-tasks"
        },
        {
            "link": "/tncs",
            "spanClass": "",
            "name": "Terms & Conditions",
            "activeClass": "",
            "icon": "icongw-tasks"
        },
         {
            "link": "/dereg",
            "spanClass": "",
            "name": "Deregister",
            "activeClass": "",
            "icon": "icongw-tasks"
        },
        {
            "link": "/logout",
            "spanClass": "",
            "name": "Logout",
            "activeClass": "",
            "icon": "icongw-tasks"
        }
    ];

});


function NavCtrl($scope, $location) {
    $scope.goto = function(n) {
        $scope.go(n.link);
        $scope.collapse();
    }
    $scope.collapse = function() {
        if ($(".main .navbar-collapse").hasClass("in")) {
            $(".main .navbar-collapse").collapse('toggle'); // jquery to hide expanded nav items in mobile mode
        }
    }

    
}




function getURLParameter(name) {
    return decodeURI((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [
   , null])[1]);
}


// Cordova is ready - browser display special
//
function onDeviceReadyBrowse() {
    var ref = window.open(toUrl, '_blank', 'location=yes');
//    ref.addEventListener('loadstart', function() { alert('start: ' + event.url); });
//    ref.addEventListener('loadstop', function() { alert('stop: ' + event.url); });
    ref.addEventListener('exit', function() { history.back(); });
}


var rootS;

/*
 * Save an object that can be serialised to JSON
 */
function saveObject(name, object) {
//    var sc = angular.element(document.getElementById('mcid')).scope();
    
    var key = rootS.keyValue;
    //console.log('using cipher : '+key);
    try {
        var item = JSON.stringify(object);
//
//        var key = '01234567';
        var encrypted = CryptoJS.AES.encrypt(item, key);
//    console.log('save object : '+name+' source : ['+item+']');
//    localStorage.setItem(name, encrypted);
//    localStorage.setItem(name, item);
    localStorage.setItem("x_"+name, encrypted);
    return true;
    }
    catch (e) {
        console.log(e);
        console.log("item " + encrypted);
    }
    return false;
}

/*
 * Delete an object than can be serialised as JSON
 */
function clearObject(name, object) {
//    console.log("Clearing ["+name+"]");
    localStorage.setItem(name, "");
    return true;
}

function loadObject(name) {
    var str = localStorage.getItem("x_"+name);
//    if( str == null) console.log("Load ["+name+"] isNULL");
    if( str == null) return null;
    if( str == "") console.log("Load ["+name+"] isEMPTY");
    if( str == "") return null;
    if (typeof str == 'undefined') return null;
    var key = rootS.keyValue;
    if(key == null) {
        rootS.initCrypto();
        key = rootS.keyValue;
        if(key == null) alert('Error: Cipher is NULL');
    }
    try {
        var tmp = CryptoJS.AES.decrypt(str, key).toString();
        var tempstr = '';
        for (var ix = 0; ix < tmp.length; ix = ix + 2)
        {
            tempstr = tempstr + String.fromCharCode(parseInt(tmp.substr(ix, 2), 16));
        }
//        console.log('loaded object : '+name+' val ['+tempstr+']');
        str = tempstr;
    }
    catch(e) {
        console.log('decrypt failed : '+e);
    }
    try {
     var object = JSON.parse(str);
     return object;
    }
    catch (e) {
        //alert(e); <- for our folks to not get a whinge when cipher doesn't...
        return null;
    }
}
function updAlObj(al, ts) {
            var alobj = {};
            alobj.actions = [];
            alobj.actions = al;
            alobj.timestamp = ts;
//            console.log("about to save actionlist" + angular.toJson (alobj));
            saveObject('actionList', alobj);
}



var showNotification = function(scope, msg) {
    scope.$apply(function() {
        scope.notification = msg;
        scope.loading = msg;
        
        if (scope.loggedIn) {
            scope.background = true;
            scope.getActionList();
            $('#notificationModal').modal();
        }        
        
    });
    setTimeout(function() {
       scope.$apply(function() {
//           scope.notification = null;
            scope.loading = null;
       });
    }, 7000);
    
}
var onNotificationAPN = function (event) {
    var sc = angular.element(document.getElementById('mcid')).scope(); 
    console.log("Notification APNS " + angular.toJson(event));
    if ( event.alert )
    {
       showNotification(sc, event.alert);
    }
    
    //        if ( event.sound )
    //        {
    //            var snd = new Media(event.sound);
    //            snd.play();
    //        }
    
    if ( event.badge )
    {
        //            pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
    }
}
function safeApply(scope, fn) {
    (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
}

var onNotificationGCM = function (e) {
    var sc = angular.element(document.getElementById('mcid')).scope(); 
    switch( e.event )
    {
        case 'registered':
            if ( e.regid.length > 0 )
            {
                //                $("#app-status-ul").append('<li>REGISTERED -> REGID:' + e.regid + "</li>");
                // Your GCM push server needs to know the regID before it can push to this device
                // here is where you might want to send it the regID for later use.
                console.log("regID = " + e.regid);
                
                safeApply(sc, function() {
                    sc.notificationToken = e.regid;
                })
            }
            break;
            
        case 'message':
            console.log("MSG : " + JSON.stringify(e));
               showNotification(sc, e.payload.payload);
//             MSG : {"payload":{"payload":"Steria Unity: test msg"},"from":"880816754908","collapse_key":"0","foreground":true,"event":"message"}

            // if this flag is set, this notification happened while we were in the foreground.
            // you might want to play a sound to get the user's attention, throw up a dialog, etc.
            if ( e.foreground )
            {
                //                $("#app-status-ul").append('<li>--INLINE NOTIFICATION--' + '</li>');
                
                // if the notification contains a soundname, play it.
//                var my_media = new Media("/android_asset/www/"+e.soundname);
//                my_media.play();
            }
            else
            {  // otherwise we were launched because the user touched a notification in the notification tray.
                if ( e.coldstart )
                {
                    //                    $("#app-status-ul").append('<li>--COLDSTART NOTIFICATION--' + '</li>');
                }
                else
                {
                    //                    $("#app-status-ul").append('<li>--BACKGROUND NOTIFICATION--' + '</li>');
                }
            }
            
            //            $("#app-status-ul").append('<li>MESSAGE -> MSG: ' + e.payload.message + '</li>');
            //            $("#app-status-ul").append('<li>MESSAGE -> MSGCNT: ' + e.payload.msgcnt + '</li>');
            break;
            
        case 'error':
            //            $("#app-status-ul").append('<li>ERROR -> MSG:' + e.msg + '</li>');
            break;
            
        default:
            //            $("#app-status-ul").append('<li>EVENT -> Unknown, an event was received and we do not know what it is</li>');
            break;
    }
}
