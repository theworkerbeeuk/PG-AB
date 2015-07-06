//'use strict';

angular.module('ui.steria', [])
    .run(function ($rootScope, $window) {
    $rootScope.startMainSpinner = function (t) {
        if (!t) t = "large";
        $('.spinbox.centred').show();
        $('.spinbox.centred').spin(t);
    };
    $rootScope.stopMainSpinner = function () {
        $('.spinbox.centred').spin(false);
    };

    // normal context spinner
    $rootScope.startSpinner = function (t) {
        if (!t) t = "small";
        $('.spinbox').show();
        $('.spinbox').spin(t);
    };
    $rootScope.stopSpinner = function () {
        $('.spinbox').spin(false);
    };

    // appAnalytics context spinner 
    $rootScope.startAppSpinner = function (t) {
        if (!t) t = "large";
        $('.spinbox-appAnalytics').show();
        $('.spinbox-appAnalytics').spin(t);
    };
    $rootScope.stopAppSpinner = function () {
        $('.spinbox-appAnalytics').spin(false);
    };

    // used to show the date calender but causing the date box to be focused when the calendar icon is clicked
    $rootScope.focusOn = function (v) {
        $(v).focus();
    };

    $rootScope.pad = function (str, max) { // left pad with 0
        return str.length < max ? $rootScope.pad("0" + str, max) : str;
    };
        
    $rootScope.dateString = function() {
        function padStr(i) {
            return (i < 10) ? "0" + i : "" + i;
        }   
        var temp = new Date();
        var dateStr = padStr(temp.getFullYear()) + "-" +
                      padStr(1 + temp.getMonth()) + "-"  +
                      padStr(temp.getDate());
//                      padStr(temp.getHours()) +
//                      padStr(temp.getMinutes()) +
//                      padStr(temp.getSeconds());
        return dateStr;
    };

     

    $rootScope.makeArray = function (obj) {
        if ($.isArray(obj)) return obj;
        return new Array(obj);
    };

    $rootScope.isUniqueSet = function (arr, attr, value, ignorecase) {
        for (var s in arr) {
            var l = value;
            if (ignorecase) l = l.toLowerCase();
            var x = arr[s][attr];
            if (x != "" && l.indexOf(x) != -1) {
                return false;
            }
        }
        return true;
    };

    $rootScope.initCap = function (str) {
        /* First letter as uppercase, rest lower */
        var str = str.substring(0, 1).toUpperCase() + str.substring(1, str.length).toLowerCase();
        return str;
    };

    $rootScope.initLower = function (str) {
        /* First letter as lower */
        var str = str.substring(0, 1).toLowerCase() + str.substring(1, str.length);
        return str;
    };

    $rootScope.dataURItoBlob = function (dataURI) {
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);
        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to an ArrayBuffer
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ab],{type: mimeString});
    };
        
    $rootScope.orientation = function() {
//         console.log("switch orient");
         switch(window.orientation)
         {
         case -90:
         case 90:
            return 'l';
            break;
         default:
            return 'p';
        }
     }
        
})



.filter('nospace', function () { // remove all spaces
    return function (item) {
        item = item.replace(/\s+/g, "");
        return item;
    };
})
.filter('substr', function () { // remove all spaces
    return function (item, start, end) {
        return item.substring(start, end);
    };
})


// Globally set the date format when we use angularui date directives
.value('ui.config', {
    date: {
        dateFormat: 'dd/mm/yy'
    },
    tinymce: {
        theme: 'advanced'
    } //invoke tinymce with advanced theme
})

