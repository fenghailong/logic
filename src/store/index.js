import Vuex from '@wepy/x'
import users from './modules/user'
import wordGroup from './modules/wordGroup'
import notification from './modules/notification'

export default new Vuex.Store({
  modules: {
    users,
    wordGroup,
    notification
  }
})
