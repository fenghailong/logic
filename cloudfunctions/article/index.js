// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'prod-2gzhco766f4e1e27'
});
const db = cloud.database();
const collection = db.collection('article');
const reCollection = db.collection('articleRecord');
const _ = db.command

const getAllArticle = async () => {
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
  return result
}
const getArticleCount = async (data) => {
  const result = await getAllArticle()
  let res = {
    articleCount: result.data.length,
  }
  console.log(res)
  return res;
}

const getArticleStudyCount = async (data) => {
  const result = await getAllArticle()
  const resultRecord = await reCollection.where({ user_id: data.user_id }).get()
  let allArticle = []
  let allStudyArticle = []
  allArticle = result.data
  if (resultRecord.data.length > 0 && allArticle.length){
    allArticle.forEach(element => {
      resultRecord.data.forEach(item => {
        if (item.article_id == element._id) {
          allStudyArticle.push(element)
        }
      })
    });
  }
  let res = {
    articleCount: allArticle.length,
    studyCount: allStudyArticle.length,
    starValue:( Number(allStudyArticle.length)/Number(allArticle.length) * 5 ).toFixed(1)
  }
  return res;
}

const getArticleList = async (data) => {
  const result = await getAllArticle()
  result.data.sort((a,b)=>{ return b._updateTime-a._updateTime})//降序
  // const result = await collection.orderBy('count', 'desc').get()
  const resultRecord = await reCollection.where({ user_id: data.user_id }).get()
  let allArticle = []
  allArticle= result.data
  if (resultRecord.data.length > 0 && allArticle.length){
    allArticle = allArticle.map(element => {
      element.isStudyed = false
      resultRecord.data.forEach(item => {
        if (item.article_id == element._id) {
          element.isStudyed = true;
        }
      })
      return element;
    });
  }
  let res = {
    allArticle
  }
  return res;
}

const getArticleDetail = async (options) => {
  let article;
  const hasWord = await collection.where({ _id: options.article_id }).get();
  if (Array.isArray(hasWord.data) && hasWord.data.length === 0) {
    article = {}
  } else {
    await reflashArticlesRecord(options);
    article = hasWord.data[0];
    console.log(article)
  }
  return article;
}

const reflashArticlesRecord = async (options) => {
  const hasWord = await reCollection.where({ article_id: options.article_id, user_id: options.user_id}).get();
  if (Array.isArray(hasWord.data) && hasWord.data.length === 0) {
    await addArticleRecord(options);
  }
}

const addArticleRecord = async (options) => {
  await reCollection.add({
    data: {
      article_id: options.article_id,
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
  if (func === 'getArticleCount') {
    res = await getArticleCount(data);
  }
  else if (func === 'getArticleStudyCount') {
    res = await getArticleStudyCount(data);
  }
  else if (func === 'getArticleList') {
    res = await getArticleList(data);
  }
  else if (func === 'getArticleDetail') {
    res = await getArticleDetail(data);
  }
  else if (func === 'reflashArticlesRecord') {
    res = await reflashArticlesRecord(data);
  }
  return res;
}
