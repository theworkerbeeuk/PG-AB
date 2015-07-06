//'use strict';

angular.module('yellowJacketApp')
    .controller('CapturepicCtrl', function ($scope, storage, $rootScope, $window, $location, $timeout, $route) {


    $timeout(function () {
       window.scrollTo(0, 0);
       // fix for keyboard up ipad -- below messes up iphone - if ipad messed then need to check device model
//       $('.navbar.navbar-fixed-bottom').css('position', 'absolute');
//       $('.navbar.navbar-fixed-bottom').css('bottom', '0');
    },100);
        
                
    
    //console.log("Pixel ratio " + $window.devicePixelRatio);
    var uplift = $window.devicePixelRatio ? $window.devicePixelRatio : 1; // pixel ratio

    var browser = BrowserDetection.name();
    var ie = browser == "WP";
    var chrome = browser == "Chrome";
    var ios = browser == "iOS";
    var chromeandy = false;
    var s4 = false;
    if (chrome && navigator.userAgent.match(/Android/)) {
    	chromeandy = true;
    }
    if ($rootScope.isDevice) {
        chromeandy = device.model.indexOf('GT-I') != -1 ||
            device.model.indexOf('GT-P') != -1; // samsung special
        s4 = device.model.indexOf('GT-I95') != -1; // s4 is funny behavour in h/w of orientation
    }
    
    var h = $window.innerHeight - 60; // allow for bottom bar
    var w = $window.innerWidth;

        
    if ($rootScope.isDevice)
        console.log("Chrome and ******* " + chromeandy + " dev  "+ device.model);

    if (s4) {
        var o = $rootScope.orientation();
    	console.log("Orient " +  o);
        if (o == 'p') {
            h = 580;
            w = 360;
        }
        else {
            h = 360;
            w = 580;
        }
//    	var wt = w;
//    	if (h < w) { // strange samsung behaviour -- orientation problem?
//    		// swap
//    		h += 60;
//    		w = h;
//    		h = wt - 40;
//    	}
//        
//    	if ($rootScope.orientation() == 'l') {
//    		h += 60;
//    		w = h;
//    		h = wt - 40;
//    	}
        
    }
        

    $rootScope.nonavbar = true;
    console.log("H " + h + " W " + w);
    //    var c = document.getElementById('capturepic');
    //    c.width = w;
    //    c.height = h;

    $('#piccontainer').css('margin-top', '-60px'); // since top bar removed
    var cp = $('#capturedpic');
    cp.css('height', h + 'px');
    cp.css('width', w + 'px');


        
    var rqh, rqw;
    var offx, offy;
    var fitImage = function (flr, fw, fh) {
        console.log('fitimage');
  	    if (w > h) { // we are landscape orientation
   	        rqh = h;   	        // fit the height first..to window h
   	        rqw =  h * fw/fh;

   	        if (rqw > w) { // width is too big
   	            rqw = w;
   	            rqh =  w * fh / fw; // redo height
   	        }
    	} 
    	else {        
           rqw = w;
        // fit the width first..to window w
           rqh = w * fh / fw;
	        if (rqh > h) { // height is too big
	            rqw = h * fw / fh;
	            rqh = h;
	        }
    	}


        var top = (h - rqh) / 2;
  	    offx = (w - rqw)/2;
   	    offy = top;
        // change image size
        flr.attr('width', rqw);
        flr.attr('height', rqh);
        if (top > 0)
            flr.css('margin-top', top + 'px');

        $scope.reqH = rqh;
        $scope.reqW = rqw;

        console.log("w " + rqw + ", h " + rqh + ", offx " + offx + ", offy " + offy);
    }

    var pic = $('#picimg');
    pic.attr('src', $rootScope.picture);
    pic.load(function () {
        console.log("ok load " + this.width + ", " + this.height);
        $scope.picw = this.width;
        $scope.pich = this.height;
        fitImage(pic, this.width, this.height);

    });


    var markit = function (x, y) { // windows mobile touch is mousedown -- iOS ok with this
        $scope.showmarker = true;
        //alert("md:"+event.handled);
        var ly = y - 46; // not sure why y is 130 px out
        var lx = x;
        console.log($window.innerHeight + ", " + h + ", marker" + x + ", " + y);
        console.log("Pic w " + $scope.picw + ", h " + $scope.pich);
        var marker = $('#marker');
        marker.css('position', 'absolute');
        marker.css('top', ly + 'px');
        marker.css('left', lx + 'px');
        $scope.$apply(function () {
            setTimeout(function() { // silly samsung tab
                var marker = $('#marker');
                marker.css('position', 'absolute');
                marker.css('top', ly + 'px');
                marker.css('left', lx + 'px');
            },  150);
            var fudge = 1.0;
            var r = ios ? uplift : (fudge * $scope.pich / $scope.reqH); // scaling for when sending the whole image which is not true for ios or android
            if (ios) {
                x = x - offx + 10;
                y -= offy +10;
                $rootScope.picturedata.x = Math.round((x) * r);
                $rootScope.picturedata.y = Math.round(y * r); // windows height = 2592 / web app = 863
            } else if (ie) {
                $rootScope.picturedata.x = Math.round((x-10) * r); // wp ratio to web app
                $rootScope.picturedata.y = Math.round(y * r); // windows height = 2592 / web app = 863
            }
            else { //android
            	x = x - offx;
            	y -= offy;
            	if (w>h) x += 10 // not sure why we are 10 out might be the container
            	else x -=10;
            	
            	 if (chromeandy) {
            		 x += 20; // back -- or add another -- for orientation = p
            		 y -= 10;
            	 }
            	r = 2; // canvas is multiplied by 2 as well to give sufficient definition of picture
                $rootScope.picturedata.x = Math.round((x)*r); // wp ratio to web app -10 for htc/samsung mobile - is it landscape portratin?
                $rootScope.picturedata.y = Math.round(y*r); // windows height = 2592 / web app = 863
            }
            console.log("Sending " + $rootScope.picturedata.x + ", " + $rootScope.picturedata.y)
        })
    }


    var haveTouch = false;
    pic.on('mousedown', function (e) {
        e.preventDefault();
        var x = e.pageX;
        var y = e.pageY;
        if (y > h) {
            return;
        }
        if (!haveTouch)
        	markit(x, y);

    }); // windoz


    if (!chrome && !ie) 
    pic.on("touchstart", function (e) { 
    	haveTouch = true;
        e.preventDefault();
        var orig = e.originalEvent;
        lastX = orig.changedTouches[0].pageX;
        lastY = orig.changedTouches[0].pageY;

        console.log("touch " + lastX + ", " + lastY);
        markit(lastX, lastY);

    });


    $scope.cancel = function () {
        $location.path($rootScope.returnTo);
        $rootScope.picturedata = null;
        $rootScope.picture = null;
        $rootScope.nonavbar = false;
    }

    $rootScope.picturedata = {
        'ext': 'jpg'
    };


    var orientationChange = function() {
        var h = $window.innerHeight - 60; // allow for bottom bar
        var w = $window.innerWidth;
        console.log("OC --- H " + h + " W " + w);
        
        if ($route.current.loadedTemplateUrl.indexOf("capturepic.html") != -1) {
           
           console.log("ROUTE " + angular.toJson($route.current));
                
           // reload
           $timeout(function() {
               console.log("ROUTE " + angular.toJson($route.current));
               $route.reload();
           }, 800)
        }
    }
    
    if (!$rootScope.pictureOCL) {
        $rootScope.pictureOCL = true;
        $window.addEventListener('orientationchange', orientationChange);
    }
                


   var bgFinish = function () {
        $rootScope.nonavbar = false;
        $rootScope.picturedata.capturedSrc = $rootScope.picture; // for windoz
        var nm = $rootScope.picture.substring($rootScope.picture.lastIndexOf("/")+1);
        // get the canvascopy object.
        $rootScope.picturedata.orgSrc = new Date().getTime()+nm;
        var dataurl;
       
        if (!$rootScope.isDevice || ios) { // windows uses file transfer and sends the whole file browser and iOS

            // get dataURL;
            var c = document.createElement("canvas"); // load the image into this canvas
            c.width = $scope.reqW * uplift;
            c.height = $scope.reqH * uplift;

            var img = document.getElementById("picimg");

            // ios special -- check ipad, htc, samsung, tablet..
            var ctx = c.getContext("2d");
            var ch = c.height;
               
            ctx.drawImage(img, 0, 0, c.width, ch); 
            
            if ($rootScope.isDevice && device.model == "iPad4,2") {
                dataurl = c.toDataURL("image/jpeg", 0.1); // ios compression
            }
            else
                dataurl = c.toDataURL("image/jpeg", 0.5); // ios compression
            
            delete c;
        } 
        else if (!ie) {  // then android? have to check samsung
            var c = document.createElement("canvas"); // load the image into this canvas
            var r = 2; // has to match the marker position factor to canvas factor
            c.width = $scope.reqW*r;
            c.height = $scope.reqH*r;
            var img = document.getElementById("picimg");

            var ctx = c.getContext("2d");
            ctx.drawImage(img, 0, 0, c.width, c.height); // ios height needs x2 on just the height - android?

            console.log("5 w = " + c.width + ", h = " + c.height);
            // -- android..special provides png->jpg
            var encoder = new JPEGEncoder();
            dataurl = encoder.encode(ctx.getImageData(0,0, c.width, c.height), 50); /// 1 to 100
            delete c;
        }

        var l = dataurl.length;
        if (l > 32) console.log(l + ", data: " + dataurl.substring(l - 32));

       $rootScope.lastPic = dataurl;
        storage.save($rootScope.picturedata.orgSrc, dataurl).then(function() {
            $scope.addPic = false;
        	$location.path($rootScope.returnTo);
        })
        
        
    }

    $scope.reset = function() {
        $scope.showmarker=false;
        $rootScope.picturedata.x = $rootScope.picturedata.y = null;   
        $rootScope.picture.x = $rootScope.picture.y = null;   
    }
    
    
    $scope.finish = function() {
    	$scope.addPic = true;
        $timeout(function() {
        	bgFinish();
            
             $rootScope.pictureOCL = false;
            $window.removeEventListener('orientationchange', orientationChange);
            
        },100)
    }
    
    $scope.markControl = {};

    $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
    ];
});