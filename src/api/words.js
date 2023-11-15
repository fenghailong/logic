import { request, authRequest } from '@/utils/request'

export async function getEvaluationWordsQueryPage(data) {
  return await wx.cloud.callFunction({
    name: 'words',
    data: {
      func: 'getEvaluationWordsQueryPage',
      data
    },
  })
}

export async function getAlredyEvaluationWordsQueryPage(data) {
  return await wx.cloud.callFunction({
    name: 'words',
    data: {
      func: 'getAlredyEvaluationWordsQueryPage',
      data
    },
  })
}

export async function getErrEvaluationWordsQueryPage(data) {
  return await wx.cloud.callFunction({
    name: 'words',
    data: {
      func: 'getErrEvaluationWordsQueryPage',
      data
    },
  })
}

export async function getSentenceById(data) {
  return await wx.cloud.callFunction({
    name: 'words',
    data: {
      func: 'getSentenceById',
      data
    },
  })
}

export async function getAllEvaluationWordsCount(data) {
  return await wx.cloud.callFunction({
    name: 'words',
    data: {
      func: 'getAllEvaluationWordsCount',
      data
    },
  })
}

export async function getWordByRandom(data) {
  return await wx.cloud.callFunction({
    name: 'words',
    data: {
      func: 'getWordByRandom',
      data
    },
  })
}

export async function upDateWordsEvaluation(data) {
  return await wx.cloud.callFunction({
    name: 'words',
    data: {
      func: 'upDateWordsEvaluation',
      data
    },
  })
}

export async function getWordsCount(data) {
  return await wx.cloud.callFunction({
    name: 'words',
    data: {
      func: 'getWordsCount',
      data
    },
  })
}

export async function getWordsStudyCount(data) {
  return await wx.cloud.callFunction({
    name: 'words',
    data: {
      func: 'getWordsStudyCount',
      data
    },
  })
}

export async function getWordsList(data) {
  return await wx.cloud.callFunction({
    name: 'words',
    data: {
      func: 'getWordsList',
      data
    },
  })
}

export async function getWordsDetail(data) {
  return await wx.cloud.callFunction({
    name: 'words',
    data: {
      func: 'getWordsDetail',
      data
    },
  })
}

export async function importWords(data) {
  return await wx.cloud.callFunction({
    name: 'import',
    data: {
      func: 'importWords',
      data
    },
  })
}

export async function refreshSynonym(data) {
  return await wx.cloud.callFunction({
    name: 'import',
    data: {
      func: 'refreshSynonym',
      data
    },
  })
}

export async function addWordsList(data) {
  return await wx.cloud.callFunction({
    name: 'import',
    data: {
      func: 'addWordsList',
      data
    },
  })
}

export async function getWAllList(data) {
  return await wx.cloud.callFunction({
    name: 'words',
    data: {
      func: 'getWAllList',
      data
    },
  })
}

// export async function addTopic(data) {
//   return await wx.cloud.callFunction({
//     name: 'topic',
//     data: {
//       func: 'addTopic',
//       data
//     },
//   })
// }
