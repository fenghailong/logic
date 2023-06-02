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
