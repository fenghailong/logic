// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'prod-2gzhco766f4e1e27'
});
const db = cloud.database();
const collection = db.collection('userCount');
const _ = db.command
const $ = db.command.aggregate

// 获取所有词语
const getUserCountInfo = async (options) => {
  const result = await collection.where({
    isIdiom: options.isIdiom,
    isNotional: options.isNotional
  }).count()
  console.log(result.total)
  return {
    code: "200",
    data: {
      count: result.total
    },
    message: "ok"
  }
}

const reflashUserCount = async (options) => {
  const hasWord = await collection.where({user_id: options.user_id}).get();
  if (Array.isArray(hasWord.data) && hasWord.data.length === 0) {
    await addUserCount(options);
  }
  await upDateUserCount(options)
}

// 更新是否学习成语 实词
const upDateUserCount = async (options) => {
  if (options.type === 1) { // 成语
    await collection.where({user_id: options.user_id}).update({
      // data 传入需要局部更新的数据
      data: {
        isIdiom: '1',
        _updateTime: Date.now()
      }
    })
  } else if (options.type === 2) { // 实词
    await collection.where({user_id: options.user_id}).update({
      // data 传入需要局部更新的数据
      data: {
        isNotional: '1',
        _updateTime: Date.now()
      }
    })
  }
}

const addUserCount = async (options) => {
  await collection.add({
    data: {
      user_id: options.user_id,
      isIdiom: '2',
      isNotional: '2',
      _createTime: Date.now(),
      _updateTime: Date.now()
    }
  })
}

exports.main = async (event, context) => {
  const { func, data } = event;
  // const { OPENID, APPID, UNIONID } = cloud.getWXContext();
  let res;
  if (func === 'getUserCountInfo') { // 获取已经学习人数
    res = await getUserCountInfo(data);
  }
  else if (func === 'reflashUserCount') { // 更新用户学习模块状态
    res = await reflashUserCount(data);
  }
  return res;
}
