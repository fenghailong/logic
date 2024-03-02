// 云函数入口文件
const cloud = require('wx-server-sdk')
const sub_mch_id = '1504128871'
const env = 'prod-2gzhco766f4e1e27'

cloud.init({
  env,
});
const db = cloud.database();
const collectionOrder = db.collection('pay_order');

const uuid = function () {
	let $chars = '';
	let maxPos = $chars.length;
	let pwd = '';
	for (i = 0; i < 32; i++) {
		pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
	}
	return pwd;
}

const doPay = async (event, context) => {
  console.log(event, '========')
  const wxContext = cloud.getWXContext();
  let totalFee
  if(event.data.totalFeeType === '1') {
    totalFee = 590
  }else if(event.data.totalFeeType === '2') {
    totalFee = 1990
  }else if(event.data.totalFeeType === '3') {
    totalFee = 2990
  }else if(event.data.totalFeeType === '4') {
    totalFee = 3990
  } else {
    totalFee = 1990
  }
	let openId = wxContext.OPENID

	// const uid = uuid();
	// console.log(uid);
  console.log(wxContext)
  let body = "逻辑填空会员服务";
  let nonceStr = Math.random().toString(32).substring(2,13);
  let tempStamp = parseInt(Date.now() / 1000)
  let tradeType = 'JSAPI'
  let outTradeNo = 'test' + tempStamp + nonceStr;
  let spbillCreateIp = wxContext.CLIENTIP ? wxContext.CLIENTIP : wxContext.CLIENTIPV6;
  let functionName = 'backPay'

	const res = await cloud.cloudPay.unifiedOrder({
		body,
    nonceStr,
    tradeType,
		outTradeNo,
		spbillCreateIp,
		subMchId: sub_mch_id,
		totalFee,
		envId: env,
		functionName
	})

	await collectionOrder.add({
		data: {
      wechat_openid: openId,
			body,
      outTradeNo,
			totalFee,
      totalFeeType: event.data.totalFeeType ? event.data.totalFeeType : '',
      status: 0,
      orderRes: res,
      _createTime: Date.now(),
      _updateTime: Date.now()
		}
	})
	return res
}

exports.main = async (event, context) => {
  const { func, data } = event;
  // const { OPENID, APPID, UNIONID } = cloud.getWXContext();
  let res;
  if (func === 'doPay') {
    res = await doPay(event, context);
  }
  return res;
}
