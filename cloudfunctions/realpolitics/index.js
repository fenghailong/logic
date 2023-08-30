// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'prod-2gzhco766f4e1e27'
});
const db = cloud.database();
const collection = db.collection('knowledgeDetail');
const questionRCollection = db.collection('question_record');

// 获取模块下的已经掌握的实时政治知识列表
const getRealpoliticsList = async (options) => {
  const result = await collection.where({ module_id: options.module_id }).get()
  let realpoliticsList = result.data
  let resList = []
  if (realpoliticsList.length > 0){
    realpoliticsList.map(element => {
      element.isStudyed = false
      let temp = {}
      temp._id = element._id
      temp.title = element.title
      resList.push(temp)
    });
  }
  let res = {
    realpoliticsList: resList,
  }
  return res;
}
// 获取时政详情
const getRealpoliticsByModuleId = async (options) => {
  console.log(options, '==============')
  const result = await collection.where({ module_id: options.module_id }).get()
  return result
}

// 获取时政详情
const getRealpoliticsByDetailId = async (options) => {
  console.log(options)
  const result = await collection.where({ _id: options.id }).get()
  return result
}

// 清除时政刷题记录
const clearQusetion = async (options) => {
  console.log(options)
  // let result = await questionRCollection.where({ module_id: options.module_id , user_id: options.user_id}).get()
  // console.log(result)
  await questionRCollection.where({ module_id: options.module_id , user_id: options.user_id}).update({
    // data 传入需要局部更新的数据
    data: {
      isRight: '3'
    }
  })
  // return result
}

exports.main = async (event, context) => {
  const { func, data } = event;
  // const { OPENID, APPID, UNIONID } = cloud.getWXContext();
  let res;
  if (func === 'getRealpoliticsList') {
    res = await getRealpoliticsList(data);
  } else if(func === 'getRealpoliticsByModuleId') {
    res = await getRealpoliticsByModuleId(data);
  } else if(func === 'getRealpoliticsByDetailId') {
    res = await getRealpoliticsByDetailId(data);
  } else if(func === 'clearQusetion') {
    res = await clearQusetion(data);
  }
  return res;
}
