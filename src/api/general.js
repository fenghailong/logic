export async function getAllGeneralInfo(data) {
  return await wx.cloud.callFunction({
    name: 'general',
    data: {
      func: 'getAllGeneralInfo',
      data
    },
  })
}

export async function getKnowledgeDetailById(data) {
  return await wx.cloud.callFunction({
    name: 'general',
    data: {
      func: 'getKnowledgeDetailById',
      data
    },
  })
}

export async function addGeneralRecord(data) {
  return await wx.cloud.callFunction({
    name: 'general',
    data: {
      func: 'addGeneralRecord',
      data
    },
  })
}
