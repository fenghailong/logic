// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init({
  env:'prod-2gzhco766f4e1e27'
});
const db = cloud.database();
const collection = db.collection('user');

const login = async (_openid) => {
  console.log(_openid)
  let user;
  let hasUser = await collection.where({ wechat_openid: _openid }).get();
  console.log(hasUser)
  if (Array.isArray(hasUser.data) && hasUser.data.length === 0) {
    await collection.add({
      data: {
        wechat_openid: _openid,
        avatarUrl: '',
        city: '',
        country: '',
        gender: 0,
        language: '',
        nickName: '',
        province: '',
        _createTime: Date.now(),
        _updateTime: Date.now()
      }
    });
    hasUser = await collection.where({ wechat_openid: _openid }).get();
    user = hasUser.data;
  } else {
    user = hasUser.data;
  }
  return user;
}

// 更新用户的手机号
const updateUserPhone = async (_openid, phoneNumber) => {
  let hasUser = await collection.where({ wechat_openid: _openid }).get();
  if (Array.isArray(hasUser.data) && hasUser.data.length === 0) {
    return '用户不存在'
  } else {
    await collection.doc(hasUser.data[0]._id).update({
      // data 传入需要局部更新的数据
      data: {
        phoneNumber: phoneNumber
      }
    })
    return '用户手机号已经更新'
  }
}

const getPhoneNum = async (options, OPENID) => {
  const result = await cloud.openapi.phonenumber.getPhoneNumber({
    code: options.code
  })
  if (result && result.phoneInfo && result.phoneInfo.phoneNumber) {
    let res = await updateUserPhone(OPENID, result.phoneInfo.phoneNumber)
    return res
  } else {
    return false
  }
}


exports.main = async (event, context) => {
  const { func, data } = event;
  const { OPENID, APPID, UNIONID } = cloud.getWXContext();
  let res;
  if (func === 'login') {
    res = await login(OPENID);
  } else if (func === 'getPhoneNum') {
    res = await getPhoneNum(data, OPENID);
  }
  return res;
}
