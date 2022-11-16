const cloud = require('wx-server-sdk');
cloud.init({
  env:'gwybbs-0gkv8q1q39862d8c'
});
const db = cloud.database();
const collection = db.collection('users');

const addUser = async (_openid, data) => {
  const hasUser = await collection.where({ wechat_openid: _openid }).get();
  if (Array.isArray(hasUser.data) && hasUser.data.length === 0) {
    await collection.add({
      data: {
        wechat_openid: _openid,
        userInfo: {}
      }
    });
  } else {
    await collection.doc(data._id).update({
      data: {
        userInfo: data.userInfo
      }
    });
  }
  return data.userInfo;
}

const getUser = async (_openid) => {
  let user;
  const hasUser = await collection.where({ wechat_openid: _openid }).get();
  if (Array.isArray(hasUser.data) && hasUser.data.length === 0) {
    user = addUser(_openid, {});
  } else {
    user = hasUser.data;
  }
  return user;
}


exports.main = async (event, context) => {
  const { func, data } = event;
  const { OPENID, APPID, UNIONID } = cloud.getWXContext();
  let res;
  if (func === 'addUser') {
    res = await addUser(OPENID, data);
  } else if (func === 'getUser') {
    res = await getUser(OPENID);
  } else if (func === 'updateUser') {
    res = await addUser(OPENID, data);
  }
  return res;
}
