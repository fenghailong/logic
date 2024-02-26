// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env:'prod-2gzhco766f4e1e27'
});
const db = cloud.database();
const collection = db.collection('collect');
const errorCollection = db.collection('error_back');

const _ = db.command
const $ = db.command.aggregate

// 获取收藏列表-分组
const getCollectionList= async (options) => {
  console.log(options)
  const aggregateInstance = collection.aggregate()
  let result = await aggregateInstance
  .match({
    user_id: options.user_id,
  })
  .group({
    _id: '$type',
    total: $.sum(1)
  })
  .end()
  console.log(result, '======')
  return {
    code: "200",
    data: {
      list: result.list
    },
    message: "ok"
  }
}

// 获取收藏列表-分组
const getCollectionListByType = async (options) => {
  const countResult = await collection.where({ user_id: options.user_id, type: options.type }).count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = collection.where({ user_id: options.user_id, type: options.type }).skip(i * 100).limit(100).get()
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
  return {
    code: "200",
    data: {
      list: result.data
    },
    message: "ok"
  }
}

// 添加收藏
const addCollection = async (options) => {
  await collection.add({
      data: {
          pro_id: options.pro_id,
          user_id: options.user_id,
          type: options.type,
          _createTime: Date.now(),
          _updateTime: Date.now()
      }
  })
}

// 添加收藏
const addErrorBack = async (options) => {
  await errorCollection.add({
      data: {
          pro_id: options.pro_id,
          user_id: options.user_id,
          type: options.type,
          pro_type: options.pro_type,
          content: options.content,
          _createTime: Date.now(),
          _updateTime: Date.now()
      }
  })
}

// 取消收藏
const deleteCollection = async (options) => {
    await collection.where({
      pro_id: options.pro_id,
      user_id: options.user_id
    }).remove()
}

exports.main = async (event, context) => {
    const { func, data } = event;
    // const { OPENID, APPID, UNIONID } = cloud.getWXContext();
    let res;
    if (func === 'addCollection') {
      res = await addCollection(data);
    } else if (func === 'deleteCollection') {
      res = await deleteCollection(data);
    } else if (func === 'getCollectionList') {
      res = await getCollectionList(data);
    } else if (func === 'getCollectionListByType') {
      res = await getCollectionListByType(data);
    } else if (func === 'addErrorBack') {
      res = await addErrorBack(data);
    } 
    return res;
}
