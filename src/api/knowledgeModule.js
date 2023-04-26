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

export async function getKnowledgeDetailById(data) {
  return await wx.cloud.callFunction({
    name: 'knowledgeDetail',
    data: {
      func: 'getKnowledgeDetailById',
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

export async function getEvaluationById(data) {
  return await wx.cloud.callFunction({
    name: 'knowledgeModule',
    data: {
      func: 'getEvaluationById',
      data
    },
  })
}
