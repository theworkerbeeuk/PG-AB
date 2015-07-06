'use strict';

angular.module('yellowJacketApp')
    .controller('FloorplanCtrl', function ($scope, $rootScope, storage, $window, $location, $timeout, $route) {

    	
    var browser = BrowserDetection.name();
    var ie = browser == "WP";
    var chrome = browser == "Chrome";
    var ios = browser == "iOS";
    	
    var ds;
    if ($rootScope.observation)
        ds = $rootScope.observation.selectedfloor.floorPlanId + "_" + $rootScope.selectedCommission.id;
 
    var h = $window.innerHeight - 166 - 69; // total of bottom and top bar
    var w = $window.innerWidth;

    var offsetx;
    var offsety;
    var rqw;
    var rqh;

//     $('#flrimg').panzoom("reset"); // htc fix? -- don't work
        
    // clear previous
    $rootScope.observation.selectedfloor.x = 
        $rootScope.observation.selectedfloor.y = null;
        
    var fitImage = function (flr, fw, fh) {
    	
    	if (w > h) { // we are landscape orientation
    		 // fit height
    	       rqh = h;
    	        // fit the height first..to window h
    	        var hr = rqh / fh; // ratio to adjust height
    	        rqw = fw * hr;

    	        if (rqw > w) { // width is too big
    	            rqw = w;
    	            var wr = rqw / fw;
    	            rqh = fh * wr; // redo height
    	        }
    	} 
    	else {
	    	
	        rqw = w;
	        // fit the width first..to window w
	        var wr = rqw / fw; // ratio to adjust height
	        rqh = fh * wr;
	
	        if (rqh > h) { // height is too big
	            rqh = h;
	            var hr = rqh / fh;
	            rqw = fw * hr;
	        }
    	}
        var top = (h - rqh) / 2;
        // change image size
        flr.attr('width', rqw);
        flr.attr('height', rqh);
        if (top > 0) {
            flr.css('margin-top', top + 'px');
        }
        offsetx = (w - rqw) / 2;
        offsety = (h - rqh) / 2;
        console.log("rqw " + rqw + ", rqh " + rqh + ", ra " + wr + ", fw " + fw + ", fh " + fh +
            ", top " + top +
            ", offsetx " + offsetx + ", " + offsety);
    }

    //$rootScope.nonavbar = true; -- we want navbar here
    $scope.reading = true;
    storage.load(ds).then(function (f) {
        $scope.floorimg = f;
        $scope.reading = false;

        // magincation

        var cp = $('#floorpic');
        cp.css('height', h + 'px');
        cp.css('width', w + 'px');

        var transform = "";
        //if (w < $window.innerHeight) transform = "rotate";
        var flr = $('#flrimg');
        flr.attr('src', f);

        var brow = BrowserDetection.name();

        var focus = {};
        var setMarker = function (event, offLeft, offTop) { // windows mobile touch is mousedown
            event.preventDefault();

            $scope.showmarker = true;
            var x;
            var y;

            if (event.originalEvent.type == "touchend") return;

            var fudx = 0;
            var fudy = 0;
            if (event.originalEvent.type == "touchstart") {
                var orig = event.originalEvent; 
                x = orig.changedTouches[0].pageX;
                y = orig.changedTouches[0].pageY;
                
                fudx = 10;
                fudy = 30; //ios = check again...
            } else {
                x = event.pageX;
                y = event.pageY;
            }
            console.log("++++++++++ raw x " + x + ", raw y " + y + ", " + event.originalEvent.type);


            //           var zr = $scope.rangeval; // zoom -- angular range not working in ios
            // when you have time you can try this https://github.com/angular-ui/ui-slider
            // odd that angular bootstrap ui has no slider
            var zr = $("input[type=range]").val();
            console.log("Zoom ratio - " + zr);

            if (!zr) zr = 1;
            else zr = Number(zr);

            var matrix = flr.panzoom("getMatrix");

            var poffx = Number(matrix[4]);
            var poffy = Number(matrix[5]);


            var rw = rqw * zr; // adjust due to zoom
            var rh = rqh * zr;
            offsetx = (w - rw) / 2;
            offsety = (h - rh) / 2;
            x = x - 10;
            y = y - 140; // not sure why y is 140 px out
            
            console.log("Y:" +y +", rh:" + rh + ", py:" + poffy + "offy " + offsety );
            // limits due to htc tolerance going negative
            if (y < offsety + poffy) y = offsety + poffy + 10;
            var botLim = offsety + rh + poffy - 10;
            console.log("BotLim " + botLim);
            if (y > botLim) y = botLim;
            console.log("Y:" +y );

            var sy = y - offsety - poffy;
            var sx = x - offsetx - poffx;

            sy += fudy;
            sx += fudx;

            console.log("Offx.y " + offsetx + ", " + offsety + ", pxy " + poffx + ", " + poffy);

            console.log("Wind h " + $window.innerHeight + ", adj height" + h + ", reqh  " + rqh + ", req wid " + rqw);
            console.log("Marker sx,sy " + sx + ", " + sy + ", marker x.y " + x + "," + y);

            
            var marker = $('#marker');
            marker.css('position', 'absolute');
            marker.css('top', y + 'px');
            marker.css('left', x + 'px');
            
            $scope.$apply(function () {
            	setTimeout(function() { // silly samsung tab
    	            var marker = $('#marker');
    	            marker.css('position', 'absolute');
    	            marker.css('top', y + 'px');
    	            marker.css('left', x + 'px');
                	},  150);
                var wpw = $scope.imgw;
                var fudge = 1; //0.5; // web page disply is w=787.5 x h=396.5
                var r = fudge * wpw / rqw;
                console.log("--------------------------------------- Ratio " + r);
                if (!$scope.floor) $scope.floor = {};
                $scope.floor.x = Math.round(sx * r / zr); // wp ratio to web app
                $scope.floor.y = Math.round(sy * r / zr); // windows height = 2592 / web app = 863
                console.log("send x: " + $scope.floor.x + ", y:" + $scope.floor.y);
            })

            focus.event = event;

        };



        var haveTouch = null;
        var ol, ot;
        flr.load(function () {
            console.log("ok load imgw " + this.width + ", imgh " + this.height + ", ww " +w + ", wh" + h);
            $scope.imgw = this.width;
            $scope.imgh = this.height;
            fitImage(flr, this.width, this.height);
            //            flr.on('mousedown', setMarker);
            flr.on('panzoomend', function (e, panzoom, matrix, changed) {
                if (changed) {
                    // deal with drags or touch moves
                    console.log("Panzoomed ");
                    $scope.$apply(function () {
                        $scope.showmarker = false;
                        if ($scope.floor)
                    	$scope.floor.x = $scope.floor.y = null;
                    });
                    
                } else {
                	console.log("E " + e.pageX + ", " + e.pageY);
                    if (haveTouch) setMarker(haveTouch, ol, ot); 
                    else setMarker(e);
                }
            });

            
            flr.bind("touchstart", function (e) {
                haveTouch = e;
                e.preventDefault();
                console.log("Have touch " +  this.offsetLeft + ", " + this.offsetTop);
                ol = this.offsetLeft;
                ot = this.offsetTop;
//                setMarker(e, this.offsetLeft, this.offsetTop); //-- rely on panzoomed but there was a reason for this on diff devices
            });

            flr.panzoom({
                minScale: 0.5,
                //disablePan: true,
                //               $reset: $("button.resetZoom"), // amzing this don't work in iOS but ok in doz
                $zoomRange: $("input[type='range']"),
                onReset: $scope.reset
            });


            //            flr.parent().on('mousewheel.focal', function (e) {
            //                e.preventDefault();
            //                var delta = e.delta || e.originalEvent.wheelDelta;
            //                var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
            //                flr.panzoom('zoom', zoomOut, {
            //                    increment: 0.1,
            //                    animate: false,
            //                    focal: focus.event
            //                });
            //            });



            //            $scope.zoom = function (out) {
            //                flr.panzoom("zoom", out);
            //            }
        });



    })

    //$scope.fimage = 'data:image/jpeg;base64,'+data.img;


    //    var h = $window.innerHeight - 200;
    //    var w = $window.innerWidth - 10;
    //    var c = document.getElementById('floor-canvas');
    //    c.width = w;
    //    c.height = h;


    
    var orientationChange = function() {
//        var h = $window.innerHeight - 60; // allow for bottom bar
//        var w = $window.innerWidth;
//        console.log("OC --- H " + h + " W " + w);
//        switch($window.orientation)
//        {
//        case -90:
//        case 90:
//            console.log('**** landscape');
//            break;
//        default:
//            console.log('**** portrait');
//            break;
//        }
        
        if ($route.current.loadedTemplateUrl.indexOf("floorplan.html") != -1) {
           
           console.log("ROUTE " + angular.toJson($route.current));

           // reload
           $timeout(function() {
               $route.reload();
           }, 800)
        }
    }
    
    if (!$rootScope.floorOCL) {
        $rootScope.floorOCL = true;
        $window.addEventListener('orientationchange', orientationChange);
    }    
    
    
    
    $scope.reset = function () {
        $scope.showmarker = false;
        if ( $rootScope.floordata) {
          $rootScope.floordata.x = $rootScope.floordata.y = null;
        }
        $scope.floor = null; // zap the data
        $('#flrimg').panzoom("reset");
    }


    $scope.cancel = function () {
        $rootScope.nonavbar = false;
        $location.path('location');
    }

    $scope.finish = function () {
        $rootScope.nonavbar = false;
        $rootScope.floordata = $scope.floor; // not sure why we do this
        if ( $rootScope.floordata && $rootScope.floordata.x) {
            $rootScope.observation.selectedfloor.x = $rootScope.floordata.x;
            $rootScope.observation.selectedfloor.y = $rootScope.floordata.y;
        }
        
        $rootScope.floorOCL = false;
        $window.removeEventListener('orientationchange', orientationChange);

        $location.path($rootScope.returnTo);
    }

    $scope.floorControl = {};

    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
});