//  tag: <centred-spin/>
.directive('centredSpin', function () { // this takes the show-graph tag and creates the javascript to call
    return {
        restrict: 'EA',
        link: function (scope, elem, attr, ctrl) {
            //uses fontawesome
            elem.append("<div class='centre spinbox fa fa-spinner fa-5x fa-spin'></div>");
            //elem.append("<div class='spinbox centred'></div>");
            if (attr && attr.start) {
                // start it by default
                scope.startMainSpinner();
            }
        }
    }
})
    .directive('inputSpin', function () { // this takes the show-graph tag and creates the javascript to call
    return {
        restrict: 'EA',
        link: function (scope, elem, attr, ctrl) {
            elem.append("<div class='spinbox inputbox'></div>");
        }
    }
})
    .directive('spin', function () { // this takes the show-graph tag and creates the javascript to call
    return {
        restrict: 'EA',
        link: function (scope, elem, attr, ctrl) {
            elem.append("<div class='spinbox'></div>");
        }
    }
})
    .directive('appSpin', function () { // this takes the show-graph tag and creates the javascript to call
    return {
        restrict: 'EA',
        link: function (scope, elem, attr, ctrl) {
            elem.append("<div class='spinbox-appAnalytics'></div>");
        }
    }
})
    .directive("draw", function () { //< canvas drawing></canvas>
    return {
        restrict: "A",
        link: function (scope, element, attr, ctrl) {
            
            var color = "#4bf";
            if (attr.color) {
                color = attr.color;
            }
            var ctx = element[0].getContext('2d');

            // variable that decides if something should be drawn on mousemove
            var drawing = false;

            // the last coordinates before the current move
            var lastX;
            var lastY;

            element.bind("touchstart", function (e) {
                e.preventDefault();
                var orig = e.originalEvent;  
                lastX = orig.changedTouches[0].pageX;  
                lastY = orig.changedTouches[0].pageY;  
                
                lastX -= this.offsetLeft;
                lastY -= this.offsetTop;
                
                // begins new line
                ctx.beginPath();
                drawing = true;
            });

            element.bind("touchend", function (e) {
                drawing = false;
            });

            element.bind("touchmove", function (e) {
                
                //e.preventDefault();
               
                if (drawing) {
                    // get current mouse position
                    var orig = e.originalEvent;  
                    var currentX = orig.targetTouches[0].pageX;  
                    var currentY = orig.targetTouches[0].pageY;  
                    currentX -= this.offsetLeft;
                    currentY -= this.offsetTop;
                    
                    draw(ctx, lastX, lastY, currentX, currentY);

                    // set current coordinates to last one
                    lastX = currentX;
                    lastY = currentY;
                }
            });

            element.on('mousedown', function (event) {
                lastX = event.offsetX;
                lastY = event.offsetY;
                // begins new line
                ctx.beginPath();
                drawing = true;
            });
            
            element.on('mousemove', function (event) {
                if (drawing) {
                    // get current mouse position
                    var currentX = event.offsetX;
                    var currentY = event.offsetY;

                    draw(ctx, lastX, lastY, currentX, currentY);

                    // set current coordinates to last one
                    lastX = currentX;
                    lastY = currentY;
                }
            });

            element.on('mouseup', function (event) {
                // stop drawing
                drawing = false;
            });

            // canvas reset

            function reset() {
                element[0].width = element[0].width;
            }

            function draw(ctzx, lX, lY, cX, cY) {
                // line from
                ctzx.moveTo(lX, lY);
                // to
                ctzx.lineTo(cX, cY);
                // color
                ctzx.strokeStyle = color;
                // draw it
                ctzx.stroke();
            }

            var canvas = element[0];
            var canvasCopy = document.createElement("canvas");
            var copyContext = canvasCopy.getContext("2d");


            // img special
            if (attr.img) {
                var img = new Image();
                img.onload = function () {

                    var ratio = 1;

                    // defining cause it wasnt
                    var maxWidth = 800,
                        maxHeight = 800;

                    if (img.width > maxWidth)
                        ratio = maxWidth / img.width;
                    else if (img.height > maxHeight)
                        ratio = maxHeight / img.height;

                    canvasCopy.width = img.width;
                    canvasCopy.height = img.height;
                    copyContext.drawImage(img, 0, 0);

                    ctx.width = img.width * ratio;
                    ctx.height = img.height * ratio;
                    ctx.drawImage(canvasCopy, 0, 0, canvas.width, canvas.height);
                }
                img.src = attr.img;
            }


        }
    };
})

