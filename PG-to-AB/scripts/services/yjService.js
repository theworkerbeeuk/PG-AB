'use strict';

angular.module('yellowJacketApp')
    .service('yjService', function Yjservice(unityService, cryptoService, $rootScope, $q, storage, $http, $timeout) {

    var yjs = {};

    yjs.replaceOdd = function(str) {
        if (str) {
            try {
                str = str.replace(/%/g, 'CONST_PERCENTAGE');
                str = str.replace(/#/g, 'CONST_HASH');
                str = str.replace(/&/g, 'CONST_AMPERSAND');
                str = str.replace(/=/g, 'CONST_EQUALS');
                str = str.replace(/'/g, 'CONSTQUOTE');
                str = str.replace(/"/g, 'CONSTDOUBLEQUOTE');
                str = str.replace(/\\/g, 'CONSTBACKSLASH');
                
                // allow set filter
                var filterSet="";
                angular.forEach(str, function(cx, i) {
                    var c = str.charCodeAt(i);
                    if (c > 31 && c < 166 || c == 10 || c == 13 || c == 9) {
                        filterSet += cx;
                    }
                });
                str = filterSet;
            }
            catch(e) {
                return str;
            }
        }
        return str;
    }
        
    var netprefs; 
    var haveNet = function() {
        if ($rootScope.isDevice) {
            var networkState= checkConnection(); // checking here <-- device has to be ready before we do this. 
            $rootScope.haveWifi = isBroadband(networkState);
            $rootScope.haveG3 = isMobile(networkState);
            
            if (!netprefs) netprefs = loadObject("netprefs");
            if (netprefs) {
                if (netprefs.wifi && $rootScope.haveWifi) {
                }
                else if (netprefs.g3 && $rootScope.haveG3) {
                }
                else { // panga
                    return false;
                }
            } else {
                if($rootScope.haveG3 || $rootScope.haveWifi) {
                } else {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    
  
    
    var synchPending;
    var syncPromise;
    var syncUpdate = function() {
        console.log("PING--------------------------------------->");
        var p;
        if ($rootScope.enableBackground) {
            console.log("... background enabled - synching");
            p = yjs.synchroniseWithUnity(); 
        } else {
            console.log("... background DISABLED - synch ignored");
            var def = $q.defer();
            def.resolve(1);
            p = def.promise;
        }
        
        p.then(function() {
            if (!synchPending) { // only do if we are not already doing it
                synchPending = true;
                syncPromise = $timeout(function() {
                    synchPending =false;
                    if ($rootScope.loggedIn) {
                        $rootScope.backg(true);
                        syncUpdate();
                    }
                }, $rootScope.config.syncInterval);
            }
        })
    }
    
    var syncPromise2;
    yjs.uploadData = function() {
        $rootScope.getGenericMeta()
        .then(function () {
          return $rootScope.getUserWorkLoad();
        })
        .then(function() {
            return $rootScope.getUserMeta(); // download actions etc
        })
        .then(function() {
            
            if ($rootScope.config.autoSync) {
                if (!synchPending) { // only do if we are not already doing it
                    synchPending =true;
                    syncPromise2 = $timeout(function() {
                        synchPending = false;
                        if ($rootScope.loggedIn) {
                            $rootScope.backg(true);
                            syncUpdate();
                        }
                    }, $rootScope.config.syncInterval)
                }
            }
            else {
                $rootScope.loading = "Sending...";
                $rootScope.loadingLarge = true; // location data
                $rootScope.backg(false);
                yjs.synchroniseWithUnity(true).then(function() {
                    $rootScope.loading = null;
                    $rootScope.loadingLarge = null; // location data
                    $rootScope.backg(true);
                    
                }); // nometa
            }
        })
        
    }
    
    
    yjs.cancelPendingSync = function() {
        if (syncPromise) $timeout.cancel(syncPromise);    
        if (syncPromise2) $timeout.cancel(syncPromise2);    
        synchPending = false;
    }
    
    yjs.queueItems = function(qname, item) {
        var def = $q.defer();
        
        storage.load(qname).then(function(qa) {
            console.log("Load  " + qname);
            // convert to object
            var q;
            try {
                q = angular.fromJson(qa);
            }
            catch (e) {}
            if (!q || !$.isArray(q)) q = [];
            
            
            if (item.txTokenId) {
                console.log("++++++++++++++++++ Saving item with txid " + item.txTokenId);
            }
            // does the item already exist?
            
            var already = false;
            angular.forEach(q, function(qitem) {
                if (!already && item.txTokenId && qitem.txTokenId && item.txTokenId == qitem.txTokenId) {
                    already = true;
                }
            });
            if (already) {
                def.resolve(1)
            }
            else {
                if (q.indexOf(item) == -1) 
                    q.push(item);
                // back to json
                var sa = angular.toJson(q);
                console.log(q.length + ", save que " + qname);
                storage.save(qname, sa).then(function() {
                    def.resolve(1);
                })
            }
            
        })
        
        return def.promise;
   }
   

    var sendkind = "";

    var sequentialSend = function(list, failedList, fn, ix, deff) {
        if (!$rootScope.loadingLarge) {
          $rootScope.loading = (ix+1) + " sending " + sendkind;
        }
        var def;
        def = deff ? deff : $q.defer();
        
        if (!list || ix >= list.length) {
            if (!$rootScope.loadingLarge) {
              $rootScope.loading = null;
            }
            
            $timeout(function() {def.resolve(1)}, 100); // prevent race condition which was remove audt from inps list
            return def.promise;
        }
        
        var obj = list[ix];
        var noq= true;
        fn.call(undefined, obj, noq).then(function(os) {
            if (os == -1) {
                failedList.push(obj);
            }
            sequentialSend(list, failedList, fn, ++ix, def);
        })
        
        
        return def.promise;
    }
    
    var inSync;
    var haveData;
    yjs.synchroniseWithUnity = function(nometa) {
        var fdef = $q.defer();

        var isNet = haveNet();
        
        if (!$rootScope.loggedIn || inSync) {
            if (inSync) {
                console.log( new Date() + ": already in synch !!!! ");
            }
            
            fdef.resolve(1);
            return fdef.promise;
        }

        if (!$rootScope.loggedIn || inSync) {
            if (inSync) {
                console.log( new Date() + ": already in synch !!!! ");
            }
            
            fdef.resolve(1);
            return fdef.promise;
        }
        
        inSync = true;
        $rootScope.syncing=true;
        console.log( new Date() + ": sync with unity ");
        var up;
        if (!nometa) {
            up = $rootScope.updateMeta();
        }
        else {
            var updef = $q.defer();
            updef.resolve(1);
            up = updef.promise;
        }
        
        haveData = 0;
        up.then(function() {
            return storage.load("queueObservation");
        })
        .then(function(qa) {
            var def =$q.defer();
            
            
            var q=[];
            try {
                q = angular.fromJson(qa);
                console.log("************ Load q " + q.length);
            }
            catch (e) { q = []; }
            var nq = [];
            
            if (!isNet) {
                if (q)
                    haveData += q.length;
                def.resolve(1);
                return def.promise;
            }
            
            sendkind = "observation";
            sequentialSend(q, nq, yjs.sendObservation, 0).then(function(v) {
                haveData += nq.length;
                console.log("*********** 1111  havdata " + haveData + ", Obs Q sent ", nq);
                var sa = angular.toJson(nq);
                storage.save("queueObservation", sa).then(function() {
                    def.resolve(1);
                })
            });
            return def.promise;
        })
        .then(function() {
          return storage.load("queueActionUpd");
        })
        .then(function(qa) {
//            console.log("--- sync update action ", qa);
            var def =$q.defer();
            var q=[];
            try {
                q = angular.fromJson(qa);
            }
            catch (e) { q = []; }
            
            if (!isNet) {
                if (q)
                    haveData += q.length;
                def.resolve(1);
                return def.promise;
            }

            var nq = [];
            sendkind = "update action";
//            console.log("+++ sync update action ", q);
            sequentialSend(q, nq, yjs.sendActionUpdate, 0).then(function(v) {
                haveData += nq.length;
                console.log("222  havdata " + haveData + ", ActionUp Q sent ", nq);
                var sa = angular.toJson(nq);
                storage.save("queueActionUpd", sa).then(function() {
                    def.resolve(1);
                })
            });
            return def.promise;
        })      
        .then(function() {
          return storage.load("queueAuditInsp");
        })
        .then(function(qa) {
            var def =$q.defer();
            var q=[];
            try {
                q = angular.fromJson(qa);
                console.log("Load aud/insp", q);
            }
            catch (e) { q = []; }

            var nq = [];
            
            if (!isNet) {
                if (q)
                    haveData += q.length;
                yjs.checkOffline(haveData);
                def.resolve(haveData);
                
                inSync = false;
                $rootScope.syncing=false;
                fdef.resolve(1);
                return def.promise;
            }
            
            sendkind = "audit/insp";
            sequentialSend(q, nq, yjs.finishAudit, 0).then(function(v) {
                haveData += nq.length;
                console.log("333  havdata " + haveData +", q not sent ", nq);
                var sa = angular.toJson(nq);
                storage.save("queueAuditInsp", sa).then(function() {
                    yjs.checkOffline(haveData);
                    def.resolve(haveData);
                    
                    inSync = false;
                    $rootScope.syncing=false;
                    fdef.resolve(1);
                })

            });
            return def.promise;
        })     
        
        
        return fdef.promise;
    }

                     
    yjs.checkOffline = function(haveData) {
       $rootScope.isOffline = 0;
       if (haveData > 0) { // we have data do we have preferred connectivity
            var netprefs = loadObject("netprefs");
           
            if (!netprefs) 
                $rootScope.isOffline = haveData;
            else if (netprefs.wifi && $rootScope.haveWifi) {
                // online                
            }
            else if (netprefs.g3 && $rootScope.haveG3) {
                // online
            }
           else {
               // offinline
               $rootScope.isOffline = haveData;
           }
       }
        
    }
    
    yjs.txid = function(o) {
        
        if (o && o.txTokenId) {
            return o.txTokenId;
        }
        
        var d = new Date();
        if (!$rootScope.deviceid) {
            $rootScope.deviceid = loadObject("deviceid");
        }        
        
        if (o) {
            o.txTokenId = $rootScope.deviceid + d.getTime();     
            return o.txTokenId;
        }
        
        return  $rootScope.deviceid + d.getTime();
    }
    
    var sent = function(s) {
       if (!$rootScope.sentArray) {
           $rootScope.sentArray = [];
       }
       $rootScope.sentArray.push(new Date() + ": " + s);
       if ( $rootScope.sentArray.length > 40)  $rootScope.sentArray.splice(0,1);
    }
    
    var sendPicture = function(p) {
        var def = $q.defer();
        
        storage.load(p.picture.orgSrc).then(function(dataurl) {
            
            var un, pwd;
            if ($rootScope.uname) un = $rootScope.uname;
            else {
                $rootScope.yju = loadObject("user");
                $rootScope.uname = $rootScope.yju.userId;
                un = $rootScope.uname;
            }
            if ($rootScope.pword) pwd = $rootScope.pword;
            else {
                $rootScope.pword = loadObject("userpwd");
                pwd = $rootScope.pword;
            }
            if (dataurl) {
                 var l = dataurl.length;
                if (l > 32)
                    console.log(l+", img: " + dataurl.substring(l-32));


                var fd = new FormData();
                fd.append("username", un);
                fd.append("password", pwd);
                fd.append("photoId", p.id);
                fd.append("photoName", p.name); //obs
                fd.append("type", p.type); // "observ"

                fd.append("imgFile", dataurl); 

                $http.post($rootScope.config.target+"/UploadServlet", fd, {
                        withCredentials: false,
                        timeout: $rootScope.config.requestTimeout,
                        headers: {'Content-Type': undefined },
                        transformRequest: angular.identity
                })
                .success( function(d) {
                    console.log("UploadServlet " + angular.toJson(d));
                    dataurl = null;
                    storage.del(p.picture.orgSrc).then(function() {
                        def.resolve(p.id);
                    });
                }) 
                .error( function(d,a,b) {
                    console.log("Failed to send picture " + d);
                    def.resolve(null);
                    dataurl = null;
                });

                return def.promise;
            }
            else {
                def.resolve(p.id); // if not there assume sent
                return def.promise;
            }
            
        
            /// device specific 
            var win = function (r) {
                //console.log("Code = " + r.responseCode);
                //console.log("Response = " + r.response);
                console.log("ok Sent = " + r.bytesSent);
                def.resolve(1);
            }

            var fail = function (error) {
                //alert("An error has occurred: Code = " + error.code);
                console.log("upload error source " + error.source);
                console.log("upload error target " + error.target);
                def.resolve(0);
            }

            var name = p.picture.capturedSrc; //"CapturedImagesCache/WP_20140409_181.jpg";
            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.fileName = name;
            options.mimeType = "image/jpeg";

            var params = {};
            params.username = un;
            params.password = pwd;
            params.photoId = p.id;
            params.photoName = p.name; //obs
            params.type = p.type; // "observ"
            options.params = params;

            var ft = new FileTransfer();
            ft.upload(name, encodeURI($rootScope.config.target + "/UploadServlet"), win, fail,     options);
 
       
        })
            
        return def.promise;
    }
    
    var seqActionPhoto = function(ap, ix, def) {
        if (ix >= ap.length) {
            def.resolve(1);
            return;
        }
        
       //  var ap = { observation: os, action : a.id, photo: ph };
        
        var apx = ap[ix];
        var ph = apx.photo;
        var os = apx.observation;
        var p = {};
        // should really wait on promise of send picture above -- later
        p.photoDescription = "yjmobile";
        p.photoName=ph.name;
        p.commissionID = os.commissionId;
        p.entityID= apx.action; // action id
        p.moduleID="2";  // 1 - obser, 2 = actions, 3 = incidents, 4 = audits, 5 = inspectcions, 6 - third
        p.userID = os.userId;
        p.organisationID = os.responsibleOrganisationId;
        p.xPosition = ph.picture.x; 
        p.yPosition = ph.picture.y;

        var request =
            "/services/rest/observationservice/transferImage?id="+ph.id+
            "&type="+ph.type + "&photo="+angular.toJson(p)+"&ext="+ph.picture.ext+"&len=0";
//        console.log("req " + request);
        unityService.fetch(request)
        .done(function (data) {
           console.log("Return " + angular.toJson(data));
           seqActionPhoto(ap, ++ix, def);
        }) 
        .error(function (data) {
           console.log("failed " + angular.toJson(data));
           def.resolve(-1);
        }); 
    }
    
    var txActionPhoto = function(ap) {
        var def = $q.defer();
        if (!ap || ap.length < 1) {
            def.resolve(1);
            return def.promise;   
        }
         
        //var ap = { observation: os, action : a, photo: ph };
        
        seqActionPhoto(ap, 0, def);
        
        return def.promise;
    }
    
    var seqObsPhoto = function(os, photos, ix, def) {
        if (ix >= photos.length) {
            def.resolve(ix);
            return;
        }
        
        var ph = photos[ix];
        var p = {};
        p.photoDescription = "yjmobile";
        p.photoName=ph.name;
        p.commissionID = os.commissionId;
        p.entityID=os.id; // observation id
        p.moduleID="1";  // 1 - obser, 2 = actions, 3 = incidents, 4 = audits, 5 = inspectcions, 6 - third
        p.userID = os.userId;
        p.organisationID = os.responsibleOrganisationId;
        p.xPosition=ph.picture.x;
        p.yPosition=ph.picture.y;

        console.log("**** Send ob photo " + ph.id );
        var request =
            "/services/rest/observationservice/transferImage?id="+ph.id+
            "&type="+ph.type + "&photo="+angular.toJson(p)+"&ext="+ph.picture.ext+"&len=0";
        unityService.fetch(request)
        .done(function (data) {
            console.log("Return " + angular.toJson(data));
            if (data.res == "no file found") {
                //alert(angular.toJson("Image transfer request failed: " + ph.id));
                console.log(angular.toJson("Image transfer request failed: " + ph.id));
            }
            seqObsPhoto(os, photos, ++ix, def);
        })
        .error(function(da) {
            def.resolve(-1);
        });        
    }
    
    var txObsPhoto = function(os, photos) {
        var def = $q.defer();
        if (!photos || photos.length < 1) {
            def.resolve(1);
            return def.promise;   
        }
        seqObsPhoto(os, photos, 0, def);
        return def.promise;
    }
    
    var formAction4Unity = function(o) { // o = observation

        var un = $rootScope.yju.userId;

        var al = [];
        angular.forEach(o.actions, function(a) {
            var ua={};
            ua.username = un;
            ua.actionSummary = a.detail;
            ua.actionSummary = yjs.replaceOdd(ua.actionSummary);

            ua.actionTypeId = a.type.id;
            ua.actionTypeName = yjs.replaceOdd(a.type.name);
            ua.riskRatingId = a.risk.id;
            ua.responsibleOrganisationId = a.organisation.organisationId;
            a.organisation.organisationUsers = null;
            ua.assignedUserId = a.owner.userId;
            ua.commissionId = o.cid;
            if (a.id) {
                ua.actionId = a.id;
            }
            if (a.observationId) ua.observationId = a.observationId;
            if (a.actionTaken) ua.actionTaken = yjs.replaceOdd(a.actionTaken);

            al.push(ua);
        });
        return al;
    }                     
     

    
    yjs.sendObservation = function(observation, noq) {
        var def = $q.defer();
        
        try {
            var o = observation;
            if (!o.cid) {
                def.resolve(null);
                return def.promise;
            }
            
            //console.log("floor " + angular.toJson(o.selectedfloor));
            
            var os = {};
            if (!$rootScope.yju)
                $rootScope.yju = loadObject("user");
            
            os.txTokenId = yjs.txid(observation);
            os.userId =  $rootScope.yju.id;
            os.username = $rootScope.yju.userId;
            os.commissionId	= o.cid;
            os.performanceCategoryId = o.situation.id;
            os.observationCategoryId = o.cat.id;
            os.observationTypeId = o.type.id;
            os.responsibleOrganisationId = o.resporg.organisationId;
            os.description = yjs.replaceOdd(o.summary);
            os.location = yjs.replaceOdd(o.locdesc);
            if (o.selectedfloor) {
                os.locationFloorPlanId	= o.selectedfloor.floorPlanId;
                if (o.selectedfloor.x)
                    os.locationCoordinates	= o.selectedfloor.x + "," + o.selectedfloor.y;
            }
            os.actions = formAction4Unity(o);
            var js = angular.toJson(os);
            js = js.replace(/&/g,'|');
            js = js.replace(/#/g,'~');        
            var request = "/services/rest/observationservice/saveObserationDetails?q=" + js + ".json";
    
            unityService.fetch(request)
            .done(function (data) {
                console.log("Return " + angular.toJson(data));
                if (data && data.observationId) {
                  $rootScope.lastOid = data.observationId;
                    
                  sent("oid " +  data.observationId + ", cid " + o.cid);
                    
                  if ($rootScope.lastOid == -1) 
                  {
                      alert("Server rejected observation");
                      def.resolve(-1);
                  }
                  else 
                  {
                    var p = [];
                    var i = 0;
                    // send all obs, action photos. one by one using defers
                    var picarray = [];
                    angular.forEach(o.photos, function(ph) {
                        picarray.push(ph);
                        
                    });
                      
                    angular.forEach(o.actions, function(a) {
                          angular.forEach(a.photos, function(ph) {
                               if (ph && ph.picture) 
                                    picarray.push(ph);
                          });
                    });
                      
                    var sendpic = function(a, n, sdef) { // send one by one
                        if (!sdef) sdef = $q.defer();
                        if (n >= a.length) { 
                            console.log("Sending done " + n);
                            sdef.resolve(1); 
                            return sdef.promise;// nuts 
                        }
                        console.log("************** Sending " + n +", " + angular.toJson(a[n]));
                        sendPicture(a[n]).then(function(z) {
                            if (!z) {
                                console.log("xxxxxxxxxxxx  Could not transfer picture " +  a.id);
                                if (noq) def.resolve(-1)
                                else
                                    yjs.queueItems("queueObservation", observation).then(function() {
                                        def.resolve(-1);
                                    })
                                
                                return def.promise;
                            }
                            else {
                                sendpic(a, ++n, sdef);
                            }
                        });
                        
                        return sdef.promise;
                    }
                    
                    if (picarray.length > 0)
                        p[i] = sendpic(picarray, 0);
                    
                    // Ok we must wait for the images to reach unity before we tell it to send it to yj
                    $q.all(p).then(function(s) { // what if no images...SEEMS TO WORK
                        // yup all observ and action images sent.
                        // check 
                        os.id = data.observationId;
                        //os.actions = data.userActions; // replace -- different bean aargh
                        
                        txObsPhoto(os, o.photos)
                        .then(function(v) {
                            
                            if (v == -1) {
                                if (noq) def.resolve(-1)
                                else
                                    yjs.queueItems("queueObservation", observation).then(function() {
                                        def.resolve(-1);
                                    })
                                
                                return def.promise;
                            }
                            
                            var i=0;
                            var actionsPh = [];
                            angular.forEach(o.actions, function(a) {
                                //console.log("a->" + angular.toJson(a));
                                try {
                                    var ua = data.userActions[i++]; // action ids received from server // matching hre !!!!!!!!!CHECK
                                    a.id = ua.actionId;
                                    sent("aid " + a.id + ", cid " + o.cid);
                                    a.observationId = os.id;
                                    a.actionTaken=" ";
                                    
                                    angular.forEach(a.photos, function(ph) {
                                        //console.log("-> " + angular.toJson(ph));
                                        var ap = { observation: os, action : a.id, photo: ph };
                                        if (ph && ph.picture) 
                                            actionsPh.push(ap);
                                    });

                                }
                                catch(e) {
                                    alert("error action " + a.id);
                                }
                            }); 

                            txActionPhoto(actionsPh).then(function(va) {
                                if (va == -1) {
                                    if (noq) def.resolve(-1)
                                    else
                                        yjs.queueItems("queueObservation", observation).then(function() {
                                            def.resolve(-1);
                                        })

                                    return def.promise;
                                }
                                // for audits
                                os.actions = null; 
                                def.resolve(os);
                            })
                        })
                    }); // q for promise
                  }
                }
                else  {
                    console.log("Failed to post observation " + angular.toJson(data));
                    def.resolve(-1);
                }
            })
            .error(function (e) {
                 console.log("Error: failed to post observation " + angular.toJson(e));
                // ? no connection?
                if (noq) def.resolve(-1)
                else
                    yjs.queueItems("queueObservation", observation).then(function() {
                        def.resolve(-1);
                    })
            })
        }
        catch(ex) {
            console.log("Observation fault " + ex);
            if (noq) def.resolve(-1)
            else
                yjs.queueItems("queueObservation", observation).then(function() {
                    def.resolve(-1);
                })
        }
        
        return def.promise;
    };

                
                     
    yjs.txActionUpdatePhoto = function (id, a, ph) {

        var def = $q.defer();
        if (!$rootScope.yju)
            $rootScope.yju = loadObject("user");
        var userId = $rootScope.yju.id;
        var p = {};
        // should really wait on promise of send picture above -- later
        p.photoDescription = "yjmobile";
        p.photoName = ph.name;
        p.commissionID = a.commissionId;
        p.entityID = id; // action update id
        p.moduleID = "7"; // 1 - obser, 2 = actions, 3 = incidents, 4 = audits, 5 = inspectcions, 6 - third, 7 for action update
        p.userID = userId;
        p.organisationID = a.responsibleOrganisationId;
        p.xPosition = ph.picture.x;
        p.yPosition = ph.picture.y;

        var request =
            "/services/rest/observationservice/transferImage?id=" + ph.id +
            "&type=" + ph.type + "&photo=" + angular.toJson(p) + "&ext=" + ph.picture.ext + "&len=0";
//        console.log("req " + request);
        unityService.fetch(request)
            .done(function (data) {
            console.log("Return " + angular.toJson(data));
            def.resolve(true);
        })
            .error(function (data) {
            console.log("Return " + angular.toJson(data));
            def.resolve(-1);
        });

        return def.promise;
    }


    var transposeDate = function (dstr) {
        var ds = dstr.split("-");
        return ds[2] + "-" + ds[1] + "-" + ds[0];
    }

    yjs.sendActionUpdate = function (actionupd, noq) {
        
        var def = $q.defer();

        try {
            var a = actionupd;

            a.txTokenId = yjs.txid(a);
            
            console.log("Actionupd",actionupd);
            var as = jQuery.extend(true, {}, a);
            // set as null and update for reassigned types if present
            if (!$rootScope.yju)
                $rootScope.yju = loadObject("user");
            var id = $rootScope.yju.id;
            as.username = $rootScope.yju.userId;
            as.organisationId = a.orgId;
            as.modifiedByUserId = id;
            as.createdByUserId = id;
            as.dateCreated = transposeDate(a.dateCreated);
            as.raisedOnDate = transposeDate(a.raisedOnDate);
            as.dueDate = transposeDate(a.dueDate);

            if (as.actionSummary) 
                as.actionSummary = yjs.replaceOdd(as.actionSummary);
            
            if (!as.actionTaken) as.actionTaken=' ';
            else {
                var at = as.actionTaken;
                as.actionTaken = yjs.replaceOdd(at);
            }

            var photos = as.photos.slice(0); // copy
            var actState = {};

            try {
                delete as.picture; 
            }
            catch (ex) {}

            actState.actionId = a.actionId;
            actState.actionStateId = a.actionStateId;
            actState.createdBy = a.userId;
            //as.actionStateDetailId.photos = [];

            // set up details specific to the type of action update being created
            // closed: as: 5
            // 1 - pending
            // 2 - in prog
            // 3 - resolved
            // 4 - rejected
            // 5 - closed
            if (actionupd.state == "reassign") {
                as.reassignedOrgId = a.reassignedOrgId;
                as.reassignedUserId = a.reassignedUserId;
                actState.assignedToUserId = a.reassignedUserId;
            } else {
                actState.assignedToUserId = a.userId;
            }

            as.actionStateDetails = [actState];

            // remove state as its a temp field not for the server
            delete actionupd.state;
            delete as.state;

            //as.photos = []; // clear otherwise services doesn't not work

            var json = angular.toJson(as);

            var ix = json.indexOf('"photos":[');
            if (ix > -1) {
                var snip = json.substring(ix);
                var jx = snip.indexOf("],");
                var snipRest = snip.substring(jx);
                json = json.substr(0, ix+10) + snipRest; // remove photos;
            }

            var request =
                "/services/rest/actionservice/updateUserAction?q=" + json + ".json";
            unityService.fetch(request)
            .done(function (data) {
                console.log(">>>>>>> Return ",data);

                // unity should return action record id then we should be able to send our images...
                var updid = data.actionStateDetailId; //?? grab from response

                sent("oid " + a.observationId + ", aid " + a.actionId + ", updid " + updid + ", cid " + a.commissionId);
                var p = [];
                var i = 0;


                var sendpic = function(a, n, sdef) { // send one by one
                    if (!sdef) sdef = $q.defer();
                    if (n >= a.length) { 
                        console.log("Sending done " + n);
                        sdef.resolve(1); 
                        return sdef.promise;// nuts 
                    }
                    console.log("______ Sending " + n +", "+angular.toJson(a[n]));
                    sendPicture(a[n]).then(function(z) {
                        if (!z) {
                            console.log("xxxxxxxxxxxx  Could not transfer picture " +  a.id);
                            if (noq) def.resolve(-1)
                            else
                                yjs.queueItems("queueActionUpd", actionupd).then(function() {
                                    def.resolve(-1);
                                })

                            return def.promise;
                        }
                        else {
                            sendpic(a, ++n, sdef);
                        }
                    });

                    return sdef.promise;
                }

                if (photos.length > 0)
                    p[i] = sendpic(photos, 0);

                $q.all(p).then(function (s) { // pictures all sent to unity..

                    if (!updid || updid == 0) {
                        alert(a.actionId +': no action state id returned by server');
                        def.resolve('action update');
                    } else {
                        var pp = [];
                        i = 0;

                        var txpic = function(updid, a, p, n, sdef) { // send one by one
                            if (!sdef) sdef = $q.defer();
                            if (n >= p.length) { 
                                console.log("action update tx sending done ");
                                sdef.resolve(1); 
                                return sdef.promise;// nuts 
                            }
                            console.log("Sending " + n +", "+angular.toJson(p[n]));
                            yjs.txActionUpdatePhoto(updid, a, p[n]).then(function(v) {
                                if (v == -1) {
                                    if (noq) def.resolve(-1)
                                    else
                                        yjs.queueItems("queueActionUpd", actionupd).then(function() {
                                            def.resolve(-1);
                                        })

                                    return def.promise;
                                }
                                txpic(updid, a, p, ++n, sdef);
                            });

                            return sdef.promise;
                        }

                        if (photos.length > 0)
                             pp[i] = txpic(updid, a, photos, 0);

                        $q.all(pp).then(function() {
                            def.resolve('action update'); 
                        })
                    }
                });

            })
            .error(function (d) {
                if (noq) def.resolve(-1);
                else {
                    yjs.queueItems("queueActionUpd", actionupd).then(function() {
                        def.resolve(-1);
                    })
                }
            });
        }
        catch(ex) {
            if (noq) def.resolve(-1);
            else {
                yjs.queueItems("queueActionUpd", actionupd).then(function() {
                    def.resolve(-1);
                })
            }
            //alert('Action update fault: '+ex);
        }

        return def.promise;

    };

        
        
        
        
        
    /////////////////////////////////////////////
    // audits & inspections - send completed Audits/inspections to YJ 
    ////////////////////////////////////////////

    yjs.completeInspection = function(_audinsp, noq) {
        
        var def = $q.defer();
        var sa = {};
        if (!$rootScope.yju)
            $rootScope.yju = loadObject("user");
        sa.txTokenId = yjs.txid(_audinsp);
        sa.username = $rootScope.yju.userId;
        sa.inspectionId = _audinsp.id;
        sa.dueDate = _audinsp.dueDate;
        sa.recurrenceFrequency = _audinsp.recurrenceFrequency;
        sa.inspectionTypeId = _audinsp.typeId;
        sa.commissionId = _audinsp.commission.id;
        sa.inspectedContactId = _audinsp.contactId; // whats the difference? needs to be a number not userId
        sa.inspectingContactId = $rootScope.yju.id;
        sa.actualInspectionDate = $rootScope.dateString(); // ui-steria.js    
        sa.additionalInformation = _audinsp.additionalInformation
        sa.inspectedOrganisationId = _audinsp.organisationId; // whats the diff - this is the org being audited
        sa.inspectingOrganisationId = $rootScope.yju.organisation.id; // and this.... is the org carrying out the audit
        sa.recurringUntil = _audinsp.recurringUntil;
        
        // recurrung until in wrong order from unity - reverse it.
        if (sa.recurringUntil && sa.recurringUntil.indexOf("-") == 2) {
            sa.recurringUntil = $rootScope.revDate(sa.recurringUntil);
        }
        // note important these fields (isClosed/isDraft) are set as they indicate the audit can be published
        sa.isClosed = "false";
        sa.isDraft = "false";
        sa.inspectionCategoryId = _audinsp.categoryId;
        sa.recurrenceFrom = _audinsp.recurrenceFrom;
        
        sa.createdBy = $rootScope.yju.id;
        sa.dateCreated = _audinsp.dateCreated ? _audinsp.dateCreated : $rootScope.dateString();
        sa.modifiedBy = _audinsp.modifiedBy;
        sa.dateModified = _audinsp.dateModified;
        sa.resultsCreatedById = $rootScope.yju.id;
        sa.createdByOrganisationId = $rootScope.yju.organisation.id;
        sa.inspectionResults = [];
        
        
        angular.forEach(_audinsp.selectedQHs, function (qh) {
            var questions = qh.questions;
            angular.forEach(questions, function (q) {
                q.comment = yjs.replaceOdd(q.comment);
                
                var ar = {
                    "inspectionResultsId": _audinsp.resultsMap[q.id.toString()],
                    "inspectionQuestionId": q.id,
                    "inspectionId": sa.auditId,
                    "comments": q.comment,
                    "createdBy": sa.createdBy,
                    "dateCreated": sa.dateCreated,
//                    "modifiedBy": "",
//                    "dateModified": "",
                    "username": sa.username,
                    "inspectionQuestion": {
                        "inspectionQuestionId": q.id,
                        "inspectionQuestionHeaderId": qh.id
                    }
                }
                
                if(q.observationClientList && q.observationClientList.length > 0)
                {
                    ar.inspectionQuestion.observationClientList = [];
                    angular.forEach(q.observationClientList, function(observation){
                        
                        var clone = jQuery.extend(true, {}, observation);
                        if (clone.situation) delete clone.situation;

                        clone.createdBy = sa.createdBy;
                        clone.createdDateTime = new Date(); 
                        
                        ar.inspectionQuestion.observationClientList.push(clone);
                    });
                }

                ar.isApplicable = (q.satisfaction != "X");
                ar.isSatisfactory = (q.satisfaction == "Y");
                ar.inspectionRatingId = q.rating;
                sa.inspectionResults.push(ar);

            })
        });


        console.log("XXXXXXXXXXXX  completed inspection to post ", sa);

        var cm = _audinsp.commission.title;
        var request = "/services/rest/inspectionquestionsetservice/save?q=" + angular.toJson(sa) + ".json";
        unityService.fetch(request)
        .done(function (data) {

            console.log("Returned ", data);
            if (data) {
                $rootScope.lastAudinsp = data.inspectionId;
       
                sent("Inspection id " + $rootScope.lastAudinsp + ",  com " + cm + ", cid " + 
                     _audinsp.commission.id);
                // remove from list
                
                if ($rootScope.insplist[cm]) {
                    var ix = $rootScope.insplist[cm].indexOf(_audinsp);
                    if (ix != -1) {
                        $rootScope.insplist[cm].splice(ix, 1);
                        storage.save("insplist", angular.toJson($rootScope.insplist));
                    }
                }
                
                
            }
            def.resolve(data.inspectionId);
        })
        .error(function (data) {
            console.log("Error posting audit " + data);
            if (noq) def.resolve(-1) 
            else {
                yjs.queueItems("queueAuditInsp", _audinsp).then(function() {
                    if ($rootScope.insplist[cm]) {
                        var ix = $rootScope.insplist[cm].indexOf(_audinsp);
                        if (ix != -1) {
                            $rootScope.insplist[cm].splice(ix, 1);
                            storage.save("insplist", angular.toJson($rootScope.insplist));
                        }
                    }
                    def.resolve(-1);
                })
            }
        })
        return def.promise;
    }

            
        
   yjs.saveInspection = function (_audinsp, noq) {
        var def = $q.defer();
        var sa = {};
        if (!$rootScope.yju)
            $rootScope.yju = loadObject("user");
        sa.username = $rootScope.yju.userId;
        sa.txTokenId = yjs.txid(_audinsp);
       
        sa.inspectionId = _audinsp.id ? _audinsp.id : "-1";
        if (_audinsp.dueDate) {
            sa.dueDate = _audinsp.dueDate;
        } else {
            sa.dueDate = $rootScope.dateString();
            _audinsp.dueDate = sa.dueDate;
        }
        sa.recurrenceFrequency = _audinsp.recurrenceFrequency;
        sa.inspectionTypeId =_audinsp.typeId;
        sa.commissionId = _audinsp.commission.id;
        sa.inspectedContactId = _audinsp.contactId; // whats the difference? needs to be a number not userId
        sa.inspectingContactId = $rootScope.yju.id;
        sa.actualInspectionDate = $rootScope.dateString(); // ui-steria.js 
        sa.inspectedOrganisationId = _audinsp.organisationId; // whats the diff - this is the org being audited
        sa.inspectingOrganisationId = $rootScope.yju.organisation.id; // and this.... is the org carrying out the audit
        sa.recurringUntil = _audinsp.recurringUntil;
        sa.isClosed = "false";
        sa.isDraft = "true";
        sa.inspectionCategoryId = _audinsp.categoryId;
        sa.recurrenceFrom = _audinsp.recurrenceFrom;
        sa.createdBy = $rootScope.yju.id;
        sa.dateCreated = _audinsp.dateCreated ? _audinsp.dateCreated : $rootScope.dateString();
        sa.resultsCreatedById = $rootScope.yju.id;
        sa.createdByOrganisationId = $rootScope.yju.organisation.id;
        var cm = _audinsp.commission.title;
        sa.inspectionResults = [];
        angular.forEach(_audinsp.selectedQHs, function (qh) {
            var questions = qh.questions;
            angular.forEach(questions, function (q) {
                var ar = {
                    "inspectionResultsId": "-1",
                    "inspectionQuestionId": q.id,
                    "createdBy": sa.createdBy,
                    "dateCreated": sa.dateCreated,
                    "username": sa.username,
                    "inspectionQuestion": {
                        "inspectionQuestionId": q.id,
                        "inspectionQuestionHeaderId": qh.id,
                    }
                };

//                ar.isApplicable = true;
//                ar.isSatisfactory = true;
                sa.inspectionResults.push(ar);
            })
        });
        var inspectionId = -1;
        var sajson =  angular.toJson(sa);

        console.log(sajson.length + ": Isp req", sa);
        
        var request = "/services/rest/inspectionquestionsetservice/save?q=" + sajson + ".json";
        unityService.fetch(request)
            .done(function (data) {
                if (data) {
                    console.log("save inspection ", data);


                    inspectionId = data.inspectionId;
                    var resultsMap = {};
                    data.inspectionResults = $rootScope.makeArray(data.inspectionResults);
                    angular.forEach(data.inspectionResults, function (a) {
                        resultsMap[a.inspectionQuestionId.toString()] = a.inspectionResultsId;
                    })
                    _audinsp.resultsMap = resultsMap;
                    _audinsp.id = inspectionId;
                    _audinsp.dateCreated = data.dateCreated;


                    if (inspectionId < 1) {
                        alert("YJ service returned no inspection response");
                    }

                    console.log("*********** inspectionResults ",_audinsp);
                }

                def.resolve(inspectionId);
            })
            .error(function (data) {
                console.log("Error posting insp " + data);
                if (noq)  def.resolve(-1);
                else {
                    yjs.queueItems("queueAuditInsp", _audinsp).then(function() {
                        if ($rootScope.insplist[cm]) {
                            var ix = $rootScope.insplist[cm].indexOf(_audinsp);
                            if (ix != -1) {
                                $rootScope.insplist[cm].splice(ix, 1);
                                storage.save("insplist", angular.toJson($rootScope.insplist));
                            }
                        }
                        def.resolve(-1);
                    })
                }
            })


        return def.promise;
    };
        
    
    // recurring so that we wait for all promises to complete
    // do it one by one since we are potentially sending images
    yjs.sendObservations = function(questionsBuffer, questionIndex, observationIndex, deferral, noq)
    {
        deferral = deferral ? deferral : $q.defer();
        
        if(questionsBuffer.length > 0) {
            
            var obsList = questionsBuffer[questionIndex].observationClientList;
            var observation = obsList[observationIndex];

            yjs.sendObservation(observation, noq).then(function(os) {
                if (os == -1) 
                {
                    console.log("Failed to send obs ");
                    deferral.resolve(-1);
                    return deferral.promise;
                }
                else 
                {
                    console.log("Sent obs "+ os);
                    if (os) obsList[observationIndex] = os;

                    // Calculate the next observation to send
                    var upperObsIndex = obsList.length - 1;
                    var upperQuestionIndex = questionsBuffer.length  - 1;

                    observationIndex++;
                    if(observationIndex > upperObsIndex) 
                    {
                        observationIndex = 0;
                        questionIndex++;
                        if(questionIndex > upperQuestionIndex)
                        {
                            // We're done. Each observation of each question has been sent.
                            deferral.resolve(1);
                            return deferral.promise;
                        }
                    }

                    yjs.sendObservations(questionsBuffer, questionIndex, observationIndex, deferral, noq);
                }
            });
        
        } else deferral.resolve(1);
        
        return deferral.promise;
    }
    
    yjs.completeWithObs = function(_audinsp, noq) {
        // check questions for observationClient and save these -- would be set up in sataction.js
        //qh.questions[ix].observationClient = $rootScope.observation; // store for later
        var questionsBuffer = [];
        angular.forEach(_audinsp.selectedQHs, function (qh) {
             var questions = qh.questions;
             angular.forEach(questions, function (question) {
                 if (question.observationClientList && question.observationClientList.length > 0) {
                     questionsBuffer.push(question);
                 }
             })
        })

        var odef = $q.defer();
        var nq = true;
        yjs.sendObservations(questionsBuffer, 0, 0, null, nq).then(function(z) { 
            // this is a aud/insp which already holds observations/actions so noq is true
            // all observations sent..so complete
            if (z == -1) {
                odef.resolve(-2); // failed to save
                return odef.promise;
            }
            else {
                _audinsp.txTokenId = null;
                yjs.completeAudit(_audinsp, noq).then(function(id) {
                    odef.resolve(id);
                })
            }
        });
        
        return odef.promise;
    }
    
        
    yjs.finishAudit = function(_audinsp, noq) {
        var def = $q.defer();
        if (_audinsp.auditId == "-1") {
            try {
                yjs.saveAudit(_audinsp).then(function(sid) {
                    if (sid != -1) {
                        yjs.completeWithObs(_audinsp, noq).then(function(id) {
                            console.log("Complete Obs with saveaudit " + id);
                            if (id == -2) { // failed to send observation etc
                                if (noq) def.resolve(-1);
                                else {
                                    console.log("Finised audit failed ------------- save ");
                                    var cm = _audinsp.commission.title;
                                    if (_audinsp.isInspection) {
                                         yjs.queueItems("queueAuditInsp", _audinsp).then(function() {
                                            if ($rootScope.insplist[cm]) {
                                                var ix = $rootScope.insplist[cm].indexOf(_audinsp);
                                                if (ix != -1) {
                                                    $rootScope.insplist[cm].splice(ix, 1);
                                                    storage.save("insplist", angular.toJson($rootScope.insplist));
                                                }
                                            }
                                            def.resolve(-1);
                                        })                                    
                                    }
                                    else {
                                        yjs.queueItems("queueAuditInsp", _audinsp).then(function() {
                                            if ($rootScope.audlist[cm]) { // may not be there
                                                var ix = $rootScope.audlist[cm].indexOf(_audinsp);
                                                if (ix != -1) { 
                                                    $rootScope.audlist[cm].splice(ix, 1);
                                                     storage.save("audlist", angular.toJson($rootScope.audlist));
                                                }
                                            }
                                           def.resolve(-1);
                                        })
                                    }
                                }
                            }
                            else
                                def.resolve(id);
                        })
                    }
                    else {
                        def.resolve(sid);
                    }
                });
            }
            catch(ex) {
                def.resolve(-1);
                console.log("Audit fault: " + ex);
            }
        }
        else {
            yjs.completeWithObs(_audinsp, noq).then(function(id) {
                console.log("Complete obs with completed audit " + id);
                if (id == -2) { // failed to send observation etc
                    if (noq) def.resolve(-1);
                    else {
                        console.log("Finised audit failed ------------- save ");
                        var cm = _audinsp.commission.title;
                        if (_audinsp.isInspection) {
                             yjs.queueItems("queueAuditInsp", _audinsp).then(function() {
                                if ($rootScope.insplist[cm]) {
                                    var ix = $rootScope.insplist[cm].indexOf(_audinsp);
                                    if (ix != -1) {
                                        $rootScope.insplist[cm].splice(ix, 1);
                                        storage.save("insplist", angular.toJson($rootScope.insplist));
                                    }
                                }
                                def.resolve(-1);
                            })                                    
                        }
                        else {
                            yjs.queueItems("queueAuditInsp", _audinsp).then(function() {
                                if ($rootScope.audlist[cm]) { // may not be there
                                    var ix = $rootScope.audlist[cm].indexOf(_audinsp);
                                    if (ix != -1) { 
                                        $rootScope.audlist[cm].splice(ix, 1);
                                         storage.save("audlist", angular.toJson($rootScope.audlist));
                                    }
                                }
                               def.resolve(-1);
                            })
                        }
                    }
                }
                else {
                    def.resolve(id);
                }
            })
        }
        
        return def.promise;

    }
    

    yjs.completeAudit = function (_audinsp, noq) {
        
        
        if (_audinsp.isInspection) {
            return yjs.completeInspection(_audinsp, noq);
        }
        
        var def = $q.defer();
        var sa = {};
        if (!$rootScope.yju)
            $rootScope.yju = loadObject("user");
        sa.txTokenId = yjs.txid(_audinsp);
        sa.username = $rootScope.yju.userId;
        sa.auditId = _audinsp.id;
        sa.dueDate = _audinsp.dueDate;
        sa.recurrenceFrequency = _audinsp.recurrenceFrequency;
        sa.auditTypeId = _audinsp.typeId;
        sa.commissionId = _audinsp.commission.id;
        sa.auditedContactId = _audinsp.contactId; // whats the difference? needs to be a number not userId
        sa.auditingContactId = $rootScope.yju.id;
        sa.actualAuditDate = $rootScope.dateString(); // ui-steria.js    
        sa.additionalInformation = _audinsp.additionalInformation;
        sa.auditedOrganisationId = _audinsp.organisationId; // whats the diff - this is the org being audited
        sa.auditingOrganisationId = $rootScope.yju.organisation.id; // and this.... is the org carrying out the audit
        sa.recurringUntil = _audinsp.recurringUntil;
        if (sa.recurringUntil && sa.recurringUntil.indexOf("-") == 2) {
            sa.recurringUntil = $rootScope.revDate(sa.recurringUntil);
        }

        // note important these fields (isClosed/isDraft) are set as they indicate the audit can be published
        sa.isClosed = "false";
        sa.isDraft = "true";
        sa.auditCategoryId = _audinsp.categoryId;
        sa.recurrenceFrom = _audinsp.recurrenceFrom;
        
        sa.createdBy = $rootScope.yju.id;
        sa.dateCreated = _audinsp.dateCreated ? _audinsp.dateCreated : $rootScope.dateString();
        sa.modifiedBy = _audinsp.modifiedBy;
        sa.dateModified = _audinsp.dateModified;
        sa.resultsCreatedById = $rootScope.yju.id;
        sa.createdByOrganisationId = $rootScope.yju.organisation.id;
        sa.auditResults = [];
        angular.forEach(_audinsp.selectedQHs, function (qh) {
            var questions = qh.questions;
//            console.log("yyyy   got to loop questions now = " + angular.toJson(qh.answeredQuestions));
            angular.forEach(questions, function (q) {
//                console.log("got to inner loop q = " + angular.toJson(q));
                q.comment = yjs.replaceOdd(q.comment);
                
                var ar = {
                    "auditResultsId": _audinsp.resultsMap[q.id.toString()],
                    "auditQuestionId": q.id,
                    "auditId": sa.auditId,
                    "comments": q.comment,
                    "createdBy": sa.createdBy,
                    "dateCreated": sa.dateCreated,
                    "username": sa.username,
                    "auditQuestion": {
                        "auditQuestionId": q.id,
                        "auditQuestionHeaderId": qh.id
                    }
                }
                
                if(q.observationClientList && q.observationClientList.length > 0)
                {
                    ar.auditQuestion.observationClientList = [];
                    angular.forEach(q.observationClientList, function(observation){
                        
                        var clone = jQuery.extend(true, {}, observation);
                        if (clone.situation) delete clone.situation;

                        clone.createdBy = sa.createdBy;
                        clone.createdDateTime = new Date(); 
                        
                        ar.auditQuestion.observationClientList.push(clone);
                    });
                }

                
                ar.isApplicable = (q.satisfaction != "X");
                ar.isSatisfactory = (q.satisfaction == "Y");
                ar.auditRatingId = q.rating;
                sa.auditResults.push(ar);

            })
        });


        console.log("Completed audi",sa);
        var cm = _audinsp.commission.title;
        var request = "/services/rest/auditquestionsetservice/save?q=" + angular.toJson(sa) + ".json";
        unityService.fetch(request)
        .done(function (data) {

            console.log("Return " + angular.toJson(data));
            if (data) {
                $rootScope.lastAudinsp = data.auditId;
                sent("Audit id " + $rootScope.lastAudinsp + ",  com " + cm + ", cid " + 
                     _audinsp.commission.id);
                
                if ($rootScope.audlist[cm]) {
                    var ix = $rootScope.audlist[cm].indexOf(_audinsp);
                    if (ix != -1) {
                        $rootScope.audlist[cm].splice(ix, 1);
                        storage.save("audlist", angular.toJson($rootScope.audlist)).then(function() {
                            def.resolve(data.auditId);
                        });
                    }
                    else 
                        def.resolve(data.auditId);
                }
                else
                    def.resolve(data.auditId);
            }
            else 
                def.resolve(data.auditId);
        })
        .error(function (data) {
            console.log("Error posting audit " + data);
            if (noq) def.resolve(-1);
            else {
                yjs.queueItems("queueAuditInsp", _audinsp).then(function() {
                    if ($rootScope.audlist[cm]) { // may not be there
                        var ix = $rootScope.audlist[cm].indexOf(_audinsp);
                        if (ix != -1) { 
                            $rootScope.audlist[cm].splice(ix, 1);
                             storage.save("audlist", angular.toJson($rootScope.audlist)).then(function() {
                                def.resolve(-1);
                             });
                        }
                        else 
                            def.resolve(-1);
                    }
                    else
                        def.resolve(-1);
                })
            }
        })
        return def.promise;
    }

    
    
    
    
    
    
    /////////////////////////////////////////////
    // audits & inspections - create audit/inspection
    ////////////////////////////////////////////
    yjs.saveAudit = function (_audinsp, noq) {
        if (_audinsp.isInspection) {
            return yjs.saveInspection(_audinsp, noq);
        }
        var def = $q.defer();
        var sa = {};
        if (!$rootScope.yju)
            $rootScope.yju = loadObject("user");
        sa.username = $rootScope.yju.userId;
        sa.txTokenId = yjs.txid(_audinsp);
        sa.auditId = _audinsp.id ? _audinsp.id : "-1";
        if (_audinsp.dueDate) {
            sa.dueDate = _audinsp.dueDate;
        } else {
            sa.dueDate = $rootScope.dateString();
            _audinsp.dueDate = sa.dueDate;
        }
        sa.recurrenceFrequency = _audinsp.recurrenceFrequency;
        sa.auditTypeId = _audinsp.typeId;
        sa.commissionId = _audinsp.commission.id;
        sa.auditedContactId = _audinsp.contactId; // whats the difference? needs to be a number not userId
        sa.auditingContactId = $rootScope.yju.id;
        sa.actualAuditDate = $rootScope.dateString(); // ui-steria.js 
        sa.auditedOrganisationId = _audinsp.organisationId; // whats the diff - this is the org being audited
        sa.auditingOrganisationId = $rootScope.yju.organisation.id; // and this.... is the org carrying out the audit
        sa.recurringUntil = _audinsp.recurringUntil;
        sa.isClosed = "false";
        sa.isDraft = "true";
        sa.auditCategoryId = _audinsp.categoryId;
        sa.recurrenceFrom = _audinsp.recurrenceFrom;
        sa.createdBy = $rootScope.yju.id;
        sa.dateCreated = _audinsp.dateCreated ? _audinsp.dateCreated : $rootScope.dateString();
        sa.resultsCreatedById = $rootScope.yju.id;
        sa.createdByOrganisationId = $rootScope.yju.organisation.id;
        var cm = _audinsp.commission.title;
        sa.auditResults = [];
        angular.forEach(_audinsp.selectedQHs, function (qh) {
            var questions = qh.questions; //questions
            angular.forEach(questions, function (q) {
//                console.log("loop q = ",q);
                var ar = {
                    "auditResultsId": "-1",
                    "auditQuestionId": q.id,
                    "createdBy": sa.createdBy,
                    "dateCreated": sa.dateCreated,
                    "username": sa.username,
                    "auditQuestion": {
                        "auditQuestionId": q.id,
                        "auditQuestionHeaderId": qh.id,
                    }
                };

                ar.isApplicable = true;
                ar.isSatisfactory = true;
                sa.auditResults.push(ar);
            })
        });
        var auditId = -1;
        var js = angular.toJson(sa);
        
        var request = "/services/rest/auditquestionsetservice/save?q=" + js + ".json";
        unityService.fetch(request)
        .done(function (data) {
            if (data) {
                console.log("save audit ", data);
                
                auditId = data.auditId;
                var resultsMap = {};
                data.auditResults = $rootScope.makeArray(data.auditResults);
                angular.forEach(data.auditResults, function (a) {
                    resultsMap[a.auditQuestionId.toString()] = a.auditResultsId;
                })
                _audinsp.resultsMap = resultsMap;
                _audinsp.id = auditId;
                _audinsp.dateCreated = data.dateCreated;
                
                if (auditId < 1) {
                    console.log("YJ service returned no audit/inspection response");
                }

                console.log("*********** auditResults ",_audinsp);
            }

            def.resolve(auditId);
        })
        .error(function (data) {
            console.log("Error posting audit " + data);
            if (noq) def.resolve(-1);
            else {
                yjs.queueItems("queueAuditInsp", _audinsp).then(function() {
                    var ix = $rootScope.audlist[cm].indexOf(_audinsp); // remove from inprogress?
                    if (ix != -1) $rootScope.audlist[cm].splice(ix, 1);
                    storage.save("audlist", angular.toJson($rootScope.audlist)).then(function() {
                        def.resolve(-1);
                    });
                })
            }
        })


        return def.promise;
    };


    ///////////////////////////////////////////////////////////////////////////////       
    // need to send message to server so user is set to deregistered in unity
    ///////////////////////////////////////////////////////////////////////////////
    yjs.sendDeregUser = function () {
        var du = {};
        du.userId = $rootScope.yju.userId;
        du.deviceId = null; // add device as well - where is it stored?
        var request =
            "/services/rest/service/sendDeregUser?q=" + angular.toJson(du) + ".json";
        unityService.fetch(request)
            .done(function (data) {
            console.log("Return " + data)
        })
            .error(function (data) {
            console.log("Error deregistering " + data);
        })
    };


    return yjs;
        
}) // end of the yJServer

