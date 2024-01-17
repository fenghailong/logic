// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'prod-2gzhco766f4e1e27'
});
const db = cloud.database();
const noteCollection = db.collection('notes');

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

// 更新笔记
const updateNotes = async (options) => {
  await noteCollection.doc(options.id).update({
    data: {
      content: options.content,
      _updateTime: Date.now()
    }
  })
}

// 删除笔记
const deleteNotes = async (options) => {
  await noteCollection.doc(options).remove()
}

exports.main = async (event, context) => {
  const { func, data } = event;
  // const { OPENID, APPID, UNIONID } = cloud.getWXContext();
  let res;
  if (func === 'addNotes') {
    res = await addNotes(data);
  } else if (func === 'deleteNotes') {
    res = await deleteNotes(data);
  } else if (func === 'getNotes') {
    res = await getNotes(data);
  } else if (func === 'updateNotes') {
    res = await updateNotes(data);
  }
  return res;
}
