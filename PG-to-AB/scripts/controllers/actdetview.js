'use strict';

angular.module('yellowJacketApp')
.filter('actiontime', function () { // remove all spaces
    return function (item) {
        var ix = item.indexOf("T");
        if (ix > -1) {
            var it = item.substring(0, ix);
            var ds = it.split("-");

            var hhmm = item.substring(ix+1, ix+9);
            return ds[2] + "/" + ds[1] + "/" + ds[0].substring(2) + " " + hhmm;
        }
        return item;
    };
})
.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
})
    .controller('ActdetviewCtrl', function ($q, storage, $scope, $rootScope, $location, $timeout,$window) {
    
    if (!$rootScope.yju)
        $rootScope.yju = loadObject("user");
    
    $scope.selectedal.actionStateDetails = $rootScope.makeArray($scope.selectedal.actionStateDetails);
    var firstState = $scope.selectedal.actionStateDetails[0];
    var l =  $scope.selectedal.actionStateDetails.length;
    var hasReject = false;
    if (l > 2) {
        var ls = $scope.selectedal.actionStateDetails[l-1];
        var pls = $scope.selectedal.actionStateDetails[l-2]
        if (pls.actionStateId == 4 && ls.actionStateId ==1) {
            hasReject = true;
        }
    }
                
    $scope.ownAction = ($scope.selectedal.createdByUserId == $rootScope.yju.id);
    var sid = $scope.selectedal.actionStateId;
    $scope.hideReassign = false;
    if ($scope.ownAction) { // action created by owner  
        if (sid == 3 || sid == 5) { // can't get 5 on mobile
            $scope.hideReassign = true;
        }
        if (!hasReject && sid == 1 && firstState.assignedToUserId == $scope.selectedal.createdByUserId) { // pending but assigned to self
            $scope.hideReassign = true;
            $scope.ownAction = false; // show continue
        }
        else if (hasReject && firstState.assignedToUserId == $scope.selectedal.createdByUserId) {
           $scope.hideReassign = false;
           $scope.ownAction = true; // show close
        }
    }
    else if (sid == 1 || sid == 4) { // getting 4 when assigned by superuser
        $scope.ownAction = false; // should show continue
        $scope.hideReassign = true;
    }
        

    console.log("created by " + $scope.selectedal.createdByUserId + " , own id "  +  $rootScope.yju.id + " state " + sid);
        
    //Retrieving the floorname
    if (!$scope.selectedal.observationLocationName && $rootScope.location[$scope.selectedal.commissionId]) {
        var floorPlans = $rootScope.location[$scope.selectedal.commissionId].floorPlans;
        for (var i=0; i<floorPlans.length; i++) {
            if (floorPlans[i].floorPlanId==$scope.selectedal.floorPlanId) {
                $scope.selectedal.observationLocationName=floorPlans[i].description;
                break;
            }
        }
    }
                
        
    /* create object for the action update */
    $rootScope.actionupd = {};
    $rootScope.actionupd.userId = $rootScope.yju.id;
    $rootScope.actionupd.observationId = $rootScope.selectedal.observationId;
    $rootScope.actionupd.actionId = $rootScope.selectedal.actionId;
    $rootScope.actionupd.actionTaken = null;
    $rootScope.actionupd.photos = [];
    $rootScope.actionupd.responsibleOrganisationId = $rootScope.selectedal.responsibleOrganisationId;
    $rootScope.actionupd.assignedToUserId = $rootScope.yju.id;
    $rootScope.actionupd.actionId = $rootScope.selectedal.actionId;
    $rootScope.actionupd.actionTypeId = $rootScope.selectedal.actionTypeId;
    $rootScope.actionupd.riskRatingId = $rootScope.selectedal.riskRatingId;
    $rootScope.actionupd.createdByUserID = $rootScope.selectedal.createdByUserID;
    $rootScope.actionupd.dateCreated = $rootScope.selectedal.dateCreated;
    $rootScope.actionupd.raisedOnDate = $rootScope.selectedal.raisedOnDate;
    $rootScope.actionupd.dueDate = $rootScope.selectedal.dueDate;
    $rootScope.actionupd.modifiedDate = $rootScope.selectedal.modifiedDate;
    $rootScope.actionupd.actionSummary = $rootScope.selectedal.actionSummary;

    $scope.selectedal.actionStateDetails = $rootScope.makeArray($scope.selectedal.actionStateDetails);
    var browser = BrowserDetection.name();
    var ie = browser == "WP";
    var chrome = browser == "Chrome";
    var ios = browser == "iOS";    
    var chromeandy = false;
    if (chrome && navigator.userAgent.match(/Android/)) {
    	chromeandy = true;
    }
    
    $window.scrollTo(0, 0);
    var marker = $('#floormarker');
    marker.hide();
    $scope.rwidth = document.getElementById('adid').offsetWidth * .7;
    var flr;
    var p = [];
    var x = 0;
        
    var loadFloor = function() {
         var def = $q.defer();
        if ($scope.selectedal.floorPlanId != 0) {
            var fimgsrc = $scope.selectedal.floorPlanId + "_" + $scope.selectedal.commissionId;

            storage.load(fimgsrc).then(function (z) {
                $scope.loadingaction = false;
                def.resolve(1);
                if (z) {
                    $timeout(function() {
                        var cp = $('#vflrcontainer');
                        //                cp.css('height', h + 'px');
                        var rwidth = document.getElementById('adid').offsetWidth - 20;
                        cp.css('width', rwidth + 'px');

                        flr = $('#vflrimg');
                        flr.attr('src', z);

                        flr.load(function () {
                            console.log("Floor  W: " + this.width + ", H " + this.height);
                            var w = this.width;
                            var h = this.height;

                            var rw = rwidth;
                            var rh = rw * h / w;
                            var fc = rw / w;
                            var x = $scope.selectedal.xPosition * fc;
                            var y = $scope.selectedal.yPosition * fc;
                            flr.css('width', rw + 'px');
                            flr.css('height', rh + 'px');

                            // adjust for height and width of marker -- samsung only?
                            x -= 10;
                            y -= 30;
                            var marker = $('#floormarker');
                            if ($scope.selectedal.xPosition < 0 || $scope.selectedal.yPosition < 0) {
                                marker.hide();
                                return;
                            }
                            if ($scope.selectedal.xPosition ==0 && $scope.selectedal.yPosition == 0) {
                                marker.hide();
                                return;
                            }
                            marker.show();
                            marker.css('position', 'absolute');
                            marker.css('top', y + 'px');
                            marker.css('left', x + 'px');
                            z = null;
                            if (typeof (CollectGarbage) == "function") {
                                console.log("Collect garb")
                                CollectGarbage();
                            }
                        })
                    }, 500);
                }
            });
        }
        else {
            $scope.loadingaction = false;
            def.resolve(1);
        }
        
        return def.promise;
    }


    $scope.back = function () {
        if (flr) {
            flr.attr('src','');
            flr.remove();
        }
        if (typeof (CollectGarbage) == "function") {
            console.log("Collect garb")
            CollectGarbage();
        }

        $location.path('actionlist');
    }
    $scope.reassignuser = function () {
        var type = "1";
        $rootScope.actionupd.actionStateId = type;
        $location.path('reassignuser');
    }
    // note the value of 2 in no longer used in YJ //
    $scope.accept = function () { // resolve
        var type = "3";
        $rootScope.actionupd.actionStateId = type;
        $location.path('acceptaction');
    }
    $scope.reject = function () {
        var type = "4";
        $rootScope.actionupd.actionStateId = type;
        $location.path('rejectaction');
    }
    $scope.close = function () {
        var type = "5";
        $rootScope.actionupd.actionStateId = type;
        $rootScope.actionupd.isClosed = "true";
        $location.path('closeaction');
    }


    

    var cix = 0;
    var loadImage = function (viewPhotos, ix, img, marker) {
        var def = $q.defer();

        if (ix >= viewPhotos.length) {
            ix = 0;
        }
        if (ix < 0) {
            ix = viewPhotos.length - 1;
        }
        var six = ix;
        if (!viewPhotos[ix]) {
            def.resolve(null);
            return def.promise;
        }

        var setImg = function (imgdata) {
            img.attr('src', imgdata);

            console.log(ix + ", set src ");
            img.load(function () {

                console.log(ix + "------------ img load "+six +", "+cix);
                var limg = new Image;
                limg.onload = function () {
                    var w = this.width;
                    var h = this.height;
                    console.log(cix + ", ix " + ix + ", Load img " + w + ", " + h);
                     if (cix != ix) {
                        def.resolve(null);
                        return;
                     }
                    var fl = viewPhotos[ix];
                    //                fl.imgid = img; -- this will save the whole image data -- don't want this

                    var rw = $scope.rwidth;
                    var rh = rw * h / w;
                    var fc = rw / w;
                    var x = fl.xPosition * fc;
                    var y = fl.yPosition * fc;

                    fl.x = x;
                    fl.y = y;
                    fl.rw = rw;
                    //                fl.img = imgdata;
                    fl.index = six;
                    fl.w = rw;
                    fl.h = rh;
                    //                fl.len = viewPhotos.length;
                    $('.view-img-container').css('width', rw + 'px');
//                    $('#view-img-container').css('height', rh + 'px');
                    img.css('width', rw + 'px');
                    img.css('height', rh + 'px');
                    
                    x -= 10;
                    y -= 30; // why 30px offset on y ?? -- need special on air/s3/tablet
                    
                    
                    console.log("****** Makers " + fl.xPosition+" "+ fl.yPosition);
                     if (!fl.xPosition || !fl.yPosition || fl.xPosition < 0 || fl.yPosition < 0) {
                        marker.hide();
                        def.resolve(fl);
                        return;
                    }
                    else {
                         marker.show();
                    }
                    marker.css('position', 'absolute');
                    marker.css('top', y + 'px');
                    marker.css('left', x + 'px');

                    def.resolve(fl);
                    //imgdata = null;
                    //limg = null;
//                    if (typeof (CollectGarbage) == "function") {
//                        console.log("Collect garb")
//                        CollectGarbage();
//                    }

                    console.log(ix + "-------------- W: " + this.width + "x " + x + "y " + y);

                    

                }
                 
                limg.src = imgdata;
            })
            //            img.src = imgdata;
        }

        //        if (viewPhotos[ix].dataurl) {
        //            console.log("--->  hava dataurl");
        //            setImg($scope.viewPhotos[ix].dataurl);
        //        }
        //        else 
        storage.load(viewPhotos[ix].fileName).then(function (imgdata) {
            if (imgdata) {
                cix = ix;
                img.attr('src',''); // might help release mem
                console.log(ix + ", image data " + imgdata.length);
                setImg(imgdata);
            }
            else {
                def.resolve(null);
            }
        })

        return def.promise;
    }


    $scope.loadingaction = true;
    var imgbody = $('#view-body');
    imgbody.css('width', $scope.rwidth + 'px');
    var imgid = $('#viewmodalimg');
    var marker = $('#viewactionmarker');
    if ($scope.selectedal.actionPhotos) {
        $scope.selectedal.actionPhotos = $rootScope.makeArray($scope.selectedal.actionPhotos);
        p[x++] = loadImage($scope.selectedal.actionPhotos, 0, imgid, marker);
    }

    $scope.currentActionIndex = 0;
    $scope.nextActionPhoto = function () {
        $scope.currentActionIndex++;
        if ($scope.currentActionIndex >= $scope.selectedal.actionPhotos.length) $scope.currentActionIndex = 0;
                console.log("Current action inx " + $scope.currentActionIndex);
        loadImage($scope.selectedal.actionPhotos, $scope.currentActionIndex, imgid, marker);
    };
    $scope.prevActionPhoto = function () {
        $scope.currentActionIndex--;
        if ($scope.currentActionIndex < 0) $scope.currentActionIndex = $scope.selectedal.actionPhotos.length - 1;
        loadImage($scope.selectedal.actionPhotos, $scope.currentActionIndex, imgid, marker); 
    };
        
    
    // divide photo by state id
    $scope.actionStatePhotos = [];
    if ($scope.selectedal.actionStateDetailsPhotos) {
        $scope.selectedal.actionStateDetailsPhotos = $rootScope.makeArray($scope.selectedal.actionStateDetailsPhotos);
    }
    angular.forEach($scope.selectedal.actionStateDetailsPhotos, function(asdp) {
        var sid = asdp.photoDescription; 
        if (!$scope.actionStatePhotos[sid]) $scope.actionStatePhotos[sid]=[];
        $scope.actionStatePhotos[sid].push(asdp);
    })
    
     $timeout(function() {
        $scope.currentStateIndex = [];
        angular.forEach($scope.selectedal.actionStateDetails, function(asd) {
            var sid = asd.actionStateDetailId;
            if ($scope.actionStatePhotos[sid]) {
                var stateimgbody = $('#state-view-body'+sid);
                stateimgbody.css('width', $scope.rwidth + 'px');
                var imgidState = $('#viewstateimg'+sid);
                var markerState = $('#viewstatemarker'+sid);

                p[x++] = loadImage($scope.actionStatePhotos[sid], 0, imgidState, markerState);
                $scope.currentStateIndex[sid] = 0;
            }
        });
     },500);

        
    $scope.nextStatePhoto = function (sid) {
        $scope.currentStateIndex[sid]++;
        var ap = $scope.actionStatePhotos[sid];
        var imgidState = $('#viewstateimg'+sid);
        var markerState = $('#viewstatemarker'+sid);
        if ($scope.currentStateIndex[sid] >= ap.length) $scope.currentStateIndex[sid] = 0;
        loadImage(ap, $scope.currentStateIndex[sid], imgidState, markerState);
    };
    $scope.prevStatePhoto = function (sid) {
        $scope.currentStateIndex[sid]--;
        var ap = $scope.actionStatePhotos[sid];
        var imgidState = $('#viewstateimg'+sid);
        var markerState = $('#viewstatemarker'+sid);
        if ($scope.currentStateIndex[sid] < 0) $scope.currentStateIndex[sid] = ap.length - 1;
        loadImage(ap, $scope.currentStateIndex[sid], imgidState, markerState); 
    };
        
        
    var obsimgbody = $('#obs-view-body');
    obsimgbody.css('width', $scope.rwidth + 'px');
    var obsimgid = $('#viewobsimg');
    var obsmarker = $('#viewobsmarker');
    if ($scope.selectedal.observationPhotos) {
        $scope.selectedal.observationPhotos = $rootScope.makeArray($scope.selectedal.observationPhotos);
        p[x++] = loadImage($scope.selectedal.observationPhotos, 0, obsimgid, obsmarker);
     }
        
    $scope.currentObsIndex = 0;
    $scope.nextObsPhoto = function () {
        $scope.currentObsIndex++;
        if ($scope.currentObsIndex >= $scope.selectedal.observationPhotos.length) $scope.currentObsIndex = 0;
                console.log("Current obs inx " + $scope.currentObsIndex);
        loadImage($scope.selectedal.observationPhotos, $scope.currentObsIndex, obsimgid, obsmarker); //.then(function(ap) { $scope.currentActionPhoto = ap});
    };
    $scope.prevObsPhoto = function () {
        $scope.currentObsIndex--;
        if ($scope.currentObsIndex < 0) $scope.currentObsIndex = $scope.selectedal.observationPhotos.length - 1;
        loadImage($scope.selectedal.observationPhotos, $scope.currentObsIndex, obsimgid, obsmarker); //.then(function(ap) { $scope.currentActionPhoto = ap});
    };
        

    $q.all(p).then(function() {
        //$scope.loadingaction = false;
        loadFloor(); 
    });
    // Please note that $modalInstance represents a modal window (instance) dependency.
    // It is not the same as the $modal service used above.
//    var ModalInstanceCtrl = function ($scope, $modalInstance, item) {
//
//
//        $scope.next = function (v) {
//            var ix = v.index;
//            loadImage(ix + 1).then(function (o) {
//                if (o)
//                    $scope.item = o;
//            })
//            //        $modalInstance.close($scope.selected.item);
//        };
//        $scope.prev = function (v) {
//            var ix = v.index;
//            loadImage(ix - 1).then(function (o) {
//                if (o)
//                    $scope.item = o;
//            })
//            //        $modalInstance.close($scope.selected.item);
//        };
//
//
//        $scope.cancel = function () {
//            $modalInstance.dismiss('cancel');
//        };
//    };
//
//    $scope.view = function (obs) {
//        $scope.viewPhotos = $rootScope.makeArray($scope.selectedal.actionPhotos);
//
//        if (obs) $scope.viewPhotos = $rootScope.makeArray($scope.selectedal.observationPhotos);
//
//        loadImage(0, obs).then(function (o) {
//            $scope.item = o;
//            var modalInstance = $modal.open({
//                templateUrl: 'ViewModalContent.html',
//                controller: ModalInstanceCtrl,
//                scope: $scope,
//                resolve: {
//                    item: function () {
//                        return o;
//                    }
//
//                }
//            });
//
//            modalInstance.opened.then(function () {
//                //console.log('Opened ' + $("modal-header").width);
//                //                var ox = $scope.item;
//                //                var marker = $('#modalmarker');
//                //                marker.css('position', 'absolute');
//                //                marker.css('top', ox.y + 'px');
//                //                marker.css('left', ox.x + 'px');
//            });
//            modalInstance.result.then(function (selectedItem) {
//                $scope.item = selectedItem;
//            }, function () {
//                //$log.info('Modal dismissed at: ' + new Date());
//            });
//        });
//
//    };

    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
});