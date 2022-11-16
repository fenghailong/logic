// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'gwybbs-0gkv8q1q39862d8c'
});
const db = cloud.database();
const collection = db.collection('topics');

const getTopics = async (data) => {
  const MAX_LIMIT = data.pageCount
  const page = data.currentPage

  const topics = await collection
  .orderBy('_updateTime', 'desc')
  .skip((page - 1) * MAX_LIMIT)
  .limit(MAX_LIMIT)
  .get()
  return topics;
}

const getTopicById = async (_id) => {
  const topic = await collection.doc(_id).get();
  return topic
}

const addTopic = async (data) => {

  let _createTime = Date.now();
  let reply_count = 0;
  await collection.add({
    data: {
      title: data.title,
      body: data.content,
      userInfo: data.userInfo,
      user_id: data.user_id,
      reply_count,
      replyMessage: [],
      _updateTime: _createTime,
      _createTime
    }
  });
  return {
    code: 200,
    data: {},
    message: "发布成功"
  }
}

exports.main = async (event, context) => {
  const { func, data } = event;
  console.log(data)
  // const { OPENID, APPID, UNIONID } = cloud.getWXContext();
  let res;
  if (func === 'getTopics') {
    res = await getTopics(data);
  }
  else if (func === 'getTopicById') {
    res = await getTopicById(data);
  }
  else if (func === 'addTopic') {
    res = await addTopic(data);
  }
  return res;
}

// // 云函数入口函数
// exports.main = async (event, context) => {
//   const wxContext = cloud.getWXContext()

//   let data = await db.collection('topics').get()

//   return {
//     event,
//     data,
//     openid: wxContext.OPENID,
//     appid: wxContext.APPID,
//     unionid: wxContext.UNIONID
//   }
// }
