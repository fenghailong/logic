// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'prod-2gzhco766f4e1e27'
});
const db = cloud.database();
const collection = db.collection('knowledgeModule');
const practiseCollection = db.collection('practise');
const evaluationCollection = db.collection('evaluation');
const examinationCollection = db.collection('examination');
const evaluationRCollection = db.collection('evaluation_record');
const $ = db.command.aggregate
const _ = db.command
// const questionRCollection = db.collection('evaluation_record');

// 获取某个模块下的所有题目
const getAllEvaluation = async (options) => {
  const countResult = await evaluationCollection.where({ knowledgeModule_id: options.module_id}).count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = evaluationCollection.where({ knowledgeModule_id: options.module_id}).skip(i * 100).limit(100).get()
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

// 获取某个模块下已经掌握的题目
const getAllStudyEvaluationById = async (options) => {
  const countResult = await evaluationRCollection.where({ user_id: options.user_id, module_id: options.module_id, isRight: '1'}).count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = evaluationRCollection.where({ user_id: options.user_id, module_id: options.module_id, isRight: '1'}).skip(i * 100).limit(100).get()
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
  const result = await getAllEvaluation(data)
  const resultRecord = await getAllStudyEvaluationById(data)
  let allEvaluation = result.data
  let allStudyEvaluation = []
  console.log(allEvaluation)
  console.log(resultRecord.data)
  let resultEvaluation = allEvaluation.filter(item => {
    return !resultRecord.data.find(element => {
      return element.evaluation_id == item._id
    })
  })
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

// 查询使用记录
const getEvaluationRecordCount = async (options) => {
  let recordCount = await evaluationRCollection.where({ user_id: options.user_id, module_id: options.module_id}).count()
  console.log(recordCount)
  return recordCount
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
        isRight: options.isRight,
        _createTime: Date.now(),
        _updateTime: Date.now()
      }
    })
    return '增加记录成功'
  } else {
    // 错误次数
    let count = hasRecord.data[0].count || 0
    if (options.isRight === '2') {
      count = count + 1
    }
    await evaluationRCollection.where({ user_id: options.user_id, evaluation_id: options.evaluation_id}).update({
      // data 传入需要局部更新的数据
      data: {
        count: count,
        isRight: options.isRight
      }
    })
    return '已更新记录'
  }
}

// 获取所有知识点模块
const getAllModules = async (data) => {
  const result = await collection.where({ type: data.type, isTopParent: true }).get();
  return result
}
// 获取单个模块下面的子集
const getModulesById = async (id) => {
  const result = await collection.where({
    parent_id: id,
    isTopParent: false,
    module_type: db.command.neq('2')
  }).orderBy('sort', 'desc').get();
  return result
}

// 获取单个模块下面的子集
const getModulesNewById = async (id) => {
  const result = await collection.where({
    parent_id: id,
    isCanUse: '1'
  }).orderBy('sort', 'desc').get();
  return result
}

// 获取单个刷题模块下面的子集，并判断是否已学习完成
const getModulesByTypeById = async (options) => {
  const result = await collection.where({
    new_parent_id: options.parent_id,
    // module_type: options.module_type
  }).get();
  return result
}


// 获取单个刷题模块下面的子集,并联表查询是否有练习记录
const getPractiseByUserModdule = async (options) => {
  const practise = await practiseCollection.where({
    module_id: options.module_id,
    user_id: options.user_id,
    isHistory: _.neq('1')
  }).get();
  return practise.data[0] || {};
}
const getExaminationCollectionByUserModdule = async (options) => {
  const examination = await examinationCollection.where({
    _id: options.examination_id
  }).get();
  return examination.data[0] || {};
}
const getModulesByPractise = async (options) => {
  console.log(options, '===============')
  const skipCount = (options.currPage - 1) * options.pageSize
  const countResult = await collection.where({ new_parent_id: options.parent_id, module_type: options.module_type, time: options.time}).count();
  const totalCount = countResult.total
  const totalPage = totalCount === 0 ? 0 : totalCount <= options.pageSize ? 1 : parseInt(totalCount / options.pageSize) + 1
  const result = await collection
  .where({ new_parent_id: options.parent_id, module_type: options.module_type, time: options.time})
  .orderBy('sort', 'asc')
  .skip(skipCount)
  .limit(options.pageSize)
  .get()
  for(var i =0;i<result.data.length;i++){
    let params = {
      user_id: options.user_id,
      module_id: result.data[i]._id,
    }
    let temp = await getPractiseByUserModdule(params)
    result.data[i].practise = {
      _id: temp._id,
      isComplete: temp.isComplete,
    }
    if(result.data[i].examination_id) {
      result.data[i].examination = await getExaminationCollectionByUserModdule({
        examination_id: result.data[i].examination_id
      })
    }
  }
  console.log(result)
  return {currPage: options.currPage, pageSize: options.pageSize, totalPage, totalCount, data: { list: result.data }}
}

// 清除百日刷题练习记录，将练习记录设置为历史
const clearQusetion = async (options) => {
  console.log(options)
  await practiseCollection.where({
    _id: options.practise_id
  }).update({
    // data 传入需要局部更新的数据
    data: {
      isHistory: '1'
    }
  })
}

exports.main = async (event, context) => {
  const { func, data } = event;
  // const { OPENID, APPID, UNIONID } = cloud.getWXContext();
  let res;
  if (func === 'getAllModules') {
    res = await getAllModules(data);
  } else if (func === 'getModulesById') {
    res = await getModulesById(data);
  } else if (func === 'getModulesNewById') {
    res = await getModulesNewById(data);
  } else if (func === 'getModulesByTypeById') {
    res = await getModulesByTypeById(data);
  } else if (func === 'getModulesByPractise') {
    res = await getModulesByPractise(data);
  } else if (func === 'getEvaluationById') {
    res = await getEvaluationById(data);
  } else if (func === 'addEvaluationRecord') {
    res = await addEvaluationRecord(data);
  } else if (func === 'getEvaluationRecordCount') {
    res = await getEvaluationRecordCount(data);
  } else if (func === 'clearQusetion') {
    res = await clearQusetion(data);
  }
  return res;
}
