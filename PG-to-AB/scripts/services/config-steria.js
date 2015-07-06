var config = angular.module("config.steria", [])
.run(function($rootScope) {
	$rootScope.config = {
        FILESIZE: 120,
        CHUNK: 1048566*4,
        MAXPHOTOS: 5,
        development: false,
        noencryption: false,
		logonPage: true,
        requestTimeout: 10000,
        syncInterval: 10*60*1000, // 10 mins
        autoSync: false, // true if you want 10 min sync
		idleTimeout: 45 * 60 * 1000, // seconds * 1000 == 45 mins
		version: '1.1', // client version
                
//       target: 'http://192.168.1.9:25888/YellowJacket',
        //target: 'http://206.132.43.219:8080/YellowJacketDev',
        
 //       target: 'https://mob-dev.yellowjacket.uk.net:9443/YellowJacketDev',  // dev box
//        docs: 'http://mob-dev.yellowjacket.uk.net:8080/yjdocs',  
//        fingerprint: 'AA C0 BD F4 79 20 77 C3 4D 5E 20 D5 62 26 C6 7F 68 B7 F3 75' // valid until 20 July 2015
         
//        target: 'https://mob-sit.yellowjacket.uk.net:9443/YellowJacket', // SIT box
//        docs: 'https://mob-sit.yellowjacket.uk.net:9443/yjdocs',
//        fingerprint: '69 83 51 BF 55 D3 52 41 F6 8C D6 36 39 A4 83 C2 8A 52 8A 11' //  valid until 20 July 2015 
        
        target: 'https://mob-prod.yellowjacket.uk.net:9443/YellowJacket', // PRODUCTION box
         docs: 'https://mob-prod.yellowjacket.uk.net:9443/yjdocs',
        fingerprint: '45 01 95 5D 15 A5 6D 32 A3 CC 18 8B 89 83 34 01 1D 01 59 FB' // Valid Until 21 July 2015
        
	}
})

