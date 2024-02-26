import * as wordGroup from '@/utils/wordGroup'
import isEmpty from 'lodash/isEmpty'
import { getAllWordGroup, getAllWordGroupRecord, getCurrenStudyWordGroupId, getAllWordGroupEvaluation } from '@/api/wordGroup'

const getDefaultState = () => {
    return {
        idiomGroupList: wordGroup.getIdiomGroupList(), // 成语列表
        idiomGroupStudyCount: wordGroup.getIdiomGroupStudyCount(), // 成语已学数量
        idiomGroupId: wordGroup.getIdiomGroupId(), // 当前成语ID
        notionalGroupList: wordGroup.getNotionalGroupList(), // 实词列表
        notionalGroupStudyCount: wordGroup.getNotionalGroupStudyCount(), // 实词已学数量
        notionalGroupId: wordGroup.getNotionalGroupId() // 当前实词ID
    }
}

// 数组移动自定义的到最前面
const moveObjectsToFront = (arr, property, value) => {
  return arr.sort((a, b) => {
    if (a[property] === value) {
      return -1;
    } else if (b[property] === value) {
      return 1;
    } else {
      return 0;
    }
  });
}

const state = getDefaultState()

// 定义 getters
var getters = {
    idiomGroupList: state => state.idiomGroupList,
    idiomGroupId: state => state.idiomGroupId,
    idiomGroupStudyCount: state => state.idiomGroupStudyCount,
    notionalGroupList: state => state.notionalGroupList,
    notionalGroupId: state => state.notionalGroupId,
    notionalGroupStudyCount: state => state.notionalGroupStudyCount
}

// 定义 actions
const actions = {
  async getWordGroupList ({ dispatch, commit }, params = {}) {
    const result = await getAllWordGroup(params)
    const resultRecord = await getAllWordGroupRecord(params)
    const resultEvaluation = await getAllWordGroupEvaluation(params)
    
    console.log(resultRecord)
    const wordGroupList = result.result.length == 0 ? [] : result.result.data
    const wordGroupRecordList = resultRecord.result.length == 0 ? [] : resultRecord.result.data
    const wordGroupEvaluationList = resultEvaluation.result.length == 0 ? [] : resultEvaluation.result.data

    console.log(wordGroupRecordList)
    // 成语
    let idiomGroupList = wordGroupList.filter(item=> item.word_type === '1')
    idiomGroupList = moveObjectsToFront(idiomGroupList, 'from', '2')
    let idiomGroupRecordList = wordGroupRecordList.length > 0 ? wordGroupRecordList.filter(item=> item.word_group_type === '1') : []
    let idiomGroupEvaluationList = wordGroupEvaluationList.length > 0 ? wordGroupEvaluationList.filter(item=> item.type === '1') : []

    let idiomGroupStudyCount = idiomGroupRecordList.length

    idiomGroupList = idiomGroupList.map(element => {
      element.isStudyed = '2'
      element.isEvaluation = '2'
      idiomGroupRecordList.forEach(item => {
        if (item.word_group_id == element._id) {
          element.isStudyed = '1';
        }
      })
      idiomGroupEvaluationList.forEach(item => {
        if (item.word_group_id == element._id) {
          element.isEvaluation = '1';
        }
      })
      return element;
    });

    commit('setIdiomGroupList', idiomGroupList)
    wordGroup.setIdiomGroupList(idiomGroupList)
    commit('setIdiomGroupStudyCount', idiomGroupStudyCount)
    wordGroup.setIdiomGroupStudyCount(idiomGroupStudyCount)
    // 实词
    let notionalGroupList = wordGroupList.filter(item=> item.word_type === '2')
    notionalGroupList = moveObjectsToFront(notionalGroupList, 'from', '2')
    let notionalGroupRecordList = wordGroupRecordList.length > 0 ? wordGroupRecordList.filter(item=> item.word_group_type === '2') : []
    let notionalGroupEvaluationList = wordGroupEvaluationList.length > 0 ? wordGroupEvaluationList.filter(item=> item.type === '2') : []

    let notionalGroupStudyCount = notionalGroupRecordList.length

    notionalGroupList = notionalGroupList.map(element => {
      element.isStudyed = '2'
      element.isEvaluation = '2'
      notionalGroupRecordList.forEach(item => {
        if (item.word_group_id == element._id) {
          element.isStudyed = '1';
        }
      })
      notionalGroupEvaluationList.forEach(item => {
        if (item.word_group_id == element._id) {
          element.isEvaluation = '1';
        }
      })
      return element;
    });
    commit('setNotionalGroupList', notionalGroupList)
    wordGroup.setNotionalGroupList(notionalGroupList)
    commit('setNotionalGroupStudyCount', notionalGroupStudyCount)
    wordGroup.setNotionalGroupStudyCount(notionalGroupStudyCount)
  },
  async getCurrenStudyWordGroupId ({ dispatch, commit }, params = {}) {
    const result = await getCurrenStudyWordGroupId(params)
    console.log(result.result.data, 'result')
    const idiomCurrentId = result.result.data.idiomWordId
    const notionalCurrentId = result.result.data.notionalWordId
    // 成语
    commit('setIdiomGroupId', idiomCurrentId)
    wordGroup.setIdiomGroupId(idiomCurrentId)
    // 实词
    commit('setNotionalGroupId', notionalCurrentId)
    wordGroup.setNotionalGroupId(notionalCurrentId)
  }
}

// 定义 mutations
const mutations = {
  setIdiomGroupList(state, idiomGroupList) {
    state.idiomGroupList = idiomGroupList
  },
  setIdiomGroupId (state, idiomGroupId) {
    console.log(idiomGroupId, '?????????????????????')
    state.idiomGroupId = idiomGroupId
  },
  setIdiomGroupStudyCount (state, idiomGroupStudyCount) {
    state.idiomGroupStudyCount = idiomGroupStudyCount
  }, 
  setNotionalGroupList(state, notionalGroupList) {
    state.notionalGroupList = notionalGroupList
  },
  setNotionalGroupId (state, notionalGroupId) {
    state.notionalGroupId = notionalGroupId
  },
  setNotionalGroupStudyCount (state, notionalGroupStudyCount) {
    state.notionalGroupStudyCount = notionalGroupStudyCount
  }, 
}

export default {
  state,
  getters,
  actions,
  mutations
}
