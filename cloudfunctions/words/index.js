// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'prod-2gzhco766f4e1e27'
});
const db = cloud.database();
const collection = db.collection('words');
const reCollection = db.collection('wordsRecord');
const evaCollection = db.collection('wordsEvaluation');
const _ = db.command

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

// 获取模块下的已经掌握的题目数量 和 模块下面的题目（除去已经掌握的）
const getWordByRandom = async (options) => {
  let word = {}
  const result = await getAllWords()
  const resultRecord = await getAllEvaluationWords(options)
  let allWord = result.data
  allWord= allWord.filter((item) => item.type == 1 && item.synonym && item.synonym.length>0);
  // 过滤已经回答正确的题目
  let resultWord = allWord.filter(item => {
    return !resultRecord.data.find(element => {
      return element.words_id == item._id
    })
  })
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
  return resultWord;
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

const getWordsList = async (data) => {
  const result = await getAllWords()
  result.data.sort((a,b)=>{ return b.count-a.count})//降序
  // const result = await collection.orderBy('count', 'desc').get()
  const resultRecord = await getAllStudyWords(data)
  let allWords = []
  allWords= result.data.filter((item) => item.type == 1 && item.synonym && item.synonym.length>0);
  if (resultRecord.data.length > 0 && allWords.length){
    allWords = allWords.map(element => {
      element.isStudyed = false
      resultRecord.data.forEach(item => {
        if (item.words_id == element._id) {
          element.isStudyed = true;
        }
      })
      return element;
    });
  }
  let res = {
    allWords
  }
  return res;
}



const getWordsDetail = async (options) => {
  let word;
  const hasWord = await collection.where({ _id: options.word_id }).get();
  if (Array.isArray(hasWord.data) && hasWord.data.length === 0) {
    word = {}
  } else {
    await reflashWordsRecord(options);
    word = hasWord.data[0];
    if(word.synonym) {
      let result = await getSynonymWords(word.synonym)
      word.synonymList = result.data
    }else{
      word.synonymList = []
    }

  }
  return word;
}

const getSynonymWords = async (arr) => {
  const synonymWordList = await collection.where({
    _id: _.in(arr)
  }).get();
  return synonymWordList;
}

const reflashWordsRecord = async (options) => {
  const hasWord = await reCollection.where({ words_id: options.word_id, user_id: options.user_id}).get();
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

const addWordsRecord = async (options) => {
  await reCollection.add({
    data: {
      words_id: options.word_id,
      user_id: options.user_id,
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
  else if (func === 'getWordsList') {
    res = await getWordsList(data);
  }
  else if (func === 'getWordsDetail') {
    res = await getWordsDetail(data);
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
  return res;
}
