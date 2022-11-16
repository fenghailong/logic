import { request, authRequest } from '@/utils/request'

export async function addReply(data) {
  return await wx.cloud.callFunction({
    name: 'reply',
    data: {
      func: 'addReply',
      data
    }
  })
}
export async function getReply(data) {
  return await wx.cloud.callFunction({
    name: 'reply',
    data: {
      func: 'getReply',
      data
    }
  })
}

export function getReplies(topicId, data) {
  return request('topics/' + topicId + '/replies', {
    data: data
  })
}

export function getUserReplies(userId, data) {
  return request('users/' + userId + '/replies', {
    data: data
  })
}

export function deleteReply(topicId, replyId) {
  return authRequest('topics/' + topicId + '/replies/' + replyId, {
    method: 'DELETE',
  })
}
