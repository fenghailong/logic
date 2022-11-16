import { request, authRequest } from '@/utils/request'

export async function getTopics(data) {
  return await wx.cloud.callFunction({
    name: 'topic',
    data: {
      func: 'getTopics',
      data
    },
  })
}

export async function getTopicById(data) {
  return await wx.cloud.callFunction({
    name: 'topic',
    data: {
      func: 'getTopicById',
      data
    },
  })
}

export async function addTopic(data) {
  return await wx.cloud.callFunction({
    name: 'topic',
    data: {
      func: 'addTopic',
      data
    },
  })
}

export function getCategories(data) {
  return request('categories')
}


export function getUserTopics(userId, data) {
  return request('users/' + userId + '/topics', {
    data: data
  })
}
export function deleteTopic(id, data) {
  return authRequest('topics/' + id, {
    method: 'DELETE',
    data: data
  })
}
