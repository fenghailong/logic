// 云函数入口文件
const cloud = require('wx-server-sdk')
const sub_mch_id = '1504128871'
const env = 'prod-2gzhco766f4e1e27'

cloud.init({
  env,
});
const db = cloud.database();
const collectionOrder = db.collection('pay_order');
const collectionUser = db.collection('user');

// 改变用户成为会员
const changeUserToMember = async (_openid) => {
  let hasUser = await collectionUser.where({ wechat_openid: _openid }).get();
  if (Array.isArray(hasUser.data) && hasUser.data.length === 0) {
    return '用户不存在'
  } else {
    let result = await collectionUser.where({ wechat_openid: _openid }).update({
      // data 传入需要局部更新的数据
      data: {
        // 表示将 done 字段置为 true
        isMember: '1'
      }
    })
    console.log(result, '用户已成为会员')
    return '用户已成为会员'
  }
}

exports.main = async (event, context) => {
  console.log(event)
  const { OPENID } = cloud.getWXContext();
  let { resultCode, outTradeNo, transactionId } = event
  let status = resultCode === 'SUCCESS' ? '1' : '2'
  let params = {
    event,
    transactionId,
    status
  }
  await collectionOrder.where({
    outTradeNo: outTradeNo
  })
  .update({
    data: params
  })
  if (resultCode === 'SUCCESS') {
    await changeUserToMember(OPENID)
  }
  return {
    return_code: 'SUCCESS',
    return_msg: 'OK'
  };
}