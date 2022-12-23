import { request, authRequest } from '@/utils/request'

export async function getArticleCount(data) {
  return await wx.cloud.callFunction({
    name: 'article',
    data: {
      func: 'getArticleCount',
      data
    },
  })
}

export async function getArticleStudyCount(data) {
  return await wx.cloud.callFunction({
    name: 'article',
    data: {
      func: 'getArticleStudyCount',
      data
    },
  })
}

export async function getArticleList(data) {
  return await wx.cloud.callFunction({
    name: 'article',
    data: {
      func: 'getArticleList',
      data
    },
  })
}

export async function getArticleDetail(data) {
  return await wx.cloud.callFunction({
    name: 'article',
    data: {
      func: 'getArticleDetail',
      data
    },
  })
}
