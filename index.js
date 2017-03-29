"use strict";

const DEBUG = (process.env.DEBUG !== undefined);
const request = require('request');
const crypto = require('crypto');
const ursa = require("ursa");
const queryString = require('querystring');
const _ = require('underscore');
const moment = require('moment');

// const productionGateway = "https://openapi.alipay.com/gateway.do";
// const sandboxGateway = "https://openapi.alipaydev.com/gateway.do";

let Alipayment = function (config) {

    this.appId = config.appId;
    this.gateway = config.gateway;

    this.privateKey = config.privateKey;
    this.publicKey = config.publicKey;

    return this;

}

Alipayment.prototype.verifySign = function(params) {

    let signType = {
        "RSA": "sha1",
        "RSA2":  "sha256"
    }[params.sign_type];

    let verify = ursa.createVerifier(signType);
    let signture = params.sign;

    delete params.sign;
    delete params.sign_type;
    let signString = this.getSignString(params);
    verify.update(signString);
    return verify.verify(ursa.createPublicKey(this.publicKey), signture, 'base64');

}

Alipayment.prototype.getSignString = function(params) {

    let sortKeys = Object.keys(params).sort();
    let sortedResult = sortKeys.map(function(key) {
        let value = params[key];
        return [key, value].join("=");
    });

    if (DEBUG) console.log("sortedResult: ", sortedResult);

    return sortedResult.join("&");
}

Alipayment.prototype.getSigned = function(params) {

    let signParams = _.clone(params);
    let signType = {
        "RSA": "sha1",
        "RSA2":  "sha256"
    }[signParams.sign_type];

    delete signParams["sign"];

    let verify = ursa.createPrivateKey(this.privateKey);
    let signString = this.getSignString(signParams);

    if (DEBUG) console.log("signString: ", signString);
    
    return verify.hashAndSign(signType, signString, "utf8", "base64");

}

Alipayment.prototype.getRequestURI = function(params) {

    params = _.defaults(params, {
        format: "JSON",
        charset: "utf-8",
        version: "1",
        timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
        app_id: this.appId
    });

    params.sign =  encodeURIComponent(this.getSigned(params));

    return this.gateway + "?" + this.getSignString(params);

}

Alipayment.prototype.request = function(params) {
    
    if(DEBUG) console.log("request params: ", params);

    let requestURI = this.getRequestURI(params);
    return new Promise(function(resolve, reject) {
        request.get(requestURI, function(err, res, body) {
            if (err) {
                return reject(err)
            }
            resolve(body);
        });
    })

};

module.exports = Alipayment;