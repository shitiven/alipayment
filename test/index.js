'use strict';

const request = require("supertest");
const Alipayment = require("..");
const assert = require("assert")
const fs = require('fs');
const url = require("url");
const querystring = require('querystring');

describe('SignTest', function() {
    
    it("#getSignString()", function() {
        var payment = new Alipayment({
            appId: "<appid>",
            privateKey:  fs.readFileSync(process.cwd() + '/test/RSAPrivateKey.pem', 'utf-8'),
            publicKey: fs.readFileSync(process.cwd() + '/test/AlipayPublicKey.pem', 'utf-8')
        });
        var signString = payment.getSignString({
            foo: "foo",
            bar: "bar",
            cow: "cow"
        })
        assert.equal(signString, "bar=bar&cow=cow&foo=foo");
    });


    it("#getSigned RSA string", function() {
        var payment = new Alipayment({
            appId: "<appid>",
            privateKey:  fs.readFileSync(process.cwd() + '/test/RSAPrivateKey.pem', 'utf-8'),
            publicKey: fs.readFileSync(process.cwd() + '/test/AlipayPublicKey.pem', 'utf-8')
        });
        var signed = payment.getSigned({
            foo: "foo",
            bar: "bar",
            cow: "cow",
            sign_type: "RSA"
        });

        assert.equal(signed, "Zu5vUCfhtkj9mEgT3Hty9Xt/TSwnXHBokW6nV7SsSorZ40EeIHiUfvmkFx1ikxSeZ/7JLIwI9Cgp64JToFvK8l6ZVZsX25dLvai+tfgZgpqIpmiJ9/4KroiGCJ9+c3t/ExyMjKbpaGoEpRrmhs7FvhZW3wG5Z8wg8uBpHP3w8Bc=");

    });

    it("#getSigned RSA2 string", function() {
        var payment = new Alipayment({
            appId: "<appid>",
            privateKey:  fs.readFileSync(process.cwd() + '/test/RSA2PrivateKey.pem', 'utf-8'),
            publicKey: fs.readFileSync(process.cwd() + '/test/AlipayPublicKey.pem', 'utf-8')
        });
        var signed = payment.getSigned({
            foo: "foo",
            bar: "bar",
            cow: "cow",
            sign_type: "RSA2"
        });
        assert.equal(signed, "jNQ7+0sMxcLW4rRzHrGLSeoPSxkeymMObk4UbaSimXBwK6dZq0gy4SdM4u/Da5iTdtQvquZhM2V33yOiFAckc64SbC5mA4NsoMGWgrxSqvWOsEN1Ojt09szzVfe2UOW8dG76aGlCyJ4clQaUHgMhJFmPl6e0KWz/bBnwadBgtjUNxdRcJoD9BKNy8WUl6/RTCzcsvuc/Cza1iwgsq1vZHfZRFhkfHNWuL4AHG7M9TIAJdedvH5d5l3v4hE+ZhlcLMgJG9OqE/FgJudtUpJeD7w0TqxLa2tnaASPB216MpZi2fVh+V3knFB6qUPMvfB7YOtsrhYI/uH/RHursUJLm2g==");
    });

    it("#verifySign RSA2 string", function() {

        var payment = new Alipayment({
            appId: "<appid>",
            privateKey:  fs.readFileSync(process.cwd() + '/test/RSA2PrivateKey.pem', 'utf-8'),
            publicKey: fs.readFileSync(process.cwd() + '/test/AlipayPublicKey.pem', 'utf-8')
        });
        var verifyResult = payment.verifySign({ total_amount: '100.00',
            timestamp: '2017-01-13 17:58:18',
            sign: 'dT07AiiOZenVdPK88RLM0HIeUQyzd9arWZKV5c3vXm0wcUrfNm2zcsY9dJwWQPjjKwLCH4UH46qakAy85aRUhWnxMqK05NcE6QfVLzzRxDFNM2RhoFyj0dALNBpWLhhfRsLSdQs38DCm83P4w+VvcMFTSx3gWkrc6bUamACxpPoPIi1vrP0ZPmY7Slum8a659t7BN7qzWJy7jIle4qr+1nmPpJu7nCe0Y1amTySfA+0GH2BrfxEiBagykDRVNvcAT06tY5owE7wfhFcHg2NnQf88uGY5Q9z5YtODk+HBLOoEsZOGVRqarRmZgO4HU91M58la8hv1Aj7ZMTyywTvgXA==',
            trade_no: '2017011321001004500200142841',
            sign_type: 'RSA2',
            auth_app_id: '2016060700099411',
            charset: 'utf-8',
            seller_id: '2088102168527493',
            method: 'alipay.trade.wap.pay.return',
            app_id: '2016060700099411',
            out_trade_no: '1484301467402',
            version: '1.0' 
        });
        assert(verifyResult, true);

    }); 

});

let tradePayment = new Alipayment({
    appId: "<appid>",
    privateKey:  fs.readFileSync(process.cwd() + '/test/RSA2PrivateKey.pem', 'utf-8'),
    publicKey: fs.readFileSync(process.cwd() + '/test/AlipayPublicKey.pem', 'utf-8'),
    gateway: "https://openapi.alipaydev.com/gateway.do"
});

describe('TradeTest', function() {

    it("#alipay.trade.wap.pay", function(done) {
        var time = new Date().getTime();
        var biz_content = JSON.stringify({
            body: "test" + time,
            subject: "test" + time,
            out_trade_no: time,
            total_amount: 100,
            product_code: "QUICK_WAP_PAY"
        });

        var params = {
            method: "alipay.trade.wap.pay",
            sign_type: "RSA2",
            return_url: "http://localhost:6200",
            biz_content: biz_content
        }
        let tradeURI =  tradePayment.getRequestURI(params);
        console.log(tradeURI)
        done();
    });

    it("#alipay.trade.query", function(done) {
        tradePayment.request({
            method: "alipay.trade.query",
            sign_type: "RSA2",
            biz_content: JSON.stringify({
                out_trade_no: "random"
            })
        }).then(function(body) {
            console.log(body);
            done();
        }).catch(function(err) {
            console.log(err);
        });
    });

    it("#alipay.trade.refund", function(done) {
        var time = new Date().getTime();
        tradePayment.request({
            method: "alipay.trade.refund",
            sign_type: "RSA2",
            biz_content: JSON.stringify({
                out_trade_no: "1484297169005",
                refund_amount: 10.0,
                out_request_no: "a1"
            })
        }).then(function(body) {
            console.log(body);
            done();
        }).catch(function(err) {
            console.log(err);
        });
    });

    it("#alipay.trade.close", function(done) {
        var time = new Date().getTime();
        tradePayment.request({
            method: "alipay.trade.close",
            sign_type: "RSA2",
            biz_content: JSON.stringify({
                out_trade_no: "1484297169005",
            })
        }).then(function(body) {
            console.log(body);
            done();
        }).catch(function(err) {
            console.log(err);
        });
    });

});