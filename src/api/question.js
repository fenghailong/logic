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
