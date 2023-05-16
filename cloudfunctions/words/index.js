// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'prod-2gzhco766f4e1e27'
});
const db = cloud.database();
const collection = db.collection('words');
const reCollection = db.collection('wordsRecord');
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
  console.log(tasks, '=============')
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
  return res;
}
