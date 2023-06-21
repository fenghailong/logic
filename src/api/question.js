// 获取一次刷题题目
export async function getQuestionById(data) {
  return await wx.cloud.callFunction({
    name: 'question',
    data: {
      func: 'getQuestionById',
      data
    },
  })
}

// 获取一次刷题题目（百日刷题）
export async function getQuestionBymodule(data) {
  return await wx.cloud.callFunction({
    name: 'question',
    data: {
      func: 'getQuestionBymodule',
      data
    },
  })
}

// 获取模块题目数量
export async function getQuestionCountById(data) {
  return await wx.cloud.callFunction({
    name: 'question',
    data: {
      func: 'getQuestionCountById',
      data
    },
  })
}

// 获取模块题目数量
export async function getAllErrQuestionById(data) {
  return await wx.cloud.callFunction({
    name: 'question',
    data: {
      func: 'getAllErrQuestionById',
      data
    },
  })
}

// 获取分页查询模块题目数量
export async function getErrQuestionQueryPage(data) {
  return await wx.cloud.callFunction({
    name: 'question',
    data: {
      func: 'getErrQuestionQueryPage',
      data
    },
  })
}

// 获取一次刷题题目
export async function addQuestionRecord(data) {
  return await wx.cloud.callFunction({
    name: 'question',
    data: {
      func: 'addQuestionRecord',
      data
    },
  })
}

// 获取一次刷题题目
export async function getPractise(data) {
  return await wx.cloud.callFunction({
    name: 'question',
    data: {
      func: 'getPractise',
      data
    },
  })
}

// 获取练习记录列表
export async function getPractiseList(data) {
  return await wx.cloud.callFunction({
    name: 'question',
    data: {
      func: 'getPractiseList',
      data
    },
  })
}

// 获取一次刷题题目
export async function getPractiseById(data) {
  return await wx.cloud.callFunction({
    name: 'question',
    data: {
      func: 'getPractiseById',
      data
    },
  })
}
// 获取一次刷题题目
export async function addPractise(data) {
  return await wx.cloud.callFunction({
    name: 'question',
    data: {
      func: 'addPractise',
      data
    },
  })
}

// 获取一次刷题题目
export async function updatePractise(data) {
  return await wx.cloud.callFunction({
    name: 'question',
    data: {
      func: 'updatePractise',
      data
    },
  })
}
