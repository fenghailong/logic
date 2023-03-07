const cloud = require('wx-server-sdk');
cloud.init({
  env:'prod-2gzhco766f4e1e27'
});
const db = cloud.database();

const addMessage = async (data, OPENID) => {
  console.log(data,'=============')
  try {
    const result = await db.collection('messages').add({
      data: {
        touser: OPENID,
        user_id: data.user_id,
        page: 'index',
        data: JSON.stringify(data.data),
        templateId: data.templateId,
        date: Date.now(),
        done: false,
        _createTime: Date.now(),
        _updateTime: Date.now()
      },
    });
    return result;
  } catch (err) {
    console.log(err);
    return err;
  }
};

exports.main = async (event, context) => {
  const { func, data } = event;
  const { OPENID, APPID, UNIONID } = cloud.getWXContext();
  let res;
  if (func === 'addMessage') {
    res = await addMessage(data,OPENID);
  }
  return res;
}