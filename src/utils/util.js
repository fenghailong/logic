import moment from 'moment'
import 'moment/locale/zh-cn'

export function diffForHumans(date, format = 'YYYYMMDD H:mm:ss') {
  moment.locale('zh-cn')
  // console.log(date, '========================')
  // console.log(moment(date, format))
  return moment(date).fromNow()
}
