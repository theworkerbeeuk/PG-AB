'use strict';

angular.module('yellowJacketApp')
    .service('cryptoService', function ($rootScope) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    var cs = {};


    cs.encipher = function (val) {
        if ($rootScope.config.noencryption) return val;
        if(val == null) return null; // don't cipher null.
        //console.log('cipher [' + val + ']');
        try {
            var plain = JSON.stringify(val);
            var key = $rootScope.keyValue;
            if (key == null) {
                console.log("*******  encipher NO KEY CryptoService");
            }
//          var encrypted = CryptoJS.DES.encrypt(plain, key);
            var encrypted = CryptoJS.AES.encrypt(plain, key);
        //    console.log('x_cipher [' + encrypted + ']');
            return encrypted;
        } catch (ex) {
            //alert(ex);
            return null;
        }

    }

    cs.decipher = function (val) {
        if ($rootScope.config.noencryption) return val;

        var tmp;
        if (val == null) return null; // don't decipher null
        try {
            var key = $rootScope.keyValue;
            if (key == null) {
                console.log("*******  decipher NO KEY CryptoService");
            }
//            tmp = CryptoJS.DES.decrypt(val, key).toString(CryptoJS.enc.Utf8);
            tmp = CryptoJS.AES.decrypt(val, key).toString(CryptoJS.enc.Utf8);
            return JSON.parse(tmp);
        } catch (ex) {
            //alert(tempstr);
//            alert(ex +",<"+val+">");
            return null;
        }
    }

    return cs;

});