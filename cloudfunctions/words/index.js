// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'dev-2gm8v7dxd9491ded'
});
const db = cloud.database();
const collection = db.collection('words');
const getWordsCount = async (data) => {
  const result = await collection.get()
  console.log(result)
  const country= result.data.filter((item) => item.tag.includes('国考'));
  const countryHotWords = country.filter(item => item.count > 10)
  const publicExamHotWords = result.data.filter((item) => item.tag.includes('公考') && item.count > 10);
  const publicExamShotHotWords = result.data.filter((item) => item.type == 2 && item.count > 10);
  let res = { 
    countryCount: country.length, 
    countryHotWordsCount: countryHotWords.length, 
    publicExamHotWordsCount: publicExamHotWords.length, 
    publicExamShotHotWordsCount: publicExamShotHotWords.length 
  }
  console.log(res)
  return res;
}


// const getTopicById = async (_id) => {
//   const topic = await collection.doc(_id).get();
//   return topic
// }

// const addTopic = async (data) => {

//   let _createTime = Date.now();
//   let reply_count = 0;
//   await collection.add({
//     data: {
//       title: data.title,
//       body: data.content,
//       userInfo: data.userInfo,
//       user_id: data.user_id,
//       reply_count,
//       replyMessage: [],
//       _updateTime: _createTime,
//       _createTime
//     }
//   });
//   return {
//     code: 200,
//     data: {},
//     message: "发布成功"
//   }
// }

exports.main = async (event, context) => {
  const { func, data } = event;
  // const { OPENID, APPID, UNIONID } = cloud.getWXContext();
  let res;
  if (func === 'getWordsCount') {
    res = await getWordsCount(data);
  }
  else if (func === 'getTopicById') {
    res = await getTopicById(data);
  }
  else if (func === 'addTopic') {
    res = await addTopic(data);
  }
  return res;
}
