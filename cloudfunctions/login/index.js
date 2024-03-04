// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init({
  env:'prod-2gzhco766f4e1e27'
});
const db = cloud.database();
const collection = db.collection('user');

const login = async (_openid) => {
  console.log(_openid)
  // _openid = 'oDr_s0Pyv1Zy9FivV2Ud2l8fnz18'
  let user;
  let hasUser = await collection.where({ wechat_openid: _openid }).get();
  let hasMessage = await db.collection('messages').where({ wechat_openid: _openid, isUse: '2' }).count();
  console.log(hasUser)
  console.log(hasMessage, '===========')
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
    hasUser.data[0].messageCount = hasMessage.total
    user = hasUser.data;
  } else {
    hasUser.data[0].messageCount = hasMessage.total
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

// 更新用户的资料
const updateUser = async (options, OPENID) => {
  let hasUser = await collection.where({ wechat_openid: OPENID }).get();
  if (Array.isArray(hasUser.data) && hasUser.data.length === 0) {
    return '用户不存在'
  } else {
    await collection.doc(hasUser.data[0]._id).update({
      data: {
        nickName: options.nickName,
        avatarUrl: options.avatarUrl
      }
    })
    return '用户名已经更新'
  }
}

//获取人数
const getUserCount = async (options, OPENID) => {
  let userCount = await collection.count();
  userCount.total =  Number(userCount.total) + 14000
  return userCount
}


exports.main = async (event, context) => {
  const { func, data } = event;
  const { OPENID } = cloud.getWXContext();
  let res;
  if (func === 'login') {
    res = await login(OPENID);
  } else if (func === 'getPhoneNum') {
    res = await getPhoneNum(data, OPENID);
  } else if (func === 'updateUser') {
    res = await updateUser(data, OPENID);
  } else if (func === 'getUserCount') {
    res = await getUserCount(data, OPENID);
  }
  return res;
}
