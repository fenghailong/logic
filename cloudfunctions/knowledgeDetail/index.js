// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'prod-2gzhco766f4e1e27'
});
const db = cloud.database();
const collection = db.collection('knowledgeDetail');

// 获取单个模块下面的子集
const getKnowledgeDetailById = async (id) => {
  const result = await collection.where({ module_id: id }).get();
  console.log(result, '======')
  return result
}

exports.main = async (event, context) => {
  const { func, data } = event;
  // const { OPENID, APPID, UNIONID } = cloud.getWXContext();
  let res;
  if (func === 'getKnowledgeDetailById') {
    res = await getKnowledgeDetailById(data);
  }
  return res;
}
