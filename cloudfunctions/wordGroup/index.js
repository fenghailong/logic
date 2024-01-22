// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'prod-2gzhco766f4e1e27'
});
const db = cloud.database();
const collection = db.collection('wordGroup');
const wordcollection = db.collection('words');
const reCollection = db.collection('wordGroupRecord');

// todo
const evaCollection = db.collection('wordsEvaluation');
const senCollection = db.collection('sentence');
// todo

const _ = db.command
const $ = db.command.aggregate

// 获取所有词语
const getAllWords = async () => {
  const countResult = await collection.count()
  console.log(countResult)
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = collection.skip(i * 100).limit(100).get()
    tasks.push(promise)
  }
  // 等待所有
  let result = (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  })
  // result.data = result.data || [] // 处理 没有数据时 reduce 结果 undefined 的情况
  return result
}
// 获取所有以学习词语
const getAllStudyWords = async (data) => {
  const countResult = await reCollection.where({ user_id: data.user_id }).count()
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

// 获取所有以评测词语
const getAllEvaluationWords = async (data) => {
  const countResult = await evaCollection.where({ user_id: data.user_id, rightCount: _.lt(3) }).count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = evaCollection.where({ user_id: data.user_id, rightCount: _.lt(3) }).skip(i * 100).limit(100).get()
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

// 分页获取已评测记录 正确次数大于1 小于3
const getEvaluationWordsQueryPage = async (options) => {
  console.log(options)
  const skipCount = (options.currPage - 1) * options.pageSize
  const countResult = await evaCollection.where({ user_id: options.user_id, rightCount: _.in([1, 2]) }).count();
  console.log(countResult,'============')
  const totalCount = countResult.total
  const totalPage = totalCount === 0 ? 0 : totalCount <= options.pageSize ? 1 : parseInt(totalCount / options.pageSize) + 1
  const aggregateInstance = evaCollection.aggregate()
  .lookup({
    from: 'words',
    localField: 'words_id',
    foreignField: '_id',
    as: 'wordList',
  })
  const data = await aggregateInstance
  .match({
    user_id: options.user_id,
    rightCount: _.in([1, 2])
  })
  .addFields({
    word: $.arrayElemAt(['$wordList', 0])
  })
  .project({
    wordList: 0
  })
  .sort({'_updateTime': -1})
  .skip(skipCount)
  .limit(options.pageSize)
  .end()
  return {currPage: options.currPage, pageSize: options.pageSize, totalPage, totalCount, data}
}

// 分页获取已掌握记录 正确次数大于3
const getAlredyEvaluationWordsQueryPage = async (options) => {
  const skipCount = (options.currPage - 1) * options.pageSize
  const countResult = await evaCollection.where({ user_id: options.user_id, rightCount: _.gte(3) }).count();
  const totalCount = countResult.total
  const totalPage = totalCount === 0 ? 0 : totalCount <= options.pageSize ? 1 : parseInt(totalCount / options.pageSize) + 1
  const aggregateInstance = evaCollection.aggregate()
  .lookup({
    from: 'words',
    localField: 'words_id',
    foreignField: '_id',
    as: 'wordList',
  })
  const data = await aggregateInstance
  .match({
    user_id: options.user_id,
    rightCount: _.gte(3)
  })
  .addFields({
    word: $.arrayElemAt(['$wordList', 0]),
  })
  .project({
    wordList: 0
  })
  .sort({'_updateTime': -1})
  .skip(skipCount)
  .limit(options.pageSize)
  .end()
  return {currPage: options.currPage, pageSize: options.pageSize, totalPage, totalCount, data}
}

// 分页获取错误记录 错误次数大于0
const getErrEvaluationWordsQueryPage = async (options) => {
  const skipCount = (options.currPage - 1) * options.pageSize
  const countResult = await evaCollection.where({ user_id: options.user_id, errCount: _.gt(0) }).count();
  const totalCount = countResult.total
  const totalPage = totalCount === 0 ? 0 : totalCount <= options.pageSize ? 1 : parseInt(totalCount / options.pageSize) + 1
  const aggregateInstance = evaCollection.aggregate()
  .lookup({
    from: 'words',
    localField: 'words_id',
    foreignField: '_id',
    as: 'wordList',
  })
  const data = await aggregateInstance
  .match({
    user_id: options.user_id,
    errCount: _.gt(0)
  })
  .addFields({
    word: $.arrayElemAt(['$wordList', 0]),
  })
  .project({
    wordList: 0
  })
  .sort({'_updateTime': -1})
  .skip(skipCount)
  .limit(options.pageSize)
  .end()
  return {currPage: options.currPage, pageSize: options.pageSize, totalPage, totalCount, data}
}

// 获取总数，已学数，已经掌握数
const getAllEvaluationWordsCount = async (data) => {
  let allcount = 0;
  let studycount = 0;
  let readycount = 0;
  const countResult = await collection.where({ type: 1, synonym: _.exists(true)}).count()
  const evaCountResult1 = await evaCollection.where({ user_id: data.user_id}).count()
  // const evaCountResult2 = await evaCollection.where({ user_id: data.user_id, errCount: _.gt(0) }).count()
  const evareadyCountResult = await evaCollection.where({ user_id: data.user_id, rightCount: _.gte(3) }).count()
  allcount = countResult.total
  studycount = evaCountResult1.total
  readycount = evareadyCountResult.total
  return {
    allcount,
    studycount,
    readycount
  }
}

// 获取模块下的已经掌握的题目数量 和 模块下面的题目（除去已经掌握的）
const getWordByRandom = async (options) => {
  const result = await getAllWords()
  const resultRecord = await getAllEvaluationWords(options)
  let allWord = result.data
  allWord = allWord.filter((item) => item.type == 1 && item.synonym && item.synonym.length>0);
  console.log(allWord, '=============')
  // 过滤已经回答正确的题目
  let resultWord = allWord.filter(item => {
    return !resultRecord.data.find(element => {
      return element.words_id == item._id && (item.rightCount < 3 || item.rightCount == 3)
    })
  })
  console.log(resultWord, '=============')
  resultWord = shuffle(resultWord)[0] || {}
  if (resultWord) {
    options.word_id = resultWord._id
    resultWord.evaluationData  = await reflashWordsEvaluation(options);
    resultWord.option = []
    let result = await getSynonymWords(resultWord.synonym)
    result.data.forEach(item => {
      resultWord.option.push(item.implication)
    })
    resultWord.option = resultWord.option.slice(0,3)
    resultWord.option.push(resultWord.implication)
    resultWord.option = shuffle(resultWord.option)

    resultWord.synonymList = result.data
  }
  console.log(resultWord, '=============')
  return resultWord
}

const reflashWordsEvaluation = async (options) => {
  let res = {
    rightCount: 0,
    errCount: 0
  }
  const hasWord = await evaCollection.where({ words_id: options.word_id, user_id: options.user_id}).get();
  if (Array.isArray(hasWord.data) && hasWord.data.length === 0) {
    await addWordsEvaluation(options);
  } else {
    res.rightCount = hasWord.data[0].rightCount,
    res.errCount = hasWord.data[0].errCount
  }
  return res
}

const upDateWordsEvaluation = async (options) => {
  let rightCount = 0;
  let errCount = 0;
  const hasWord = await evaCollection.where({ words_id: options.word_id, user_id: options.user_id}).get();
  if(options.isRight){
    rightCount = hasWord.data[0].rightCount + 1
  }else {
    errCount = hasWord.data[0].errCount + 1
  }
  await evaCollection.where({words_id: options.word_id, user_id: options.user_id}).update({
    // data 传入需要局部更新的数据
    data: {
      rightCount,
      errCount,
      _updateTime: Date.now()
    }
  })
}


const addWordsEvaluation = async (options) => {
  await evaCollection.add({
    data: {
      words_id: options.word_id,
      user_id: options.user_id,
      rightCount: 0,
      errCount: 0,
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

const getWordsStudyCount = async (data) => {
  const result = await getAllWords()
  const resultRecord = await getAllStudyWords(data)
  let wordsList = result.data.sort((a,b)=>{ return b.count-a.count})
  let recordList = resultRecord.data
  recordList = recordList.sort((a,b)=>{ return b._updateTime - a._updateTime})
  wordsList= wordsList.filter((item) => item.type == 1 && item.synonym && item.synonym.length>0);

  if (recordList.length > 0 && wordsList.length){
    wordsList.map(element => {
      element.isStudyed = false
      recordList.forEach(item => {
        if (item.words_id == element._id) {
          element.isStudyed = true;
        }
      })
    });
  }
  let res = {
    wordsList: wordsList,
    currentWordId: recordList.length > 0 ? recordList[0].words_id : '',
    wordCount: wordsList.length,
    studyCount: recordList.length,
    starValue:( Number(recordList.length)/Number(wordsList.length) * 5 ).toFixed(1)
  }
  return res;
}

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
    isStudyed: $.size('$wordGroupRecordList')
  })
  .project({
    wordGroupRecordList: 0,
  })
  .group({
    _id: '$word_type',
    root: {
      $push: "$$ROOT"
    },
    total: $.sum('$isStudyed')
  })
  .limit(4000)
  .end()
  let idiomList;
  let studyIdiomCount;
  let notionalList;
  let studyNotionalCount;
  result.list.map(item => {
    if (item._id === '1') {
      idiomList = item.root
      studyIdiomCount = item.total
    } else {
      notionalList = item.root
      studyNotionalCount = item.total
    }
  })
  return {
    code: "200",
    data: {
      idiomList,
      notionalList,
      allIdiomCount: idiomList.length,
      allNotionalCount: notionalList.length,
      studyIdiomCount,
      studyNotionalCount,
      idiomStarValue: ( studyIdiomCount/idiomList.length * 5 ).toFixed(1),
      idiomPecent: Number(( studyIdiomCount * 100 / idiomList.length ).toFixed(0)),
      notionalstarValue: ( studyNotionalCount/notionalList.length * 5 ).toFixed(1),
      notionalPecent: Number(( studyNotionalCount * 100 / notionalList.length ).toFixed(0))
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

// 获取成语组详情
const getWordGroupDetail = async (options) => {
  let word_group;
  const hasWord = await collection.where({ _id: options.word_group_id }).get();
  if (Array.isArray(hasWord.data) && hasWord.data.length === 0) {
    word_group = {}
  } else {
    await reflashWordsRecord(options);
    word_group = hasWord.data[0];
    const hasCollect = await db.collection('collect').where({ pro_id: options.word_group_id, user_id: options.user_id }).get();
    const collectCount = await db.collection('collect').where({ pro_id: options.word_group_id }).count();
    word_group.isCollect = hasCollect.data.length > 0 ? true : false
    word_group.collectCount = collectCount.total
    if(word_group.connective) {
      let result = await getConnectiveWords(word_group.connective)
      word_group.connectiveList = result
    }else{
      word_group.connectiveList = []
    }

  }
  return word_group;
}

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

const reflashWordsRecord = async (options) => {
  const hasWord = await reCollection.where({ word_group_id: options.word_group_id, user_id: options.user_id}).get();
  if (Array.isArray(hasWord.data) && hasWord.data.length === 0) {
    await addWordsRecord(options);
  } else {
    await upDateWordsRecord(hasWord.data[0]._id)
  }
}

const upDateWordsRecord = async (id) => {
  await reCollection.doc(id).update({
    // data 传入需要局部更新的数据
    data: {
      _updateTime: Date.now()
    }
  })
}

// todo
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

exports.main = async (event, context) => {
  const { func, data } = event;
  // const { OPENID, APPID, UNIONID } = cloud.getWXContext();
  let res;
  if (func === 'getWordsStudyCount') {
    res = await getWordsStudyCount(data);
  }
  else if (func === 'getCurrenStudyWordGroupId') { // 获取用户当前学习成语或者词语的id
    res = await getCurrenStudyWordGroupId(data);
  }
  else if (func === 'getWordGroupList') { // 获取成语或者词语列表// 获取已经学习成语，实词数量
    res = await getWordGroupList(data);
  }
  else if (func === 'getWordGroupDetail') {
    res = await getWordGroupDetail(data);
  }
  else if (func === 'reflashWordsRecord') {
    res = await reflashWordsRecord(data);
  }
  else if (func === 'getWAllList') {
    res = await getWAllList();
  }
  else if (func === 'getWordByRandom') {
    res = await getWordByRandom(data);
  }
  else if (func === 'upDateWordsEvaluation') {
    res = await upDateWordsEvaluation(data);
  }
  else if (func === 'getSentenceById') {
    res = await getSentenceById(data);
  }
  else if (func === 'getAllEvaluationWordsCount') {
    res = await getAllEvaluationWordsCount(data);
  }
  else if (func === 'getEvaluationWordsQueryPage') {
    res = await getEvaluationWordsQueryPage(data);
  }
  else if (func === 'getAlredyEvaluationWordsQueryPage') {
    res = await getAlredyEvaluationWordsQueryPage(data);
  }
  else if (func === 'getErrEvaluationWordsQueryPage') {
    res = await getErrEvaluationWordsQueryPage(data);
  }
  return res;
}
