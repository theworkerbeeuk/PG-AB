'use strict';

angular.module('yellowJacketApp')
    .service('pinService', function Pinservice($rootScope) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    /*
     * Save the failure counter
     */
    this.saveFailedCount =function(failCount) {
        localStorage.setItem("fcount", failCount);
//        console.log("saved fcount {" + failCount + "} [" + this.getFailedCount() + "]");
    }

    /*
     * Load the failure counter
     */
    this.getFailedCount = function() {
        var failCount = localStorage.getItem("fcount");
        if (failCount == null) {
            failCount = 0;
            localStorage.setItem("fcount", failCount);
        }
        return failCount;
    }

    /*
     * Load the Max fail count - its a constant here.
     */
    
    this.getMaxCount = function() {
        var max = 5;
        return max;
    }


    /*
     * Clear the Pin - this can be use primarily to ensure PIN can never be right!!
     */
    this.clearPin = function () {
        localStorage.setItem('pinHashValue', "");
        localStorage.setItem('fcount', "");
        return true;
    }

    /*
     * Check for PIN - this checks the user has initialized the PIN process
     */
    this.hasPin = function () {
        var value = localStorage.getItem('pinHashValue');
        //    console.log("pinHashValue is ["+value+"]");
        return (value != null && value.length != 0);
    }

    /*
     * Encipher (actually SHA256 hash) PIN - we can replace this with any discrete 
     * cipher function that gives a constant for a given PIN. Note PIN can be anything...
     */
    this.encypher = function (pin) {
             var key = $rootScope.keyValue;
             if(key == null) {
             alert('Error - Cipher is NULL');
             }
             //console.log('pin using cipher : '+key);
//        var encrypted = CryptoJS.SHA256(pin);
             var sha256 = CryptoJS.algo.SHA256.create();
             sha256.update($rootScope.keyValue);
             sha256.update(pin);
             var encrypted = sha256.finalize();
        return encrypted;
    }

    /*
     * Validate a pin and maintain failure count
     */
    this.check = function (pin) {
        var failCount = this.getFailedCount();
        //    console.log("fcount ["+failCount+"]");
        if (failCount < this.getMaxCount()) {
                //    console.log("checking pin : value ("+pin+")");
            var value = localStorage.getItem('pinHashValue');
                //    console.log("saved pin : pinHashValue ("+value+")");
            var key = $rootScope.keyValue;
            if(key == null) {
             alert('Big Problemn - Cipher is NULL');
            }
            //console.log('pin using cipher : '+key);
//            var encrypted = CryptoJS.SHA256(pin);
             var sha256 = CryptoJS.algo.SHA256.create();
             sha256.update($rootScope.keyValue);
             sha256.update(pin);
             var encrypted = sha256.finalize();
             
                  //  console.log("cipher {"+pin+"} : pinHashValue ("+encrypted+")");
            if (encrypted == value) {
                //console.log('pin match on : '+encrypted);
                // hooray - we have a matching pin!
                failCount = 0;
                this.saveFailedCount(failCount);
                //            console.log("saved fcount ["+getFailedCount()+"]");
                return true;
            };
            failCount++;
            this.saveFailedCount(failCount);
        }
        return false;
    }

    /*
     * Change the PIN from an old number to a new one.
     */
    this.setPin = function (oldPin, pin) {
        if (!this.check(oldPin)) return false;
        var key = $rootScope.keyValue;
        if(key == null) {
             alert('Error - Cipher is NULL');
        }
        //console.log('pin using cipher : '+key);
        //var pinHashValue = CryptoJS.SHA256(pin);
             var sha256 = CryptoJS.algo.SHA256.create();
             sha256.update($rootScope.keyValue);
             sha256.update(pin);
             var pinHashValue = sha256.finalize();
        localStorage.setItem("pinHashValue", pinHashValue);
        return true;
    }

    /*
     * Initialise an empty PIN - note this can only be callen when PIN
     * is NOT set!
     */
    this.initPin = function (pin) {
        if (this.hasPin()) return false; // can't use if PIN is set!
        var key = $rootScope.keyValue;
        if(key == null) {
             alert('Error - Cipher is NULL');
        }
        //console.log('pin using cipher : '+key);
             var sha256 = CryptoJS.algo.SHA256.create();
             sha256.update($rootScope.keyValue);
             sha256.update(pin);
             var cpin = sha256.finalize();
//        var cpin = CryptoJS.SHA256(pin);
        localStorage.setItem("pinHashValue", cpin);
//        console.log("Stored pin {" + pin + "} as [" + cpin + "]");
        localStorage.setItem("fcount", "0");
        return true;
    }

    this.changePin = function (old, pin) {
        if (this.check(old) == false) {
            //console.log("check of old PIN "+old+" failed.");
            return false; // can't set new pin if old PIN is not correct
        }
        var key = $rootScope.keyValue;
        if(key == null) {
            alert('Error - Cipher is NULL');
        }
        //console.log('using cipher : '+key);
             var sha256 = CryptoJS.algo.SHA256.create();
             sha256.update($rootScope.keyValue);
             sha256.update(pin);
             var cpin = sha256.finalize();
//        var cpin = CryptoJS.SHA256(pin);
        localStorage.setItem("pinHashValue", cpin);
//        console.log("Stored pin {" + pin + "} as [" + cpin + "]");
        localStorage.setItem("fcount", "0");
        return true;
    }
});