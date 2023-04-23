// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'prod-2gzhco766f4e1e27'
});
const db = cloud.database();
const collection = db.collection('knowledgeModule');
const evaluationCollection = db.collection('evaluation');

// 获取所有模块
const getAllModules = async (data) => {
  const result = await collection.where({ type: data.type, isTopParent: true }).get();
  console.log(result, '======')
  return result
}
// 获取单个模块下面的子集
const getModulesById = async (id) => {
  const result = await collection.where({ parent_id: id, isTopParent: false }).get();
  console.log(result, '======')
  return result
}

// 获取单个模块下面的考点
const getEvaluationById = async (id) => {
  const result = await evaluationCollection.where({ knowledgeModule_id: id }).get();
  console.log(result, '======')
  return result
}

exports.main = async (event, context) => {
  const { func, data } = event;
  // const { OPENID, APPID, UNIONID } = cloud.getWXContext();
  let res;
  if (func === 'getAllModules') {
    res = await getAllModules(data);
  } else if (func === 'getModulesById') {
    res = await getModulesById(data);
  } else if (func === 'getEvaluationById') {
    res = await getEvaluationById(data);
  }
  return res;
}
