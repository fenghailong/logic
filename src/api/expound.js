// 按照地区分组获取所有申论试卷
export async function getAllExpoundExaminationArea(data) {
  return await wx.cloud.callFunction({
    name: 'expound',
    data: {
      func: 'getAllExpoundExaminationArea',
      data
    },
  })
}
// 根据试卷ID获取材料按照sort排序
export async function getExpoundMaterialById(data) {
  return await wx.cloud.callFunction({
    name: 'expound',
    data: {
      func: 'getExpoundMaterialById',
      data
    },
  })
}

// 根据试卷ID获取题目按照sort排序
export async function getExpoundQuestionById(data) {
  return await wx.cloud.callFunction({
    name: 'expound',
    data: {
      func: 'getExpoundQuestionById',
      data
    },
  })
}

// 根据试卷ID获取题目按照sort排序
export async function getExpoundAnswerById(data) {
  return await wx.cloud.callFunction({
    name: 'expound',
    data: {
      func: 'getExpoundAnswerById',
      data
    },
  })
}
