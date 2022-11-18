import { request, authRequest } from '@/utils/request'

export async function getWordsCount(data) {
  return await wx.cloud.callFunction({
    name: 'words',
    data: {
      func: 'getWordsCount',
      data
    },
  })
}

// export async function getTopicById(data) {
//   return await wx.cloud.callFunction({
//     name: 'topic',
//     data: {
//       func: 'getTopicById',
//       data
//     },
//   })
// }

// export async function addTopic(data) {
//   return await wx.cloud.callFunction({
//     name: 'topic',
//     data: {
//       func: 'addTopic',
//       data
//     },
//   })
// }
