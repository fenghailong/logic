// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'prod-2gzhco766f4e1e27'
});
const db = cloud.database();
const collection = db.collection('knowledgeDetail');
const noteCollection = db.collection('notes');

// 获取单个模块下面的子集
const getKnowledgeDetailById = async (id) => {
  const result = await collection.where({ module_id: id }).get();
  console.log(result, '======')
  return result
}

// 获取笔记
const getNotes = async (options) => {
  const result = await noteCollection.where({ module_id: options.module_id, user_id: options.user_id }).get();
  console.log(result, '======')
  return result
}

// 添加笔记
const addNotes = async (options) => {
  await noteCollection.add({
    data: {
      module_id: options.module_id,
      user_id: options.user_id,
      content: options.content,
      _createTime: Date.now(),
      _updateTime: Date.now()
    }
  })
}


exports.main = async (event, context) => {
  const { func, data } = event;
  // const { OPENID, APPID, UNIONID } = cloud.getWXContext();
  let res;
  if (func === 'getKnowledgeDetailById') {
    res = await getKnowledgeDetailById(data);
  } else if (func === 'addNotes') {
    res = await addNotes(data);
  } else if (func === 'getNotes') {
    res = await getNotes(data);
  }
  return res;
}
