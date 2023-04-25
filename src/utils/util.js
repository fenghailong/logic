import moment from 'moment'
import 'moment/locale/zh-cn'

export function diffForHumans(date, format = 'YYYYMMDD H:mm:ss') {
  moment.locale('zh-cn')
  return moment(date).fromNow()
}

export function getSystemData (attr) {
  return new Promise((resolve, reject) => {
    wx.getSystemInfo({
      success: (res) => {
        resolve(res[attr])
      }
    })
  })
}
export function queryNodes (id, attr) {
  return new Promise((resolve, reject) => {
    let query = wx.createSelectorQuery()
    query.select(id).boundingClientRect()
    query.exec((res) => {
      resolve(res[0][attr])
    })
  })
}
