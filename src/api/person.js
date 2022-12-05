import { request, authRequest } from '@/utils/request'

export async function getPersonCount(data) {
  return await wx.cloud.callFunction({
    name: 'person',
    data: {
      func: 'getPersonCount',
      data
    },
  })
}

export async function getPersonStudyCount(data) {
  return await wx.cloud.callFunction({
    name: 'person',
    data: {
      func: 'getPersonStudyCount',
      data
    },
  })
}

export async function getPersonList(data) {
  return await wx.cloud.callFunction({
    name: 'person',
    data: {
      func: 'getPersonList',
      data
    },
  })
}

export async function getPersonDetail(data) {
  return await wx.cloud.callFunction({
    name: 'person',
    data: {
      func: 'getPersonDetail',
      data
    },
  })
}
