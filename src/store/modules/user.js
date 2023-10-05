import wepy from '@wepy/core'
import { login, refresh, register } from '@/api/auth'
import * as auth from '@/utils/auth'
import isEmpty from 'lodash/isEmpty'
import { getUser, logout, updateUser } from '@/api/user'

const getDefaultState = () => {
  return {
    user: auth.getUser(),
    _id: auth.getId()
  }
}

const state = getDefaultState()

// 定义 getters
var getters = {
  isLoggedIn: state => !isEmpty(state.user),
  user: state => state.user,
  _id: state => state._id
}

// 定义 actions
const actions = {
  async login ({ dispatch, commit }) {
    const authResponse = await login()
    // console.log(authResponse, '========login')
    console.log(authResponse.result[0], '========login')
    commit('setId', authResponse.result[0])
    commit('setUser', authResponse.result[0])
    auth.setUser(authResponse.result[0])
    auth.setId(authResponse.result[0])
  },

  async getUser ({ dispatch, commit }) {
    const userResponse = await getUser()
    commit('setUser', userResponse.result[0])
    auth.setUser(userResponse.result[0])
  },

  async refresh ({ dispatch, commit, state }, params = {}) {
    const refreshResponse = await refresh(state.accessToken)
    commit('setToken', refreshResponse.data)
    auth.setToken(refreshResponse.data)
    dispatch('getUser')
  },

  async updateUser ({ commit }, params = {}) {
    const editResponse = await updateUser(params)
    console.log(editResponse)
    commit('setUser', editResponse.result)
    auth.setUser(editResponse.result)
  }
}

// 定义 mutations
const mutations = {
  setUser(state, user) {
    state.user = user
  },
  setId(state, tokenPayload) {
    state._id = tokenPayload._id
    // state._id = 'def1da45650eaf1103c840f72b76cb09'
  },
  resetState: (state) => {
    Object.assign(state, getDefaultState())
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
