// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'prod-2gzhco766f4e1e27'
});
const db = cloud.database();
const questionCollection = db.collection('question');
const questionRCollection = db.collection('question_record');
const practiseCollection = db.collection('practise');
const moduleCollection = db.collection('knowledgeModule');
const $ = db.command.aggregate

// 获取某个模块下的所有题目
const getAllQuestion = async (options) => {
  const countResult = await questionCollection.where({ module_id: options.module_id}).count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = questionCollection.where({ module_id: options.module_id}).skip(i * 100).limit(100).get()
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

// 分页获取错题
const getErrQuestionQueryPage = async (options) => {
  const skipCount = (options.currPage - 1) * options.pageSize
  const countResult = await questionRCollection.where({ user_id: options.user_id, module_id: options.module_id, isRight: '2' }).count();
  const totalCount = countResult.total
  const totalPage = totalCount === 0 ? 0 : totalCount <= options.pageSize ? 1 : parseInt(totalCount / options.pageSize) + 1
  const aggregateInstance = questionRCollection.aggregate()
  .lookup({
    from: 'question',
    localField: 'question_id',
    foreignField: '_id',
    as: 'questionList',
  })
  const data = await aggregateInstance
  .match({
    user_id: options.user_id,
    module_id: options.module_id,
    isRight: '2'
  })
  .addFields({
    question: $.arrayElemAt(['$questionList', 0]),
  })
  .project({
    questionList: 0
  })
  .sort({'_updateTime': -1})
  .skip(skipCount)
  .limit(options.pageSize)
  .end()
  return {currPage: options.currPage, pageSize: options.pageSize, totalPage, totalCount, data}
}

// 分页获取错题
// const getErrQuestionQueryPage = async (options) => {
//   const skipCount = (options.currPage - 1) * options.pageSize
//   const countResult = await questionRCollection.where({ user_id: options.user_id, module_id: options.module_id, isRight: '2' }).count();
//   const totalCount = countResult.total
//   const totalPage = totalCount === 0 ? 0 : totalCount <= options.pageSize ? 1 : parseInt(totalCount / options.pageSize) + 1
//   let result = await questionRCollection
//   .where({ user_id: options.user_id, module_id: options.module_id, isRight: '2'})
//   .orderBy('_updateTime', 'asc')
//   .skip(skipCount)
//   .limit(options.pageSize)
//   .get()
//   return {currPage: options.currPage, pageSize: options.pageSize, totalPage, totalCount, data: result.data}
// }

// 获取某个模块下的所有错题数量
const getAllErrQuestionById = async (options) => {
  const countResult = await questionRCollection.where({ user_id: options.user_id, isRight: '2'}).count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = questionRCollection.where({ user_id: options.user_id, isRight: '2'}).skip(i * 100).limit(100).get()
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
  console.log(result.data)
  let temp = []
  result.data.forEach(element => {
    temp = temp.concat(element.module_id)
  });
  let data = getArrayNum(temp)
  return data
}

// 获取数组中不同元素的数量
const getArrayNum = (arr) => {
  return arr.reduce(function(prev,next){
    prev[next] = (prev[next] + 1) || 1;
    return prev;
  },{});
  // let newArr = []
  // for (key in obj) {
  //   newArr.push({
  //       module_id: key,
  //       count: obj[key]
  //   })
  // };
  // return newArr
}

// 获取模块下的已经掌握的题目数量 和 模块下面的题目（除去已经掌握的）
const getQuestionCountById = async (options) =>  {
  const result = await questionCollection.where({ module_id: options.module_id}).count()
  const resultRecord = await questionRCollection.where({ user_id: options.user_id, module_id: options.module_id, isRight: '1'}).count()
  let res = {
    questionCount: result.total,
    questionStudyCount: resultRecord.total
  }
  return res;
}

// 获取模块下的已经掌握的题目数量 和 模块下面的题目（除去已经掌握的）
const getQuestionById = async (options) => {
  const result = await getAllQuestion(options)
  const resultRecord = await getAllStudyQuestionById(options)
  let allQuestion = result.data
  // 过滤已经回答正确的题目
  let resultQuestion = allQuestion.filter(item => {
    return !resultRecord.data.find(element => {
      return element.question_id == item._id
    })
  })
  resultQuestion = options.isShuffle ? shuffle(resultQuestion).slice(0,10) : resultQuestion.slice(0,10)
  let res = {
    resultQuestion
  }
  return res;
}

// 获取百日刷题模块下的所有题目 根据试卷id 和模块id 获取
const getQuestionBymodule = async (options) => {
  console.log(options, '===========')
  const result = await questionCollection.where({ examination_id: options.examination_id, module_id: options.module_id}).get()
  resultQuestion = result.data
  let res = {
    resultQuestion
  }
  return res;
}

// 获取刷题练习记录
const getPractise = async (options) => {
  let isComplete = options.isComplete ? options.isComplete : '2'
  let hasRecord = await practiseCollection.where({
    user_id: options.user_id,
    module_id: options.module_id,
    isComplete: isComplete
  }).get();
  if (Array.isArray(hasRecord.data) && hasRecord.data.length === 0) {
    return []
  } else {
    return hasRecord.data[0]
  }
}

// 获取刷题练习记录(联表查询)
const getPractiseList = async (options) => {
  const skipCount = (options.currPage - 1) * options.pageSize
  const countResult = await practiseCollection.where({ user_id: options.user_id}).count();
  const totalCount = countResult.total
  const totalPage = totalCount === 0 ? 0 : totalCount <= options.pageSize ? 1 : parseInt(totalCount / options.pageSize) + 1
  const aggregateInstance = practiseCollection.aggregate()
  .lookup({
    from: 'knowledgeModule',
    localField: 'module_id',
    foreignField: '_id',
    as: 'moduleList',
  })
  const data = await aggregateInstance
  .match({
    user_id: options.user_id
  })
  .addFields({
    module: $.arrayElemAt(['$moduleList', 0]),
  })
  .project({
    moduleList: 0
  })
  .sort({'_updateTime': -1})
  .skip(skipCount)
  .limit(options.pageSize)
  .end()
  return {currPage: options.currPage, pageSize: options.pageSize, totalPage, totalCount, data}
}

// 获取一个模版的刷题练习记录 （排名使用）
const getPractiseListByModule = async (options) => {
  // const skipCount = (options.currPage - 1) * options.pageSize
  // const countResult = await practiseCollection.where({ module_id: options.module_id}).count();
  // const totalCount = countResult.total
  // const totalPage = totalCount === 0 ? 0 : totalCount <= options.pageSize ? 1 : parseInt(totalCount / options.pageSize) + 1
  const aggregateInstance = practiseCollection.aggregate()
  .lookup({
    from: 'user',
    localField: 'user_id',
    foreignField: '_id',
    as: 'userList',
  })
  const data = await aggregateInstance
  .match({
    module_id: options.module_id,
    isComplete: '1'
  })
  .addFields({
    user: $.arrayElemAt(['$userList', 0]),
  })
  .project({
    userList: 0
  })
  // .skip(skipCount)
  .limit(50)
  .end()

  // 计算每个用户的正确率
  data.list = data.list.map(item => {
    item.rightCount = 0
    item.questions.forEach(ele => {
      if (ele.isRight) {
        item.rightCount += 1
      }
    })
    item.rightRate = (item.rightCount * 100 / item.questions.length).toFixed(2)
    return item
  })
  data.list= data.list.filter(item=>item.rightRate != '0.00')

  // 计算平均正确率
  let totalRate = 0
  data.list = data.list.map(item => {
    totalRate = totalRate + parseFloat(item.rightRate)
    return item
  })
  totalRate = (totalRate / data.list.length).toFixed(2)

  // 计算平均用时
  let totalTime = 0
  data.list = data.list.map(item => {
    let seconds = 0
    let minutes = 0
    seconds = Number(item.useTime.split(':')[1])
    minutes = Number(item.useTime.split(':')[0])
    totalTime = parseInt(totalTime) + parseInt(minutes * 60 + seconds)
    item.questions = {}
    return item
  })
  totalTime = parseInt(totalTime / data.list.length)
  totalTime = toZero(parseInt(totalTime/ 60)) +':'+ toZero(parseInt(totalTime % 60))

  data.list.sort((a, b) => {
    return b.rightRate - a.rightRate;
  });
  return { totalTime, totalRate, data }
}

const toZero = (timeNumber) => {
  return timeNumber < 10 ? '0' + timeNumber : timeNumber
}

// 获取刷题练习记录
const getPractiseById = async (options) => {
  let hasRecord = await practiseCollection.where({ _id: options.practise_id}).get();
  if (Array.isArray(hasRecord.data) && hasRecord.data.length === 0) {
    return []
  } else {
    return hasRecord.data[0]
  }
}

// 增加刷题练习记录
const addPractise = async (options) => {
  let data = await practiseCollection.add({
    data: {
      user_id: options.user_id,
      module_id: options.module_id,
      isComplete: '2',
      questions: options.questions,
      useTime: '00:00',
      _createTime: Date.now(),
      _updateTime: Date.now()
    }
  })
  console.log(data,'增加记录')
  return data
}

// 更新刷题记录
const updatePractise = async (options) => {
  await practiseCollection.where({ _id: options.practise_id}).update({
    // data 传入需要局部更新的数据
    data: {
      isComplete: options.isComplete,
      questions: options.questions,
      useTime: options.useTime,
      _updateTime: Date.now()
    }
  })
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


// 增加刷题记录
const addQuestionRecord = async (options) => {
  console.log(options)
  let hasRecord = await questionRCollection.where({ user_id: options.user_id, question_id: options.question_id}).get();
  console.log(hasRecord)
  if (Array.isArray(hasRecord.data) && hasRecord.data.length === 0) {
    let count = options.isRight === '2' ? 1 : 0
    await questionRCollection.add({
      data: {
        user_id: options.user_id,
        question_id: options.question_id,
        module_id: options.module_id,
        isRight: options.isRight,
        count: count,
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
    await questionRCollection.where({ user_id: options.user_id, question_id: options.question_id}).update({
      // data 传入需要局部更新的数据
      data: {
        count: count,
        isRight: options.isRight,
        _updateTime: Date.now()
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
  } else if (func === 'getQuestionBymodule') {
    res = await getQuestionBymodule(data);
  } else if (func === 'getQuestionCountById') {
    res = await getQuestionCountById(data);
  } else if (func === 'addQuestionRecord') {
    res = await addQuestionRecord(data);
  } else if (func === 'getPractiseList') {
    res = await getPractiseList(data);
  } else if (func === 'getPractise') {
    res = await getPractise(data);
  } else if (func === 'getPractiseById') {
    res = await getPractiseById(data);
  } else if (func === 'getPractiseListByModule') {
    res = await getPractiseListByModule(data);
  } else if (func === 'addPractise') {
    res = await addPractise(data);
  } else if (func === 'updatePractise') {
    res = await updatePractise(data);
  } else if (func === 'getAllErrQuestionById') {
    res = await getAllErrQuestionById(data);
  } else if (func === 'getErrQuestionQueryPage') {
    res = await getErrQuestionQueryPage(data);
  }
  return res;
}
