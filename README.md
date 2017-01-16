# alipayment
支付宝开放平台API Request For Nodejs，支持RSA和RSA2签名。

## Installation

```bash
$ npm install alipayment
```

## API

### 实例化
```js
var alipayment = new Alipayment({
     appId: "<APPID>",
     privateKey: "<应用私钥>", //需要PKCS8格式
     publicKey: "<支付宝公钥>"，
     gateway: "<支付网关地址>"
});
//gateway线上: https://openapi.alipay.com/gateway.do
//gateway sanbox: https://openapi.alipaydev.com/gateway.do  
```
### 获取wap支付地址
```js
/*
 * @params <object> 请求参数
 * @return  <string> 需要跳转的支付地址
*/

tradePayment.getRequestURI({
    method: "alipay.trade.wap.pay",
    sign_type: "RSA2",
    return_url: "http://localhost:8200",
    biz_content: JSON.stringify({
        body:  "支付测试",
        subject: "支付测试",
        out_trade_no: "201688888",
        total_amount: 1.0,
        product_code: "QUICK_WAP_PAY"
    })
});

```

### 支付报文签名验证
```js
/*
 * @params <object> 支付异步或者Return回调请求参数
 * @return <true | false>
 */
tradePayment.verifySign(params)
```

###  订单查询
```js
tradePayment.request({
    method: "alipay.trade.query",
    sign_type: "RSA2",
    biz_content: JSON.stringify({
        out_trade_no: <商户订单号>
    })
}).then(function(body) {
    console.log(body);
}).catch(function(err) {
    console.log(err);
});
```

### 其他API请求参数，请参看以下链接

* - [API列表](https://doc.open.alipay.com/doc2/apiList?docType=4)
* - [沙箱环境](https://openhome.alipay.com/platform/appDaily.htm?tab=info)
* - [RSA秘钥生成](https://doc.open.alipay.com/docs/doc.htm?spm=a219a.7386797.0.0.PNdmVN&treeId=58&articleId=103242&docType=1)