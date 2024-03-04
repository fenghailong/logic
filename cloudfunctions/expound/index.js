// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'prod-2gzhco766f4e1e27'
});
const db = cloud.database();
const examinationCollection = db.collection('examination'); // 试卷
const expoundMaterialCollection = db.collection('expound_material'); // 材料
const expoundQuestionCollection = db.collection('expound_question'); // 题目
const expoundAnswerCollection = db.collection('expound_answer'); // 题目

// 获取所有公务员申论试卷
const getAllExpoundExamination = async (options) => {
  const countResult = await examinationCollection.where({
    type: '1',
    examination_type: '2'
  }).count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = examinationCollection.where({
      type: '1',
      examination_type: '2'
    }).skip(i * 100).limit(100).get()
    tasks.push(promise)
  }
  // 等待所有
  let result = (await Promise.all(tasks)).reduce((acc, cur) => {
    if(acc.length <= 0) acc.data = []
    if(cur.length <= 0) cur.data = []
    return {
      data: (acc.data.concat(cur.data)),
      errMsg: acc.errMsg,
    }
  },[])
  result.data = result.data || [] // 处理 没有数据时 reduce 结果 undefined 的情况
  result.total = total
  return result
}

// 按照地区分组获取所有申论试卷
const getAllExpoundExaminationArea = async (options) => {
  let data = await getAllExpoundExamination(options)
  const groupedProvince = data.data.reduce((result, student) => {
    const province = student.province;
    if (!result[province]) {
      result[province] = [];
    }
    result[province].push(student);
    return result;
  }, {});

  const groupedProvinceArray = Object.entries(groupedProvince).map(([key, value]) => ({
    province: key,
    list: value
  }));
  console.log(groupedProvinceArray)
  return groupedProvinceArray
}

// 根据试卷ID获取材料按照sort排序
const getExpoundMaterialById = async (options) => {
  const result = await expoundMaterialCollection.where({
    examination_id: options.examination_id
  })
  .orderBy('sort', 'asc')
  .get()
  console.log(result, '=============')
  return result.data
}

// 根据试卷ID获取题目按照sort排序
const getExpoundQuestionById = async (options) => {
  const result = await expoundQuestionCollection.where({
    examination_id: options.examination_id
  })
    .orderBy('sort', 'asc')
    .get()
  console.log(result, '=============')
  return result.data
}

// 根据试卷ID获取题目按照sort排序
const getExpoundAnswerById = async (options) => {
  const skipCount = (options.currPage - 1) * options.pageSize
  const countResult = await expoundAnswerCollection.where({ expound_question_id: options.expound_question_id}).count();
  const totalCount = countResult.total
  const totalPage = totalCount === 0 ? 0 : totalCount <= options.pageSize ? 1 : parseInt(totalCount / options.pageSize) + 1
  const result = await expoundAnswerCollection.where({
    expound_question_id: options.expound_question_id
  }).skip(skipCount).limit(options.pageSize).get()
  console.log(result, '=============')
  return {currPage: options.currPage, pageSize: options.pageSize, totalPage, totalCount, data: result.data}
}

exports.main = async (event, context) => {
  const { func, data } = event;
  // const { OPENID, APPID, UNIONID } = cloud.getWXContext();
  let res;
  if (func === 'getAllExpoundExaminationArea') {
    res = await getAllExpoundExaminationArea(data);
  } else if (func === 'getExpoundMaterialById') {
    res = await getExpoundMaterialById(data);
  } else if (func === 'getExpoundQuestionById') {
    res = await getExpoundQuestionById(data);
  } else if (func === 'getExpoundAnswerById') {
    res = await getExpoundAnswerById(data);
  }
  return res;
}
