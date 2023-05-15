import { request, authRequest, uploadFile } from '@/utils/request'

export async function addMessage(data) {
  return await wx.cloud.callFunction({
    name: 'subscribe',
    data: {
      func: 'addMessage',
      data,
    },
  })
}

export async function sendMessage(data) {
  return await wx.cloud.callFunction({
    name: 'subscribe',
    data: {
      func: 'sendMessage',
      data,
    },
  })
}
