const cloud = require('wx-server-sdk');
cloud.init({
  env:'gwybbs-0gkv8q1q39862d8c'
});
const db = cloud.database();
const collection = db.collection('topics');

const getUuid = () => {
  var s = [];
  var hexDigits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = "4"
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1)
  s[8] = s[13] = s[18] = s[23] = "-"
  let uuid = s.join("")
  return uuid
}

const addReply = async (data) => {
  const hasTopic = await collection.where({ _id: data.topic_id }).get();
  if (Array.isArray(hasTopic.data) && hasTopic.data.length === 0) {
    return "未找到话题"
  } else {
    let options = {
      _id : getUuid(),
      content: data.content,
      create_time: Date.now(),
      userInfo: data.userInfo,
      user_id: data.user_id
    }
    let replyMessage = hasTopic.data[0].replyMessage
    let reply_count = hasTopic.data[0].reply_count
    reply_count += 1
    replyMessage.push(options)
    await collection.where({ _id: data.topic_id }).update({
      data: {
        replyMessage,
        reply_count,
        _updateTime: options.create_time
      }
    });
    return {
      code: 200,
      data: {},
      message: "评论成功"
    }
  }
}


exports.main = async (event, context) => {
  const { func, data } = event;
  const { OPENID, APPID, UNIONID } = cloud.getWXContext();
  let res;
  if (func === 'addReply') {
    res = await addReply(data);
  }
  return res;
}
