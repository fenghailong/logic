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

export async function getWordGroupDetail(data) {
  return await wx.cloud.callFunction({
    name: 'wordGroup',
    data: {
      func: 'getWordGroupDetail',
      data
    },
  })
}
