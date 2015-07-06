/**
 * ConsoleServiceJS - Unity Console Services
 * @version v0.2.1 - 2012-10-28
 */;
(function (global, angular) {
    'use strict';


    angular.module('services.steria', []).
    //	value('target', 'http://206.132.43.219:8080/YelllowJacketServer-1.0.0-R1.0-1').

    // If you get unexpected token means you haven't got the right code in the server (you have older code)
    value('target', 'http://206.132.43.219:8080/YellowJacketServer-1.0.0-R1.0-1').
    value('username', 's').
    value('password', 's').
    provider('unityService', function () {
        this.$get = ['$rootScope', '$http', '$q', '$log', 'target', 'username', 'password', 'cryptoService', function ($rootScope, $http, $q, $log, target, username, password, cryptoService) {
                function login(orig, deferred) {
                     if ($rootScope.sslBad) {
                        deferred.reject('');
                        return;
                     }
                    var un, pwd;
                    
                    if(!$rootScope.uname) {
//                     console.log('loading uname ');
                       var tmp = loadObject("user");
                       $rootScope.uname = tmp.userId;
//                     console.log('loaded: '+$rootScope.uname);
                    }
                    if(!$rootScope.pword) {
//                     console.log('loading pword ');
                      $rootScope.pword = loadObject('userpwd');
//                     console.log('loaded: '+$rootScope.pword);
                    }

                    if ($rootScope.uname) un = $rootScope.uname;
                    if ($rootScope.pword) pwd = $rootScope.pword;
                    if ($rootScope.config.target) target = $rootScope.config.target;
                    console.log('using id ('+un+':'+pwd+')');
                    $http.jsonp(target + '/j_spring_security_check?j_username=' + un + '&j_password=' + pwd + '&callback=JSON_CALLBACK').success(function (data, status, headers, config) {
                        if (data.success == "true") {
                            console.log('Done logging ' + data.targetUrl);
                            // ok retry the target we successfully logged in..
                            $rootScope.loggedOn = true;
                            $http.jsonp(orig).success(function (data) {
                                deferred.resolve(data);
                            })
                                .error(function (data) {
                                deferred.reject(data);
                            });
                        } else {
                            $log.error(status + ", login failure " + data);
                            deferred.reject('');
                        }
                    }).error(function (data, status, headers, config) {
                        $log.error(status + ", login failure " + data);
                        deferred.reject('');
                    });
                }

                return {
                    fetch: function (request) {
                        
                        var def = $q.defer();
                        var p = def.promise;
                        p.done = function (fn) {
                            p.then(function (data) {
                                fn(data);
                            });
                            return p;
                        };

                        p.error = function (fn) {
                            p.then(null, function (data) {
                                fn(data);
                            });
                            return p;
                        };
                        
                        
                        if ($rootScope.isDevice) {
                            var networkState= checkConnection(); // checking here <-- device has to be ready before we do this. 
                            $rootScope.haveWifi = isBroadband(networkState);
                            $rootScope.haveG3 = isMobile(networkState);
                            
                            var netprefs = loadObject("netprefs");
//                            console.log("Net prefs " + JSON.stringify(netprefs) + ", havewifi " + $rootScope.haveWifi
//                                       + ", have3G " + $rootScope.haveG3);
                            
                            if (netprefs) {
                                if (netprefs.wifi && $rootScope.haveWifi) {
                                    //console.log('pref wifi & have wifi');// ok
                                }
                                else if (netprefs.g3 && $rootScope.haveG3) {
                                	//console.log('pref 3g & have 3g');// ok
                                }
                                else { // panga
                                	//console.log('pref & connection NOT matched');
                                	def.reject('NONET');
                                    return p;
                                }
                            } else {
                            	console.log('netprefs are null');
                            	// net prefs are NULL... (we did a dereg and they're not set yet!!) ERROR 643 - SF
                            	if($rootScope.haveG3 || $rootScope.haveWifi) {
                                	//console.log('- but its OK because either wifi or 3g is up!');
                                	// ok
                            	} else {
                                	//console.log('- and its NOT OK because neither wifi or 3g is up!');
    								def.reject('NONET');
    								return p;
    							}
                            }
                        }
                     
                        if ($rootScope.sslBad) {
                            def.reject('');
                            return p;
                        }

                        if ($rootScope.config.target) target = $rootScope.config.target;

                        var where = target + request;
                        var add = "?";
                        if (request.indexOf("?") != -1) add = "&";

                        where = where + add + "callback=JSON_CALLBACK";
                        
                        var lix = where.length;
                        if (lix > 1024) lix = 1024;
                        $log.log("Request: ["+where.length+"] " + where.substr(0,lix));

                        var httpdefs = { timeout: $rootScope.config.requestTimeout };
                        $http.jsonp(where, httpdefs).
                        success(function (data, status, headers, config) {
                            //console.log('Fetch ' + data);
                            def.resolve(data);
                        }).
                        error(function (data, status, headers, config) {
                            // called asynchronously if an error occurs
                            // or server returns response with status
                            // code outside of the <200, 400) range
                            console.log('error calling: ' + where + ", status: " + status);
                            //if ($rootScope.loggedOn == 'undefined' || $rootScope.loggedOn != true) {
                            login(where, def); //alway try logging in- maybe the server restarted
                            //}
                            //else {
                            //def.reject(data);
                            //}
                        });

                        

                        return p;
                    }
                }
   }]
    })
    /**
     * This service enables the application to get the string resources required by the application's UI
     * INTERNATIONALISATION METHODS
     */
        .service('appLocale', function ($q, $http, $timeout) {
        var getLocaleResources = function (culture) {
            var deferred = $q.defer();
            culture = culture || 'en';
            $timeout(function () {
                $http.
                get('scripts/i18n/angular-locale_' + culture + '.js').
                success(function (response) {
                    global.eval(response);
                }).
                error(function (response) {
                    console.log('Unable to locate AngularJS locale resource.');
                });
                $http.
                get('scripts/locale_' + culture + '/msg-resource.js').
                success(function (response) {
                    // remove first line onf var msg =
                    var i = response.indexOf("{");
                    response = angular.fromJson(response.substring(i));
                    deferred.resolve(response);
                }).
                error(function (response) {
                    console.log('Unable to locate application locale resource.');
                });
            });
            return deferred.promise;
        };
        return {
            getResources: getLocaleResources
        };
    })
        .factory('dbService', ['$q', '$window','cryptoService', function ($q, $window, cryptoService) {
            var db = {};
            var yjdb;

            db.write = function (name, value) {
                var cb = $q.defer();

                yjdb.transaction(function (tx) {
                    tx.executeSql("select value from yjnv where name=?", [name], function (tx, res) {
                        if (res.rows.length > 0) {
                            tx.executeSql("update yjnv set value=? where name=?", [value, name], function () {
                                cb.resolve('u');
                            });
                        } else {
                            tx.executeSql("insert into yjnv (name, value) values(?,?)", [name, value], function () {
                                cb.resolve('i');
                            });
                        }
                    });
                });
                return cb.promise;
            }
            
            db.delete = function (name, value) {
                var cb = $q.defer();
                
                yjdb.transaction(function (tx) {
                    tx.executeSql("delete from yjnv where name=?", [name], function (tx, res) {
                        cb.resolve('d');
                    });
                });
                return cb.promise;
            }
            
            db.read = function (name) {
                var cb = $q.defer();
                yjdb.transaction(function (tx) {
                    tx.executeSql("select value from yjnv where name=?", [name], function (tx, res) {
                        if (res.rows.length > 0) {
                            cb.resolve(cryptoService.decipher(res.rows.item(0).value));
                        } else {
                            cb.resolve(null);
                        }
                    });
                });
                return cb.promise;
            }

            
            var initing = false;

            db.init = function () {
                console.log('Using SQLite');
                var def = $q.defer();
                if (initing) {
                    def.resolve(1);
                    return def.promise;
                }
                initing = true;
                yjdb = $window.sqlitePlugin.openDatabase({name:"YJDB", bgType:0});
                yjdb.transaction(function (tx) {
                    //tx.executeSql('DROP TABLE IF EXISTS yjnv');
                    tx.executeSql('CREATE TABLE IF NOT EXISTS yjnv (name text primary key, value text)', [], function () {
                        console.log('>>>>>>>>> SQLite: table created');
                        def.resolve(1);
                    });
                });
                return def.promise;
            }

            db.drop = function () {
                if (yjdb)
                    initing = false;

                    yjdb.transaction(function (tx) {
                        tx.executeSql('DROP TABLE IF EXISTS yjnv');
                    });
            }

            return db;
    }])
        .factory('fileService', ['$rootScope','$q', '$http', '$window','cryptoService', function ($rootScope, $q, $http, $window, cryptoService) {
            var fs = {};
            var fileSys;
            var folder = "yj";
            var initing=false;
            var initDef;
            var dirEntry;
            
            var fsz = $rootScope.config.FILESIZE || 50;
            fs.len = 0;
            var errorHandler = function (e) {
                var msg = null;
                
                if (!e) return;
                switch (e.code) {
                case FileError.QUOTA_EXCEEDED_ERR:
                    msg = 'QUOTA_EXCEEDED_ERR';
                    break;
                case FileError.NOT_FOUND_ERR:
                    //msg = 'NOT_FOUND_ERR';
                    break;
                case FileError.SECURITY_ERR:
                    msg = 'SECURITY_ERR';
                    break;
                case FileError.INVALID_MODIFICATION_ERR:
                    msg = 'INVALID_MODIFICATION_ERR';
                    break;
                case FileError.INVALID_STATE_ERR:
                    msg = 'INVALID_STATE_ERR';
                    break;
                default:
                    msg = 'Unknown Error';
                    break;
                };

                if (msg)
                    console.log("???? Err " +msg);
                if (initDef) initDef.resolve(1);
            }

            fs.read = function (name) {
                console.log('WFS Load ' + name);
                var def = $q.defer();
                try {
                dirEntry.getFile(name, {}, function (fileEntry) {
                    // alert('read ' + name);
                    fileEntry.file(function (file) {
                        var reader = new FileReader();
                        reader.onloadend = function (e) {
                        	var src = this.result;
                            // undo Steve's mighty cludge and snip off the JSON disguise
                        	if((src != null) && (src.length > 2) && (src.substring(0,3)=='[a:')) {
                        		src = src.substring(4,src.length-2);
                        	}
                        	var clear= cryptoService.decipher(src);
                            def.resolve(clear);
                        };
                        reader.onerror = function (e) {
                            def.resolve(null);
                        }
                        reader.readAsText(file);
                    }, function (e) {
                        errorHandler(e);
                        def.resolve(null);
                    });

                }, function (e) {
                        errorHandler(e);
                        def.resolve(null);
                    });
                }
                catch(e) {
                    console.log("File read " + e);
                    def.resolve(null);
                }
                return def.promise;
            }

            var samsung = false;
            fs.write = function (name, val) {
                var def = $q.defer();
                fs.delete(name).then(function() { // funny bug -- delete first
                    
                    if (!val) {
                        console.log("WFS Store *** Warning " + name + " is null");
                        def.resolve('fail');
                        return def.promise;
                    }
                    console.log('WFS Store ' + name + ', ' + val.length);
                    fs.len += val.length;
                   
                    dirEntry.getFile(name, {
                        create: true
                    }, function (fileEntry) {
                        // Create a FileWriter object for our FileEntry (log.txt).
                        fileEntry.createWriter(function (fileWriter) {
                            fileWriter.onwriteend = function (e) {
                                def.resolve('done');
                            };
                            fileWriter.onerror = function (e) {
                                def.resolve('fail');
                            };

                            val = cryptoService.encipher(val);
                            var blob;
                            window.BlobBuilder = window.BlobBuilder ||
                            window.WebKitBlobBuilder ||
                            window.MozBlobBuilder ||
                            window.MSBlobBuilder;
                            var b = BrowserDetection.name();
                            var andy = navigator.userAgent.match(/Android/);
                            try {
                            	//console.log("Andy " + andy + ", b " + b);
                            	if (andy || samsung) { //samsung tablet
                            		 var bb = new BlobBuilder();
                                     bb.append(val);
                                     blob = bb.getBlob('text/plain');
                            	}
                            	else {
	                                blob = new Blob([val], {
	                                    type: 'text/plain'
	                                });
                            	}
                            }
                            catch(ex) {
                                 console.log("?? EX " + ex.name + ", nm: " + name + ", l " + val.toString().length);    
                                 blob = '[a:\''+val+'\']'; // hmm - Steve's mighty cludge - make it into JSON!
                            }
                            try {
                            	fileWriter.write(blob); //blob does not work in w8
                            }
                            catch(e) {
                            	console.log('*&*&*&*&*&* trapped blob FAIL : '+e+'['+val.toString().length+']');
                            }

                        }, function (e) {
                            errorHandler(e);
                            def.resolve(null);
                        });

                    }, function (e) {
                            errorHandler(e);
                            def.resolve(null);
                        });

                   
                })
                return def.promise;
            }

            fs.delete = function (name) {
                var def = $q.defer();
                dirEntry.getFile(name, {
                    create: false
                }, function (fileEntry) {
                    fileEntry.remove(function () {
                        console.log('File removed ' +name);
                        def.resolve(1);
                    }, function (e) {
                        errorHandler(e);
                        def.resolve(null);
                    });

                }, function (e) {
                        errorHandler(e);
                        def.resolve(null);
                    });
                
                return def.promise;
            }
            fs.drop = function () {
                var def = $q.defer();
                
                dirEntry.removeRecursively(function() {
                        console.log("FS dropped ");
                        initDef = $q.defer();
                        
                        fs.onInitFs(fileSys);
                        initDef.promise.then(function() {
                            console.log("FS dir created ");
                            def.resolve(1);
                        })
                    }, 
                    function(e) {
                        console.log('Excep during drop ' + e); 
                        def.resolve(1); 
                    });
                
//                console.log("FS len " + fs.len);
//                fs.len = 0;
//                var dirReader = dirEntry.createReader();
//                var entries = [];
//                initing = false;
//
//                // Call the reader.readEntries() until no more results are returned.
//                var readEntries = function () {
//                    dirReader.readEntries(function (results) {
//                        if (!results.length) {
//                            for (var i = 0; i < entries.length; i++) {
//                                var en = entries[i];
//                                var fp = en.fullPath;
//                                console.log("Remove " + fp);
//                                fs.delete(fp);
//                            }
//                            def.resolve(1);
//                        } else {
//                            entries = entries.concat(results);
//                            readEntries();
//                        }
//                    }, function (e) {
//                        errorHandler(e);
//                        def.resolve(null);
//                    });
//                }
//
//                readEntries();
                return def.promise;
            }

            
            var testLarge = function() {
                var add = "";
                for (var v = 0; v < 1048566; v++) add += "0"; // 1M
//                for (var v = 0; v < 48566; v++) add += "0"; // 1M
                var MAI = 50; 
                var recur = function (ix) {
                    if (ix > MAI) {
                        for (var i = 0; i < MAI; i++) {
                            fs.read('test'+i).then(function(r) {
                                console.log(i +":read [" + r.length + "], " + r.substring(0,32));
                            });
                        }
                        fs.write('test89', 'replaced89').then(function () {
                            fs.read('test89').then(function(r) {
                                console.log('Updated ' + r);
                            })
                        });
                        return;
                    }
                    fs.write('test'+ix, ix+add).then(function (v) {
                         console.log('Stored ' + 'test'+ix + "-" +v);
                        recur(++ix)
                    })
                }
                recur(0);            	
            }
            
            fs.onInitFs = function (fsys) {
                console.log('fs.....', fsys);
                try {
                   if (device) {
                      samsung = device.model.indexOf('GT-I') != -1;
                   }
                }
                catch(e) {}
                
                var gotDir = function(de) {
                    dirEntry = de;
                    initDef.resolve(1);
                    //testLarge();
                }
                
                fileSys = fsys;
                var dataDir = fsys.root.getDirectory(folder, {create: true}, gotDir);
            }


            fs.init = function () {
                initDef = $q.defer();
                if (initing) {
                    initDef.resolve(1);
                    return initDef.promise;
                }
                initing = true;
                if (fileSys) {
                    initDef.resolve(1);
                    return initDef.promise;
                }
                console.log('Using FileSystem');
                    
                $window.requestFileSystem = $window.requestFileSystem || $window.webkitRequestFileSystem;
                if (!$rootScope.isDevice) {
                    $window.requestFileSystem($window.TEMPORARY, fsz * 1024 * 1024, fs.onInitFs, errorHandler);
                }
                else {
                    try { // strange timing bug in mobile...
                        $window.requestFileSystem($window.PERSISTENT, fsz * 1024 * 1024, fs.onInitFs, errorHandler);
                    }
                    catch (e) {
                        console.log(e);  

                        setTimeout(function() {
                            $window.requestFileSystem($window.PERSISTENT, fsz * 1024 * 1024, fs.onInitFs, errorHandler);
                        }, 2000)
                    }
                }
                initDef.promise.then(function() {
                    fs.write('fred', '*******test filesystem all ok')
                    .then(function (res) {
                        return fs.read('fred');
                    })
                    .then(function (v) {
                        console.log('read ' + v);
                    })
                    .then(function() {
                        return fs.delete('fred');
                    })
                    .then (function() {
                        return fs.read('fred');
                    })
                    .then(function (v) {
                        console.log('fredreadisNull ' + v);
                    })
                })
                return initDef.promise;
            }
            
            return fs;


    }]) //// fileService
    .factory('storage', ['$q', '$window', 'dbService','fileService','$timeout','cryptoService', function ($q, $window, dbService,fileService, $timeout, cryptoService) {
            var store = {};
            var db;
            var version = 2;

            var service = fileService;
        
            var wp = navigator.userAgent.match(/Windows Phone/);
            var b = BrowserDetection.name();
        
            // android samsung tablet is crashing with file storage even after blob fixes with segment violation
            // it thinks its safari
        
            // but indexdb only allows 5MB which is too small....
            //if (!wp) wp = b == "Safari" && navigator.userAgent.match(/Android/);
        
            var initing= false;
            store.init = function () {
                
                if (!wp) {
                    return service.init();
                } 
                
                var def = $q.defer();
                
                if (initing) {
                	 def.resolve(1);
                	 return def.promise;
                }
                initing = true;
                
                var req = $window.indexedDB.open('YJDB', version);
                req.onupgradeneeded = function (e) {
                    console.log("IDB opended " + e)
                    var dbi = e.target.result;

                    if (dbi.objectStoreNames.contains("yjidb")) {
                        //dbi.deleteObjectStore("yjidb");
                        console.log('deleted yjidb');
                    }
                    else {
                        console.log('create obj store');
                        var os = dbi.createObjectStore("yjidb", {
                            keyPath: "name"
                        });
                        os.createIndex("name", "name", {
                            unique: true
                        });
                    }
                }
                req.onsuccess = function (e) {
                    db = e.target.result;
                    console.log('DBI init success ' + db);
                    
                    var setVrequest = db.setVersion(version);  // cope with older indexed dbs
                    setVrequest.onsuccess = function(e) {
                    	console.log('set ver success ' + db);
                        if (!db.objectStoreNames.contains("yjidb")) {
                            console.log('create obj store');
	                        var os = db.createObjectStore("yjidb", {
	                            keyPath: "name"
	                        });
	                        os.createIndex("name", "name", {
	                            unique: true
	                        });
                        }
                        def.resolve(1);
                        store.doTests();
                    };  // need to resolve if not success             
                }
                return def.promise;
            }

            store.save = function (n, v) {
                if (!wp) return service.write(n, v);
                
                var def = $q.defer();
                store.del(n).then(function() {
                	
                 try {
                    var trans = db.transaction(["yjidb"], "readwrite");
                    var os = trans.objectStore("yjidb");

                    var d = {
                        name: n,
                        val: cryptoService.encipher(v)
                    };
                    var request = os.put(d);
                    request.onsuccess = function (e) {
                        def.resolve(n);
                    }
                    request.onerror = function (e) {
                    	//os.update(d);
                        console.log(n + ":Error "+ e);
                        def.resolve(n);
                    }
                }
                catch (e) {
                    console.log('Exp ' + e);
                    def.resolve(null);
                }
                })

                return def.promise;
                    
            }
            store.load = function (n) {
                if (!wp) return service.read(n);
                    
                var def = $q.defer();
                try {
                    var trans = db.transaction(["yjidb"]);
                    var os = trans.objectStore("yjidb");
                    var index = os.index("name");

                    var req = index.get(n);
                    req.onsuccess = function (e) {
                        if (req.result) {
                            def.resolve(cryptoService.decipher(req.result.val));
                        }
                        else {
                            def.resolve(null);
                        }
                    }                
                    req.onerror = function (e) {
                        def.resolve(null);
                        console.log(n + ":Err ", e);
                    }
                }
                catch (e) {
                    console.log(n+", excep ", e);
                    def.resolve(null);
                }
                return def.promise;

            }
            store.del = function(n) {
                if (!wp) return service.delete(n);
                var def = $q.defer();
                try {
                    var trans = db.transaction(["yjidb"],'readwrite');
                    var os = trans.objectStore("yjidb");
                    var req = os.delete(n);
                    req.onsuccess = function (e) {
                        if (req.result) {
                            def.resolve(req.result);
                        }
                        else {
                            def.resolve(null);
                        }
                    }                
                    req.onerror = function (e) {
                        def.resolve(null);
                        console.log(n + ":Err ", e);
                    }
                }
                catch (e) {
                    console.log("Excep ", e);
                    def.resolve(null);
                }             
                return def.promise;
             }
            
            var goes = 5;
            store.remove = function() {
                if (!wp)  return service.drop();
                var def = $q.defer();
                try {
                	console.log("Rmove")
                    var trans = db.transaction(["yjidb"],'readwrite');
                    var os = trans.objectStore("yjidb");
                    var req = os.clear();
                    req.onsuccess = function(e) {
                        console.log("Cleared " + e);
                        def.resolve(1);
                    }
                    req.onerror = function(e) {
                        console.log("Err " + e);
                        def.resolve(0);
                    }
                }
                catch(e) {
                }
                return def.promise;
                
//                if (db) db.close();
//                initing = false;
//                var req = $window.indexedDB.deleteDatabase('YJDB');
//                req.onblocked = function(e) { 
//                    console.log("deleteDatbase got blocked event ", e);
//                    $timeout(function() {
//                        if (goes < 0) return; // give up
//                        store.remove(); // try again if blocked.
//                    }, 6000); // ek minute
//                }
//                req.onsuccess = function (e) {
//                    console.log("Deleted database successfully ",e);
//                };
//                req.onerror = function () {
//                    console.log("Couldn't delete database");
//                }
            }
            
            
            store.test = function () {
                // need to do one at a time...
                var add = "";
                for (var v = 0; v < 1048566; v++) add += "0"; // 1M
                var MAI = 100; 
                var recur = function (ix) {
                    if (ix > MAI) {
                        for (var i = 0; i < MAI; i++) {
                            store.load('test'+i).then(function(r) {
                                
                                console.log(i +":read [" + r.length + "], " + r.substring(0,32));
                            });
                        }
                        store.save('test89', 'replaced89').then(function () {
                            store.load('test89').then(function(r) {
                                console.log('Updated ' + r);
                            })
                        });
                        return;
                    }
                    store.save('test'+ix, ix+add).then(function (v) {
                         console.log('Stored ' + 'test'+ix + "-" +v);
                        recur(++ix)
                    })
                }
                recur(0);
            }

            store.testDelete = function() {
                store.save('item', 'need to delete').then(function() {
                    store.load('item').then(function(v) {
                        console.log('ok loaded ' + v);
                        store.del('item').then(function(v) {
                            console.log('should be gone ' + v);
                            store.load('item').then(function(v) {
                                console.log('ok loaded2 should be empty ' + v);
                            })
                        })
                    })
                })
            }

            // want some karma testing really....but what about in the phone!!!
            store.doTests = function() {
                store.save('item','saved ok').then(function() {
            		 store.load('item').then(function(v) {
            			 console.log("********** item read: " +v)
            			 
            			 
            			 store.save('item','s2aved ok').then(function() {
            				 store.load('item').then(function(v) {
            					 console.log("********** item read: " +v)
            		 		})
            		 	})
            		 })
            	 })
                //// store.test();
                /* delete */
                //store.testDelete();
            }
            
            return store;
   }])
 .directive('storeImg', ['storage', function(storage) {
       return {
          restrict: 'AE',
          scope: {prom:'='},
          require: "?ngModel",
          link: function(scope, elm, attrs, ctrl) {
              if (scope.prom) {
                  scope.prom.then(function() {
                      storage.load(attrs.ngSrc).then(function(data) {
                        elm.append("<img class='"+attrs.class+"' src='"+data+"'>");
                      })
                  })
              }
              else {
                      storage.load(attrs.ngSrc).then(function(data) {
                        elm.append("<img class='"+attrs.class+"' src='"+data+"'>");
                      })
              }
          }
       }
  }])
.directive('load', ['storage', function(storage) {
    return {
        restrict: 'AE',
        require: "?ngModel",
        link: function(scope, elm, attrs, ctrl) {
                console.log("Loading " + attrs.name);
            storage.load(attrs.name).then(function (data) {
                ctrl.$setViewValue(data);
            })
        }
    }
}])
    
.directive('splitText', function() {
    return {
        restrict: 'AE',
        link: function(scope, elm, attrs, ctrl) {

            var llen = 18;
            var _splitText = function(s) {
                if (s) {
                    var sa = s.split(" ");
                    var sp = [];
                    angular.forEach(sa, function(t, ix) {
                        if (t.length > llen) {
                            var tx = _splitText(t.substring(llen));
                            var ta = t.substring(0, llen); 
                            sp.push(ta);
                            sp = sp.concat(tx);
                        }
                        else 
                           sp.push(t)
                    });

                    var sps = sp.join(" ");
                    return sps;
                }
                return s;
            }

            var txt = _splitText(attrs.text);
            elm.append(txt);
            
        }
    }
})
    
}(this, angular));
