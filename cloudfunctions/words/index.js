// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'prod-2gzhco766f4e1e27'
});
const db = cloud.database();
const collection = db.collection('words');
const reCollection = db.collection('wordsRecord');
const _ = db.command

const getAllWords = async () => {
  const countResult = await collection.count()
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
  return result
}
const getWordsCount = async (data) => {
  const result = await getAllWords()
  console.log(result)
  const country= result.data.filter((item) => item.tag.includes('国考'));
  const countryHotWords = country.filter(item => item.count > 5)
  const publicExamHotWords = result.data.filter((item) => item.tag.includes('公考') && item.count > 5);
  const publicExamShotHotWords = result.data.filter((item) => item.type == 2 && item.count > 5);
  let res = { 
    countryCount: country.length, 
    countryHotWordsCount: countryHotWords.length, 
    publicExamHotWordsCount: publicExamHotWords.length, 
    publicExamShotHotWordsCount: publicExamShotHotWords.length 
  }
  console.log(res)
  return res;
}

const getWordsStudyCount = async (data) => {
  const result = await getAllWords()
  const resultRecord = await reCollection.where({ user_id: data.user_id }).get()
  let allWords = []
  let allStudyWords = []
  if(data.type.includes('国考历年成语')) {
    allWords = result.data.filter(item => item.type == 1 && item.tag.includes('国考'))
  } else if (data.type.includes('国考高频成语')) {
    allWords= result.data.filter((item) => item.type == 1 && item.tag.includes('国考') && item.count > 5);
  } else if (data.type.includes('公考高频成语')) {
    allWords= result.data.filter((item) => item.type == 2 && item.tag.includes('公考') && item.count > 5);
  } else if (data.type.includes('公考高频实词')) {
    allWords= result.data.filter((item) => item.type == 2 && item.tag.includes('公考') && item.count > 5);
  }
  if (resultRecord.data.length > 0 && allWords.length){
    allWords.forEach(element => {
      resultRecord.data.forEach(item => {
        if (item.words_id == element._id) {
          allStudyWords.push(element)
        }
      })
    });
  }
  let res = { 
    allWordsCount: allStudyWords.length,
    starValue:( Number(allStudyWords.length)/Number(allWords.length) * 5 ).toFixed(1)
  }
  return res;
}

const getWordsList = async (data) => {
  const result = await getAllWords()
  result.data.sort((a,b)=>{ return b.count-a.count})//降序
  // const result = await collection.orderBy('count', 'desc').get()
  const resultRecord = await reCollection.where({ user_id: data.user_id }).get()
  let allWords = []
  let allStudyWords = []
  if(data.type.includes('国考历年成语')) {
    allWords = result.data.filter(item => item.type == 1 && item.tag.includes('国考'))
  } else if (data.type.includes('国考高频成语')) {
    allWords= result.data.filter((item) => item.type == 1 && item.tag.includes('国考') && item.count > 5);
  } else if (data.type.includes('公考高频成语')) {
    allWords= result.data.filter((item) => item.type == 1 && item.tag.includes('公考') && item.count > 5);
  } else if (data.type.includes('公考高频实词')) {
    allWords= result.data.filter((item) => item.type == 2 && item.tag.includes('公考') && item.count > 5);
  }
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
    console.log(word)
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
  }
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
  if (func === 'getWordsCount') {
    res = await getWordsCount(data);
  }
  else if (func === 'getWordsStudyCount') {
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
  return res;
}
