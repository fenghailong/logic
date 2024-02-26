// 获取所有成语/实词
export async function getAllWordGroup(data) {
  return await wx.cloud.callFunction({
    name: 'wordGroup',
    data: {
      func: 'getAllWordGroup',
      data
    },
  })
}
// 获取所有成语/实词-学习记录
export async function getAllWordGroupRecord(data) {
  return await wx.cloud.callFunction({
    name: 'wordGroup',
    data: {
      func: 'getAllWordGroupRecord',
      data
    },
  })
}
// 获取所有成语/实词-测评记录
export async function getAllWordGroupEvaluation(data) {
  return await wx.cloud.callFunction({
    name: 'wordGroup',
    data: {
      func: 'getAllWordGroupEvaluation',
      data
    },
  })
}
// 获取已学习的信息
export async function getWordGroupList(data) {
  return await wx.cloud.callFunction({
    name: 'wordGroup',
    data: {
      func: 'getWordGroupList',
      data
    },
  })
}

// 获取用户当前学习成语或者词语的id
export async function getCurrenStudyWordGroupId(data) {
  return await wx.cloud.callFunction({
    name: 'wordGroup',
    data: {
      func: 'getCurrenStudyWordGroupId',
      data
    },
  })
}
// 获取成语词语组详情
export async function getWordGroupDetail(data) {
  return await wx.cloud.callFunction({
    name: 'wordGroup',
    data: {
      func: 'getWordGroupDetail',
      data
    },
  })
}
// 添加成语词语组
export async function addWordsGroup(data) {
  return await wx.cloud.callFunction({
    name: 'wordGroup',
    data: {
      func: 'addWordsGroup',
      data
    },
  })
}

// 获取一个成语/实词组 - 评测详情
export async function getWordGroupEvaDetail(data) {
  return await wx.cloud.callFunction({
    name: 'wordGroup',
    data: {
      func: 'getWordGroupEvaDetail',
      data
    },
  })
}

// 获取成语/实词组总数，已学数
export async function getAllEvaluationWordGroupCount(data) {
  return await wx.cloud.callFunction({
    name: 'wordGroup',
    data: {
      func: 'getAllEvaluationWordGroupCount',
      data
    },
  })
}

// 更新成语/实词组评测记录 - 更新
export async function upDateWordGroupEvaluation(data) {
  return await wx.cloud.callFunction({
    name: 'wordGroup',
    data: {
      func: 'upDateWordGroupEvaluation',
      data
    },
  })
}

// 分页获取成语/实词组评测记录 - 列表
export async function getEvaluationWordsQueryPage(data) {
  return await wx.cloud.callFunction({
    name: 'wordGroup',
    data: {
      func: 'getEvaluationWordsQueryPage',
      data
    },
  })
}

// 获取用户已经学习实词组和成语组的数量
export async function getWordGroupCount(data) {
  return await wx.cloud.callFunction({
    name: 'wordGroup',
    data: {
      func: 'getWordGroupCount',
      data
    },
  })
}