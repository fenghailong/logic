// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'prod-2gzhco766f4e1e27'
});
const db = cloud.database();
const collection = db.collection('wordGroup');
const wordcollection = db.collection('words');
const reCollection = db.collection('wordGroupRecord');
const evaGroupCollection = db.collection('wordGroupEvaluation');
const senCollection = db.collection('sentence');
// todo

const _ = db.command
const $ = db.command.aggregate

// 获取所有成语
const getAllWordGroup = async (options) => {
  const countResult = await collection.where({
    user_id: _.in(['75e09751658b8d1f00000f1e1a89f35d', options.user_id])
  }).count()
  console.log(countResult)
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = collection.where({
      user_id: _.in(['75e09751658b8d1f00000f1e1a89f35d', options.user_id])
    }).skip(i * 100).limit(100).get()
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
  })
  result.data = result.data || [] // 处理 没有数据时 reduce 结果 undefined 的情况
  return result
}
// 获取所有已经学习成语
const getAllWordGroupRecord = async (data) => {
  const countResult = await reCollection.where({ 
    user_id: data.user_id
  }).count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = reCollection.where({ user_id: data.user_id }).skip(i * 100).limit(100).get()
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

// 获取所有已经学习成语
const getAllWordGroupEvaluation = async (data) => {
  const countResult = await evaGroupCollection.where({ 
    user_id: data.user_id
  }).count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = evaGroupCollection.where({ user_id: data.user_id }).skip(i * 100).limit(100).get()
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

// 分页获取已评测记录 正确的 错误的
const getEvaluationWordsQueryPage = async (options) => {
  // const skipCount = (options.currPage - 1) * options.pageSize
  // const countResult = await evaGroupCollection.where({ user_id: options.user_id, isAllRight: options.isAllRight, type: options.word_type }).count();
  // const totalCount = countResult.total
  // const totalPage = totalCount === 0 ? 0 : totalCount <= options.pageSize ? 1 : parseInt(totalCount / options.pageSize) + 1
  const aggregateInstance = evaGroupCollection.aggregate()
  .lookup({
    from: 'wordGroup',
    localField: 'word_group_id',
    foreignField: '_id',
    as: 'wordGroupList',
  })
  const data = await aggregateInstance
  .match({
    user_id: options.user_id,
    isAllRight: options.isAllRight,
    type: options.word_type
  })
  .addFields({
    wordGroup: $.arrayElemAt(['$wordGroupList', 0])
  })
  .project({
    wordGroupList: 0
  })
  .sort({'_updateTime': -1})
  // .skip(skipCount)
  // .limit(options.pageSize)
  .end()
  // return {currPage: options.currPage, pageSize: options.pageSize, totalPage, totalCount, data}
  return {data}
}

// 更新评测记录
const upDateWordGroupEvaluation = async (options) => {
  const hasWord = await evaGroupCollection.where({ word_group_id: options.word_group_id, user_id: options.user_id}).get();
  if (Array.isArray(hasWord.data) && hasWord.data.length === 0) {
    await addEvaluation(options);
  } else {
    await upDateEvaluation(options);
  }
}

const upDateEvaluation = async (options) => {
  await evaGroupCollection.where({word_group_id: options.word_group_id, user_id: options.user_id}).update({
    data: {
      isAllRight: options.isAllRight ? '1' : '2',
      _updateTime: Date.now()
    }
  })
}

const addEvaluation = async (options) => {
  await evaGroupCollection.add({
    data: {
      word_group_id: options.word_group_id,
      user_id: options.user_id,
      type: options.word_type,
      isAllRight: options.isAllRight ? '1' : '2',
      _createTime: Date.now(),
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

// 获取词语的例句
const getSentenceById = async (options) => {
  console.log(options,'liju')
  const result= await senCollection.where({ word_id: options.word_id}).get();
  let res = {
    sentence: result.data
  }
  return res;
}

const getWAllList = async () => {
  const result = await getAllWords()
  result.data.sort((a,b)=>{ return b.count-a.count})//降序
  let allWords = []
  allWords= result.data
  let res = {
    allWords
  }
  return res;
}

// 获取成语/实词辨析组-列表
const getWordGroupList= async (options) => {
  console.log(options)
  const aggregateInstance = collection.aggregate()
  .lookup({
    from: 'wordGroupRecord',
    let: {
      word_group_id: '$_id',
      user_id: options.user_id
    },
    pipeline: $.pipeline()
      .match(_.expr($.and([
        $.eq(['$word_group_id', '$$word_group_id']),
        $.eq(['$user_id', '$$user_id'])
      ])))
      .project({
        _id: 1
      })
      .done(),
    as: 'wordGroupRecordList',
  })

  let result = await aggregateInstance
  .project({
    _id: 1,
    type: 1,
    word_type: 1,
    wordGroupRecordList: 1,
    user_id: 1,
    from: 1,
    _updateTime: 1,
    isStudyed: $.size('$wordGroupRecordList')
  })
  .match({
    user_id: _.in(['75e09751658b8d1f00000f1e1a89f35d', options.user_id]),
    word_type: options.word_type,
    isStudyed: 0
  })
  .project({
    wordGroupRecordList: 0
  })
  .limit(10)
  .end()
  return {
    code: "200",
    data: {
      wordGroupList: result.list
    },
    message: "ok"
  }
}
// 获取用户已经学习实词组和成语组的数量
const getWordGroupCount = async (options) => {
  const allIdiom = await collection.where({ 
    word_type: '1',
    user_id: _.in(['75e09751658b8d1f00000f1e1a89f35d', options.user_id]) 
  }).count();
  const studyIdiom = await reCollection.where({     
    word_group_type: '1',
    user_id: options.user_id
  }).count();
  const allNotional = await collection.where({ 
    word_type: '2',
    user_id: _.in(['75e09751658b8d1f00000f1e1a89f35d', options.user_id]) 
  }).count();
  const studyNotional = await reCollection.where({     
    word_group_type: '2',
    user_id: options.user_id
  }).count();
  return {
    code: "200",
    data: {
      allIdiomCount: allIdiom.total,
      allNotionalCount: allNotional.total,
      studyIdiomCount: studyIdiom.total,
      studyNotionalCount: studyNotional.total,
      idiomStarValue: ( studyIdiom.total/allIdiom.total * 5 ).toFixed(1),
      idiomPecent: Number(( studyIdiom.total * 100 / allIdiom.total ).toFixed(0)),
      notionalstarValue: ( studyNotional.total/allNotional.total * 5 ).toFixed(1),
      notionalPecent: Number(( studyNotional.total * 100 / allNotional.total ).toFixed(0))
    },
    message: "ok"
  }
}

// 获取用户当前学习成语或者词语的id
const getCurrenStudyWordGroupId = async (data) => {
  const resultIdiom = await reCollection.where({ user_id: data.user_id, word_group_type: '1' }).orderBy('_updateTime','desc').limit(1).get()
  const resultNotional = await reCollection.where({ user_id: data.user_id, word_group_type: '2' }).orderBy('_updateTime','desc').limit(1).get()
  let idiomWordId = ''
  let notionalWordId = ''
  if (resultIdiom.data.length > 0) {
    idiomWordId = resultIdiom.data[0].word_group_id
  } else {
    const idionWord = await collection.where({ word_type: '1'}).limit(1).get()
    idiomWordId = idionWord.data.length > 0 ? idionWord.data[0]._id : ''
  }
  if (resultNotional.data.length > 0) {
    notionalWordId = resultNotional.data[0].word_group_id
  } else {
    const notionalWord = await collection.where({ word_type: '2'}).limit(1).get()
    notionalWordId = notionalWord.data.length > 0 ? notionalWord.data[0]._id : ''
  }
  return {
    code: "200",
    data: {
      idiomWordId,
      notionalWordId
    },
    message: "ok"
  }
}

// 自定义添加成语/实词组
const addWordsGroup = async (options) => {
  let result = await collection.add({
    data: {
      connective: options.connective,
      user_id: options.user_id,
      type: options.type,
      word_type: options.word_type,
      from: '2',
      _createTime: Number(Date.now()),
      _updateTime: Number(Date.now())
    }
  })
  return {
    code: "200",
    data: {
      id: result._id
    },
    message: "ok"
  }
}

// 获取成语/实词辨析组-详情
const getWordGroupDetail = async (options) => {
  let word_group;
  console.log(options)
  const hasWord = await collection.where({ _id: options.word_group_id }).get();
  await reflashWordsRecord(options);
  word_group = hasWord.data[0];
  const hasCollect = await db.collection('collect').where({ pro_id: options.word_group_id, user_id: options.user_id }).get();
  const collectCount = await db.collection('collect').where({ pro_id: options.word_group_id }).count();
  console.log(hasCollect)
  console.log(collectCount)
  console.log(word_group)
  word_group.isCollect = hasCollect.data.length > 0 ? true : false
  word_group.collectCount = collectCount.total
  if(word_group.connective) {
    let result = await getConnectiveWords(word_group.connective)
    word_group.connectiveList = result
  }else{
    word_group.connectiveList = []
  }
  return word_group;
}

// 根据成语ID获取相关的例句和成语详情
const getConnectiveWords = async (arr) => {
  const connectiveList = await wordcollection.where({
    _id: _.in(arr)
  }).get();
  const sentenceList = await senCollection.where({
    word_id: _.in(arr)
  }).get();
  const uniqueArr = sentenceList.data.filter((item, index, self) => {
    return index === self.findIndex(obj => obj.word_id === item.word_id);
  });
  const mergedArr = connectiveList.data.reduce((acc, cur) => {
    const sentence = uniqueArr.find(obj => obj.word_id === cur._id);
    acc.push({ ...cur, sentence });
    return acc;
  }, []);

  return mergedArr;
}

// 刷新学习的记录
const reflashWordsRecord = async (options) => {
  const hasWord = await reCollection.where({ word_group_id: options.word_group_id, user_id: options.user_id}).get();
  if (Array.isArray(hasWord.data) && hasWord.data.length === 0) {
    await addWordsRecord(options);
  } else {
    await upDateWordsRecord(hasWord.data[0]._id)
  }
}

// 更新记录
const upDateWordsRecord = async (id) => {
  await reCollection.doc(id).update({
    // data 传入需要局部更新的数据
    data: {
      _updateTime: Date.now()
    }
  })
}

// 添加记录
const addWordsRecord = async (options) => {
  await reCollection.add({
    data: {
      word_group_id: options.word_group_id,
      user_id: options.user_id,
      word_group_type: options.word_group_type,
      _createTime: Date.now(),
      _updateTime: Date.now()
    }
  })
}

// 获取一个成语/实词组 - 评测详情
const getWordGroupEvaDetail = async (options) => {
  let word_group;
  console.log(options)
  const hasWord = await collection.where({ _id: options.word_group_id }).get();
  word_group = hasWord.data[0];
  if(word_group.connective) {
    let result = await getConnectiveWords(word_group.connective)
    word_group.connectiveList = result
  }else{
    word_group.connectiveList = []
  }
  return word_group;
}
const getWordGroupRandom = async (options) => {
  const aggregateInstance = collection.aggregate()
  .lookup({
    from: 'wordGroupEvaluation',
    let: {
      word_group_id: '$_id',
      user_id: options.user_id
    },
    pipeline: $.pipeline()
      .match(_.expr($.and([
        $.eq(['$word_group_id', '$$word_group_id']),
        $.eq(['$user_id', '$$user_id'])
      ])))
      .project({
        _id: 1
      })
      .done(),
    as: 'evaCollectionList',
  })
  let result = await aggregateInstance
  .project({
    _id: 1,
    type: 1,
    word_type: 1,
    evaCollectionList: 1,
    user_id: 1,
    from: 1,
    _updateTime: 1,
    isStudyed: $.size('$evaCollectionList')
  })
  .match({
    user_id: _.in(['75e09751658b8d1f00000f1e1a89f35d', options.user_id]),
    isStudyed: 0,
    word_type: options.word_type
  })
  .sample({
    size: 1
  })
  .end()
  if (result.list.length > 0) {
    let word_group;
    const hasWord = await collection.where({ _id: result.list[0]._id }).get();
    if (Array.isArray(hasWord.data) && hasWord.data.length === 0) {
      word_group = {}
    } else {
      word_group = hasWord.data[0];
      if(word_group.connective) {
        let result = await getConnectiveWords(word_group.connective)
        word_group.connectiveList = result
      }else{
        word_group.connectiveList = []
      }
    }
    return {
      code: "200",
      data: {
        word_group
      },
      message: "ok"
    }
  } else {
    return {
      code: "200",
      data: {},
      message: "没有更多的测评了"
    }
  }
}

// 获取成语/实词组总数，已学数
const getAllEvaluationWordGroupCount = async (options) => {
  let allcount = 0;
  let studycount = 0;
  const countResult = await collection.where({ 
    user_id: _.in(['75e09751658b8d1f00000f1e1a89f35d', options.user_id]),
    word_type: options.word_type
  }).count()
  const evaCountResult = await evaGroupCollection.where({ 
    user_id: options.user_id,
    type: options.word_type
  }).count()
  allcount = countResult.total
  studycount = evaCountResult.total
  return {
    allcount,
    studycount
  }
}

exports.main = async (event, context) => {
  const { func, data } = event;
  // const { OPENID, APPID, UNIONID } = cloud.getWXContext();
  let res;
  if (func === 'getAllWordGroup') { // 获取用户的所有辨析词组
    res = await getAllWordGroup(data);
  }
  else if (func === 'getAllWordGroupRecord') { // 获取用户的所有辨析词组的记录
    res = await getAllWordGroupRecord(data);
  }
  else if (func === 'getAllWordGroupEvaluation') { // 获取用户的所有辨析词组的测评记录
    res = await getAllWordGroupEvaluation(data);
  }
  else if (func === 'getCurrenStudyWordGroupId') { // 获取用户当前学习成语或者词语的id
    res = await getCurrenStudyWordGroupId(data);
  }
  else if (func === 'getWordGroupList') { // 获取成语或者词语列表// 获取已经学习成语，实词数量
    res = await getWordGroupList(data);
  }
  else if (func === 'getWordGroupCount') { // 获取用户已经学习实词组和成语组的数量
    res = await getWordGroupCount(data);
  }
  else if (func === 'addWordsGroup') { // 添加成语词语组
    res = await addWordsGroup(data);
  }
  else if (func === 'getWordGroupDetail') {
    res = await getWordGroupDetail(data);
  }
  else if (func === 'getWordGroupEvaDetail') { // 获取一个成语/实词组 - 评测详情
    res = await getWordGroupEvaDetail(data);
  }
  else if (func === 'getAllEvaluationWordGroupCount') { // 获取成语/实词组总数，已学数
    res = await getAllEvaluationWordGroupCount(data);
  }
  else if (func === 'upDateWordGroupEvaluation') { // upDateWordGroupEvaluation更新评测记录
    res = await upDateWordGroupEvaluation(data);
  }
  else if (func === 'reflashWordsRecord') {
    res = await reflashWordsRecord(data);
  }
  else if (func === 'getWAllList') {
    res = await getWAllList();
  }
  else if (func === 'getEvaluationWordsQueryPage') {
    res = await getEvaluationWordsQueryPage(data);
  }
  return res;
}
