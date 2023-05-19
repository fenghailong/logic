import { request, authRequest } from '@/utils/request'

export async function getAllModules(data) {
  return await wx.cloud.callFunction({
    name: 'knowledgeModule',
    data: {
      func: 'getAllModules',
      data
    },
  })
}

export async function getModulesById(data) {
  return await wx.cloud.callFunction({
    name: 'knowledgeModule',
    data: {
      func: 'getModulesById',
      data
    },
  })
}

// 事业单位获取详情
export async function getKnowledgeDetailById(data) {
  return await wx.cloud.callFunction({
    name: 'knowledgeDetail',
    data: {
      func: 'getKnowledgeDetailById',
      data
    },
  })
}

// 改版后获取详情
export async function getKnowledgeDetail(data) {
  return await wx.cloud.callFunction({
    name: 'knowledgeDetail',
    data: {
      func: 'getKnowledgeDetail',
      data
    },
  })
}

export async function deleteNotes(data) {
  return await wx.cloud.callFunction({
    name: 'knowledgeDetail',
    data: {
      func: 'deleteNotes',
      data
    },
  })
}

export async function addNotes(data) {
  return await wx.cloud.callFunction({
    name: 'knowledgeDetail',
    data: {
      func: 'addNotes',
      data
    },
  })
}

export async function getNotes(data) {
  return await wx.cloud.callFunction({
    name: 'knowledgeDetail',
    data: {
      func: 'getNotes',
      data
    },
  })
}

// 获取知识详情的例题
export async function getQuestions(data) {
  return await wx.cloud.callFunction({
    name: 'knowledgeDetail',
    data: {
      func: 'getQuestions',
      data
    },
  })
}


export async function getEvaluationById(data) {
  return await wx.cloud.callFunction({
    name: 'knowledgeModule',
    data: {
      func: 'getEvaluationById',
      data
    },
  })
}

export async function addEvaluationRecord(data) {
  return await wx.cloud.callFunction({
    name: 'knowledgeModule',
    data: {
      func: 'addEvaluationRecord',
      data
    },
  })
}


// 判断非会员学习数量
export async function getEvaluationRecordCount(data) {
  return await wx.cloud.callFunction({
    name: 'knowledgeModule',
    data: {
      func: 'getEvaluationRecordCount',
      data
    },
  })
}
