// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'prod-2gzhco766f4e1e27'
});
const db = cloud.database();
const collection = db.collection('person');
const reCollection = db.collection('personRecord');
const _ = db.command

const getAllPerson = async () => {
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
const getPersonCount = async (data) => {
  const result = await getAllPerson()
  let res = { 
    personCount: result.data.length,
  }
  console.log(res)
  return res;
}

const getPersonStudyCount = async (data) => {
  const result = await getAllPerson()
  const resultRecord = await reCollection.where({ user_id: data.user_id }).get()
  let allPerson = []
  let allStudyPerson = []
  allPerson = result.data
  if (resultRecord.data.length > 0 && allPerson.length){
    allPerson.forEach(element => {
      resultRecord.data.forEach(item => {
        if (item.person_id == element._id) {
          allStudyPerson.push(element)
        }
      })
    });
  }
  let res = { 
    personCount: allPerson.length,
    studyCount: allStudyPerson.length,
    starValue:( Number(allStudyPerson.length)/Number(allPerson.length) * 5 ).toFixed(1)
  }
  return res;
}

const getPersonList = async (data) => {
  const result = await getAllPerson()
  result.data.sort((a,b)=>{ return b._updateTime-a._updateTime})//降序
  // const result = await collection.orderBy('count', 'desc').get()
  const resultRecord = await reCollection.where({ user_id: data.user_id }).get()
  let allPerson = []
  allPerson= result.data
  if (resultRecord.data.length > 0 && allPerson.length){
    allPerson = allPerson.map(element => {
      element.isStudyed = false
      resultRecord.data.forEach(item => {
        if (item.person_id == element._id) {
          element.isStudyed = true;
        }
      })
      return element;
    });
  }
  let res = { 
    allPerson
  }
  return res;
}

const getPersonDetail = async (options) => {
  let person;
  const hasWord = await collection.where({ _id: options.person_id }).get();
  if (Array.isArray(hasWord.data) && hasWord.data.length === 0) {
    person = {}
  } else {
    await reflashPersonsRecord(options);
    person = hasWord.data[0];
    console.log(person)
  }
  return person;
}

const reflashPersonsRecord = async (options) => {
  const hasWord = await reCollection.where({ person_id: options.person_id, user_id: options.user_id}).get();
  if (Array.isArray(hasWord.data) && hasWord.data.length === 0) {
    await addPersonRecord(options);
  }
}

const addPersonRecord = async (options) => {
  await reCollection.add({
    data: {
      person_id: options.person_id,
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
  if (func === 'getPersonCount') {
    res = await getPersonCount(data);
  }
  else if (func === 'getPersonStudyCount') {
    res = await getPersonStudyCount(data);
  }
  else if (func === 'getPersonList') {
    res = await getPersonList(data);
  }
  else if (func === 'getPersonDetail') {
    res = await getPersonDetail(data);
  }
  else if (func === 'reflashWordsRecord') {
    res = await reflashWordsRecord(data);
  }
  return res;
}