.directive("mark", ['storage', function (storage) { //< canvas mark></canvas>
    return {
        restrict: "AE",
        require: "?ngModel",
//        scope: {
//            control: '=?'
//        },
        link: function (scope, element, attr, ctrl) {


            var marker = "../img/pin.png";
            var raw = false;
            if (attr.raw) raw = true;
            if (attr.marker) {
                marker = attr.marker;
            }
            
            var canvas = element[0];
            var ctx = canvas.getContext('2d');
            if (!raw) { // raw used for floorplan
               if (scope.wdow) {
                   canvas.width = scope.wdow.w;
                   canvas.height = scope.wdow.h - 90; // account for navbar width?
               }
            }
            
            // variable that decides if something should be drawn on mousemove
            var drawing = false;

            // the last coordinates before the current move
            var lastX;
            var lastY;

            element.bind("touchstart", function (e) {
                e.preventDefault();
                var orig = e.originalEvent;  
                lastX = orig.changedTouches[0].pageX;  
                lastY = orig.changedTouches[0].pageY;  
                
                lastX -= this.offsetLeft;
                lastY -= this.offsetTop;
                
                markit(ctx, lastX, lastY);
                drawing = true;
            });

            element.bind("touchend", function (e) {
                drawing = false;
            });


            element.on('mousedown', function (event) {
                lastX = event.offsetX;
                lastY = event.offsetY;
                // begins new line
                 markit(ctx, lastX, lastY);
                drawing = true;
            });
            
            element.on('mouseup', function (event) {
                // stop drawing
                drawing = false;
            });

            // canvas reset
            function reset() {
                element[0].width = element[0].width;
                drw(img);
            }
            
            scope.clearCanvas = function() {
                reset();
            }

            var markerImgLoaded = false;
            var markerImg = new Image();
            var browser = BrowserDetection.name();
            var ie = browser == "WP";
            var chrome = browser = "Chrome";  // samsung

            var cc = 0xf041; //0xe062; // location marker- see _glypicons.scss
            //cc = 0xe146; //push pin
            var scc = String.fromCharCode(cc);

            function markit(ctxz, lx, ly) {
                // clears the previous marker -- unless you want multiple markers!!
                reset();

                ctx.font = '36px FontAwesome'; //'36px Glyphicons Halflings';
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'black';
                ofsy = -1; //browser & android
                ofsx = chrome? 9 : 16;
              
                

                if (raw && !ie && !chrome)      {
                  ofsy = 130;  // raw display -- this is correct for phone browsers. but not explorrer
                }

                //alert(browser);

                var x = lx-ofsx;
                var y =  ly-ofsy;
                console.log("x " + lx + ", y " + ly +", adjx " + x +", adjy " + y);
                ctx.fillText(scc, x, y);
                ctx.strokeText(scc, x, y);
                
                console.log('lx ' + lx + ", cw " + canvas.width + ", imgw " + img.width + ", r " + ratio);
                console.log('ly ' + ly + ", cw " + canvas.height + ", imgh " + img.height + ", r " + ratio);
                var xr = canvas.width/img.width;
                var yr = canvas.height/img.height;
                sndobj.x = Math.round(x/xr); // android likes this if its png
                sndobj.y = Math.round(y/yr);
                var f = 0.5; // compression factor ?
                sndobj.x = Math.round(ratio*x);
                sndobj.y = Math.round(ratio*y);
                console.log("x " + sndobj.x + ", y " + sndobj.y);
                if (browser == 'iOS' || raw) {
                  sndobj.x = Math.round(ratio*x/xr);
                  sndobj.y = Math.round(ratio*y/yr);
                }
                if (raw) {
                  if (!ie)
                      sndobj.y += 130;
                  sndobj.x += 130; //and andorid?
                }
                
                var imgr = img.width/img.height;
                // thumbs always 80px....?160
                xxrw = 80/img.width;
                yyrw = xxrw * imgr;
//                sndobj.localx = 10+sndobj.x * xxrw;
//                sndobj.localy = 5+sndobj.y * yyrw;
                sndobj.localx = 10;
                sndobj.localy = 5;
                
                sndobj.x = Math.round(sndobj.x);
                sndobj.y = Math.round(sndobj.y);
                
                if (ctrl)
                  ctrl.$setViewValue(sndobj);
            }

            var canvasCopy = document.createElement("canvas");
            var copyContext = canvasCopy.getContext("2d");

           function drw(img) {
               var cw = canvas.width,
               ch = canvas.height;
               ctx.drawImage(canvasCopy, 0, 0, cw, ch);
           }

            var sndobj = {};
            var img;
            var ratio = 1;
            function loadimg() {
                img = new Image();
                img.onload = function () {

                    var div = 0.5 * img.width/700; //960; // hmmm tricky
                    
                    if (browser == 'iOS') {
                        div = 0.5 * img.width/590; // ios 5
                    }
                    if (ie) {
                        div = 0.5 * img.width / 900;
                    }

                    var maxWidth = img.width / div, 
                    maxHeight = img.height / div;
                    
                    if (img.width > maxWidth)
                        ratio = maxWidth / img.width;
                    else if (img.height > maxHeight)
                        ratio = maxHeight / img.height;
                    
                    if (chrome) {
                        var iw = window.innerWidth; // find the width
                        var ih = window.innerHeight-90; //
                        
                        // which is smaller? 
                        var useL = ih;
                        var imgr;
//                        alert(iw + ' ' + ih);
//                        alert(img.width + ' ' + img.height);
                        if (iw > ih) {
                            imgrh = ih/img.height;
                            canvas.height = ih;
                            canvas.width = canvas.height *img.width/img.height;
                            imgrw = canvas.width/img.width;
//                            alert('cnvs w ' + canvas.width + ' cnvs h ' + canvas.height);
                            canvasCopy.width = canvas.width/imgrw;
                            canvasCopy.height = canvas.height / imgrh;
                            ctx.width = canvasCopy.width;
                            ctx.height = canvasCopy.height;
                            // imgrr
                            copyContext.drawImage(img, 0, 0);
                        }
                        else {
                            imgr = img.width/iw;
                            canvas.width = iw;
                            canvas.height = canvas.width *img.height/img.width;
                            ctx.width = canvasCopy.width = canvas.width;
                            ctx.height = canvasCopy.height = canvas.height;
                            copyContext.drawImage(img, 0, 0);
                        }
                        
                        
                    }

                   if (!raw && !chrome) {
                       var iw = window.innerWidth;
                       canvas.width = iw;
                       var hr = maxHeight / maxWidth;
                       canvas.height = iw * hr - 5; // account for navbar width?
                       if (browser == 'iOS') {
                           canvas.height += 12; // offset y with this?
                       }
                       canvasCopy.width = img.width * ratio;
                       canvasCopy.height = img.height * ratio;
                       copyContext.drawImage(img, 0, 0);
                       ctx.width = canvas.width;
                       ctx.height = canvas.height;
                    }
                   else if (raw && chrome) {
                	   maxHeight = scope.wdow.h - 230; // fix it to this
                       ratio = maxHeight / img.height;
    
                	   var w = img.width * ratio;
                	   var h = img.height * ratio;
                	   
                       canvas.height = h; 
                       canvas.width =  w;
                       canvasCopy.width = img.width; // need the whole thing in the copy
                       canvasCopy.height = img.height;
                       copyContext.drawImage(img, 0, 0);
                       ctx.width = w;
                       ctx.height = h;
                       console.log(ratio + ', w ' + canvas.width + ", h" + canvas.height);
                   }
                   else {

                        canvasCopy.width = img.width;
                        canvasCopy.height = img.height;
                        copyContext.drawImage(img, 0, 0);
                        ctx.width = img.width * ratio;
                        ctx.height = img.height * ratio;
                    }
                   
                    
                   drw(img);
                    
                   if (ctrl) {
                     sndobj.canvas = canvasCopy; //-- this is holding data... and blowing ie...need to delete
                     sndobj.src = img.src+"_"+new Date().getTime();
                     sndobj.ext = "jpg";
                     sndobj.orgSrc = img.src;
                     ctrl.$setViewValue(sndobj);
                       
                     if (browser != 'iOS' && !ie) { // android..
                        var encoder = new JPEGEncoder();
                        var z = encoder.encode(ctx.getImageData(0, 0, canvas.width, canvas.height), 90);
                         sndobj.dataurl = z; 
                            
                     }

//                     if (xie) {
//
//                         var MAXG = 5; // max goes at getting the image data url
//                         var todata = function () {
//                             try {
//                                 if (MAXG < 0) return;
//                                 console.log("<<<< Todata " + MAXG);
//                                 --MAXG;
//
//                                 var datauri = canvasCopy.toDataURL("image/jpeg", 0.2);
//
////                                 var self = this;
////                                     console.log("dat " + datauri.substring(0,32));
//
//                                     storage.save(sndobj.src, datauri).then(function () {
//                                         storage.load(sndobj.src).then(function (v) { // check remove later
//                                         console.log(">> pic read " + v.substring(0, 32));
//                                         delete datauri;
//                                         delete canvasCopy;
//                                         if (typeof (CollectGarbage) == "function") {
//                                             CollectGarbage();
//                                         }
//                                     })
//
//                                     //$location.path($rootScope.returnTo);
//                                 });
//                             }
//                             catch (x) {
//                                 console.log("toDataURL error " + x)
//                                 //delete self.datauri;
//                                 if (typeof (CollectGarbage) == "function") {
//                                     console.log("Collect garbage " + x)
//                                     CollectGarbage();
//                                 }
//                                 setTimeout(function () {
//                                     todata();
//                                 }, 400); // wait 200 ms and try again
//                             }
//                         }
//                         todata();
//
//                     
//                     }



                   }
                }
                img.src = attr.img;
            }
            
            if (attr.img) loadimg();
            
            scope.$watch(attr.src, function(v) {
                if (attr.base64) {
                    var t = attr.type ? attr.type : "png";
                    if (v && v.indexOf("data:image") == -1) {
                         attr.img = "data:image/"+t+";base64,"+v;
                    }
                    else {
                        attr.img = v;
                    }
                    loadimg();
                }
            });

        }
    };
}])
.directive("fastClick", function() {
    return {
      restrict: "A",
      link: function(scope, element, attr) {
        var applyAttribute, touchBroken, touchMoveCounter, touchDone;
        touchBroken = false;
        touchMoveCounter = 0;
        touchDone = false;
        applyAttribute = function() {
          if (!touchBroken) {
            return scope.$apply(attr['fastClick']);
          }
        };
        //event.handled=false;
        element.on('touchstart', function(event) {
        //alert("te:"+event.handled);
            if(touchDone!==true) {
                   gHavetouch = true; //has to be global because of android timing
            //if(event.handled!==true) {
                   touchMoveCounter = 0;
                   event.preventDefault();
                   applyAttribute();
                   touchBroken = false;
                   //event.handled=true;
                   touchDone=true;
                   return touchMoveCounter = 0;
            }
        });
        element.on('mousedown', function(event) {
        //alert("md:"+event.handled);
            if(!gHavetouch && touchDone!==true) {
            //if(event.handled!==true) {
                   touchMoveCounter = 0;
                   event.preventDefault();
                   applyAttribute();
                   touchBroken = false;
                   //event.handled=true;
                   touchDone=true;
                   return touchMoveCounter = 0;
            }
        });
        element.on('touchend', function(event) {
          event.preventDefault();
          touchDone = false;
          //event.handled=false;//reset for next tap
        });
        element.on('mouseup', function(event) {
          event.preventDefault();
          touchDone = false;
          //event.handled=false;//reset for next click
        });
        element.on('click', function(event) {
          event.preventDefault();
        });
        return element.on('touchmove', function(event) {
          if (touchBroken) {
            return;
          }
          if (!touchBroken) {
            touchMoveCounter++;
          }
          if (touchMoveCounter > 2) {
            return touchBroken = true;
          }
        });
      }
    };
})
.directive('camera', function() {
   return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, elm, attrs, ctrl) {
          
         var tw = -1;
         var th = -1;
         var b =  BrowserDetection.name();
         var samsung=false;
         var samsungTab = false;
         var co;
         var iPadR;
         var q;
          
         var setParam = function() {
             try {
               if (device) {
                  samsung = device.model.indexOf('GT-I') != -1;
                  samsungTab = device.model.indexOf('GT-P') != -1;
                  iPadR = device.model.indexOf("iPad4,2") != -1;
               }
             }
             catch(e) {}
             co = (b == 'iOS') || (b == 'Chrome') || samsung;

             if (co && scope.orientation() == 'l') co = false;


             q = co? 10 : 20; //10 - for ios5 18 - for android, //50
             if ( b == "WP") {
                q = 30;
             }
    //         else if (b == "Chrome") { // s4 is chrome and samsung sr = GT-I9505
    //        	q = 50; // Samsung is chrome....yup. v <= 4.2
    //            th = window.innerHeight - 60; // allow for bottom bar
    //            tw = window.innerWidth;
    //         }
             else if (samsung || iPadR || samsungTab) {
                q = 100; // Samsung is chrome....yup. v > 4.2
                th = (window.innerHeight - 60); // allow for bottom bar
                tw = (window.innerWidth);
                if (iPadR) q=10;
               console.log("*********** use " + tw + ", h " + th);
               if (samsungTab && tw < th)
                   co = true;
             }
    //         else if (samsungTab) {
    //           console.log("*********** samsung  orient" + scope.orientation() +", co " + co);
    //           if (scope.orientation() == 'p') co = true;
    //         }
             else if (b=='iOS') {
                th = window.innerHeight;
                tw = window.innerWidth;
                if (th < tw) {
                 var temp = th;
                 th = tw;
                 tw = temp;
                 co = false;
               }
               else {
                   co = true;
               }
               console.log(co + ", *****!!!****** use " + tw + ", h " + th);
                q = 60;
             }
         }
         
         var source;
         var dest;
         try {
              source = Camera.PictureSourceType.CAMERA;
              dest = Camera.DestinationType.FILE_URI;
         }
         catch (e) {  console.log(e);}
         var save = false; // don't save to photo album 
         if (attrs.source == "album") {
             save = false;
             try {
             source = Camera.PictureSourceType.SAVEDPHOTOALBUM;
             }
             catch (e) {  console.log(e);}
         }
         else if (attrs.source == "library") {
             try {
             source = Camera.PictureSourceType.PHOTOLIBRARY;
             }
             catch (e) {  console.log(e);}
             save = false;
         }
         elm.on('click', function() {
             try {
                setParam();
                navigator.camera.getPicture(function (imageURI) {
                    scope.$apply(function() {
                      ctrl.$setViewValue(imageURI);
                   });
                }, function (err) {
                   ctrl.$setValidity('error', false);
                }, 

                { 
                quality: q, //18 - for android, //50, 
                correctOrientation: co ? true : false,
                targetWidth: tw,
                targetHeight: th,
                sourceType: source,
                saveToPhotoAlbum: save,
                destinationType: dest 
                }
                );
             }
             catch (e) {  console.log(e);}

      });
    }
   }
})

var gHavetouch = false;
