// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'prod-2gzhco766f4e1e27'
});
const db = cloud.database();
const collection = db.collection('knowledgeModule');
const evaluationCollection = db.collection('evaluation');
const evaluationRCollection = db.collection('evaluation_record');

// 获取某个模块下的所有题目
const getAllEvaluation = async () => {
  const countResult = await evaluationCollection.count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = evaluationCollection.skip(i * 100).limit(100).get()
    tasks.push(promise)
  }
  // 等待所有
  let result = (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  })
  return result
}

// 获取某个模块下已经掌握的题目
const getAllStudyEvaluationById = async (options) => {
  const countResult = await evaluationRCollection.where({ user_id: options.user_id, module_id: options.module_id}).count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = evaluationRCollection.where({ user_id: options.user_id, module_id: options.module_id}).skip(i * 100).limit(100).get()
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

// 获取模块下的已经掌握的题目数量 和 模块下面的题目（除去已经掌握的）
const getEvaluationById = async (data) => {
  const result = await getAllEvaluation()
  const resultRecord = await getAllStudyEvaluationById(data)
  let allEvaluation = result.data
  let allStudyEvaluation = []
  let resultEvaluation = allEvaluation.filter(item => {
    return !resultRecord.data.find(element => {
      return element.evaluation_id == item._id
    })
  })
  console.log(resultEvaluation, '=======')
  if (resultRecord.data.length > 0 && allEvaluation.length > 0){
    allEvaluation.forEach(element => {
      resultRecord.data.forEach(item => {
        if (item.evaluation_id == element._id) {
          allStudyEvaluation.push(element)
        }
      })
    });
  }
  let res = {
    resultEvaluation: data.isShuffle ? shuffle(resultEvaluation).slice(0,4) : resultEvaluation.slice(0,4),
    evaluationCount: allEvaluation.length,
    studyEvaluationCount: allStudyEvaluation.length
  }
  return res;
}

// 数组乱序
const shuffle = (array) => {
	var j, x, i;
	for (i = array.length; i; i--) {
		j = Math.floor(Math.random() * i);
		x = array[i - 1];
		array[i - 1] = array[j];
		array[j] = x;
	}
	return array;
}


// 增加考点评测记录
const addEvaluationRecord = async (options) => {
  let hasRecord = await evaluationRCollection.where({ user_id: options.user_id, evaluation_id: options.evaluation_id}).get();
  if (Array.isArray(hasRecord.data) && hasRecord.data.length === 0) {
    await evaluationRCollection.add({
      data: {
        user_id: options.user_id,
        evaluation_id: options.evaluation_id,
        module_id: options.module_id,
        _createTime: Date.now(),
        _updateTime: Date.now()
      }
    })
  } else {
    return '已存在记录'
  }
}

// 获取所有模块
const getAllModules = async (data) => {
  const result = await collection.where({ type: data.type, isTopParent: true }).get();
  return result
}
// 获取单个模块下面的子集
const getModulesById = async (id) => {
  const result = await collection.where({ parent_id: id, isTopParent: false }).get();
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
  } else if (func === 'addEvaluationRecord') {
    res = await addEvaluationRecord(data);
  }
  return res;
}
