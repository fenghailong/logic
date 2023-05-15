// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'prod-2gzhco766f4e1e27'
});
const db = cloud.database();
const collection = db.collection('knowledgeDetail');
const collectionRecord = db.collection('generalRecord');

// 获取常识模块下的所有常识知识点
const getGeneralById = async (options) => {
  const countResult = await collection.where({ module_id: options.module_id }).count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = collection.where({ module_id: options.module_id }).skip(i * 100).limit(100).get()
    tasks.push(promise)
  }
  // 等待所有
  let result = (await Promise.all(tasks)).reduce((acc, cur) => {
    if(acc.length <= 0) acc.data = []
    if(cur.length <= 0) cur.data = []
    return {
      data: (acc.data.concat(cur.data)),
      errMsg: acc.errMsg,
    }
  },[])
  result.data = result.data || [] // 处理 没有数据时 reduce 结果 undefined 的情况
  result.total = total
  return result
}

// 获取常识模块下的所有常识知识点
const getGeneralQuery = async (options) => {
  console.log(options.pageIndex)
  console.log(options.pageCount)
  const countResult = await collection.where({ module_id: options.module_id }).count()
  const total = countResult.total
  // 计算需分几次取
  // const batchTimes = Math.ceil(total / 100)
  let result = await collection
  .where({ module_id: options.module_id })
  .skip(options.pageIndex)
  .limit(options.pageCount)
  .get()
  result.data = result.data || [] //
  result.total = total
  return result
}

// 获取某个模块下已经掌握的题目
const getAllStudyGeneralById = async (options) => {
  const countResult = await collectionRecord.where({ user_id: options.user_id, module_id: options.module_id}).count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = collectionRecord.where({ user_id: options.user_id, module_id: options.module_id}).skip(i * 100).limit(100).get()
    tasks.push(promise)
  }
  // 等待所有
  let result = (await Promise.all(tasks)).reduce((acc, cur) => {
    if(acc.length <= 0) acc.data = []
    if(cur.length <= 0) cur.data = []
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  },[])
  result.data = result.data || [] // 处理 没有数据时 reduce 结果 undefined 的情况
  return result
}

// 获取模块下的已经掌握的常识数量 和 模块下面的常识数量（除去已经掌握的）
const getAllGeneralInfo = async (data) => {
  const result = await getGeneralById(data) //分页列表
  const resultRecord = await getAllStudyGeneralById(data) // 记录列表
  let generalList = result.data
  let recordList = resultRecord.data
  let resList = []
  if (recordList.length > 0 && generalList.length > 0){
    generalList = generalList.map(element => {
      element.isStudyed = false
      recordList.forEach(item => {
        if (item.general_id == element._id) {
          element.isStudyed = true
        }
      })
      let temp = {}
      temp._id = element._id
      temp.title = element.title
      temp.isStudyed = element.isStudyed
      resList.push(temp)
    });
  }
  let res = {
    generalList: resList,
    generalCount: result.total,
    studyGeneralCount: recordList.length
  }
  return res;
}

// 增加常识学习记录
const addGeneralRecord = async (options) => {
  let hasRecord = await collectionRecord.where({ user_id: options.user_id, general_id: options.general_id}).get();
  if (Array.isArray(hasRecord.data) && hasRecord.data.length === 0) {
    await collectionRecord.add({
      data: {
        user_id: options.user_id,
        general_id: options.general_id,
        module_id: options.module_id,
        _createTime: Date.now(),
        _updateTime: Date.now()
      }
    })
  } else {
    return '已存在记录'
  }
}

// 获取单个模块下面的子集
const getKnowledgeDetailById = async (id) => {
  const result = await collection.where({ _id: id }).get();
  console.log(result, '======')
  return result
}

exports.main = async (event, context) => {
  const { func, data } = event;
  // const { OPENID, APPID, UNIONID } = cloud.getWXContext();
  let res;
  if (func === 'getAllGeneralInfo') {
    res = await getAllGeneralInfo(data);
  } else if (func === 'getKnowledgeDetailById') {
    res = await getKnowledgeDetailById(data);
  } else if (func === 'addGeneralRecord') {
    res = await addGeneralRecord(data);
  }
  return res;
}
