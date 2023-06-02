// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'prod-2gzhco766f4e1e27'
});
const db = cloud.database();
const questionCollection = db.collection('question');
const questionRCollection = db.collection('question_record');

// 获取某个模块下的所有题目
const getAllQuestion = async (options) => {
  const countResult = await questionCollection.where({ knowledgeModule_id: options.module_id}).count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = questionCollection.where({ knowledgeModule_id: options.module_id}).skip(i * 100).limit(100).get()
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
const getAllStudyQuestionById = async (options) => {
  const countResult = await questionRCollection.where({ user_id: options.user_id, module_id: options.module_id, isRight: '1'}).count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = questionRCollection.where({ user_id: options.user_id, module_id: options.module_id, isRight: '1'}).skip(i * 100).limit(100).get()
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
const getQuestionById = async (data) => {
  const result = await getAllQuestion(data)
  const resultRecord = await getAllStudyQuestionById(data)
  let allQuestion = result.data
  let allStudyQuestion = []
  console.log(allQuestion)
  console.log(resultRecord.data)
  let resultQuestion = allQuestion.filter(item => {
    return !resultRecord.data.find(element => {
      return element.question_id == item._id
    })
  })
  if (resultRecord.data.length > 0 && allQuestion.length > 0){
    allQuestion.forEach(element => {
      resultRecord.data.forEach(item => {
        if (item.question_id == element._id) {
          allStudyQuestion.push(element)
        }
      })
    });
  }
  let res = {
    resultQuestion: data.isShuffle ? shuffle(resultQuestion).slice(0,10) : resultQuestion.slice(0,10),
    evaluationCount: allQuestion.length,
    studyQuestionCount: allStudyQuestion.length
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
const addQuestionRecord = async (options) => {
  let hasRecord = await questionRCollection.where({ user_id: options.user_id, question_id: options.question_id}).get();
  if (Array.isArray(hasRecord.data) && hasRecord.data.length === 0) {
    await questionRCollection.add({
      data: {
        user_id: options.user_id,
        question_id: options.question_id,
        module_id: options.module_id,
        isRight: options.isRight,
        _createTime: Date.now(),
        _updateTime: Date.now()
      }
    })
    return '增加记录成功'
  } else {
    await questionRCollection.where({ user_id: options.user_id, question_id: options.question_id}).update({
      // data 传入需要局部更新的数据
      data: {
        isRight: options.isRight
      }
    })
    return '已更新记录'
  }
}

exports.main = async (event, context) => {
  const { func, data } = event;
  // const { OPENID, APPID, UNIONID } = cloud.getWXContext();
  let res;
  if (func === 'getQuestionById') {
    res = await getQuestionById(data);
  } else if (func === 'addQuestionRecord') {
    res = await addQuestionRecord(data);
  }
  return res;
}
