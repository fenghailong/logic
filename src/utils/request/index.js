import wxTools from '../wxTools/index.js'
import { config } from '../../config/index.js'

const makeOptions = (options) => {
  const defaultoptions = {
    url: undefined,
    method: 'GET',
    // qs: undefined,
    data: undefined,
    headers: undefined,
    type: 'json',
    contentType: 'application/json'
  }

  let thisoptions = {}
  if (typeof options === 'string') {
    thisoptions.url = options
  } else {
    thisoptions = options
  }
  thisoptions = Object.assign({}, defaultoptions, thisoptions)

  return thisoptions
}

// const addQs = (url, qs) => {
//   let queryString = ''
//   let newUrl = url
//   if (qs && typeof qs === 'object') {
//     for (const k of Object.keys(qs)) {
//       queryString += `&${k}=${qs[k]}`
//     }
//     if (queryString.length > 0) {
//       if (url.split('?').length < 2) {
//         queryString = queryString.substring(1)
//       } else if (url.split('?')[1].length === 0) {
//         queryString = queryString.substring(1)
//       }
//     }

//     if (url.indexOf('?') === -1 && queryString.length > 0) {
//       newUrl = `${url}?${queryString}`
//     } else {
//       newUrl = `${url}${queryString}`
//     }
//   }
//   return newUrl
// }

module.exports = {

  methods: {
    // addQs,
    async api(options = {}, data = {}) {
      return await this.request({
        ...options,
        data
      })
    },
    request(options) {
      const opts = makeOptions(options)
      const {
        method,
        data,
        headers,
        // qs,
        type,
        contentType
      } = opts

      // console.log(qs)
      let requestUrl = `${config.configUrl}${opts.url}`

      // if (qs) requestUrl = addQs(requestUrl, qs)

      let header = headers

      if ((!headers || !headers['content-type']) && contentType) {
        header = Object.assign({}, headers, {
          'content-type': contentType
        })
      }

      return new Promise((resolve, reject) => {
        wx.request({
          url: requestUrl,
          method,
          data: data,
          header,
          dataType: type,
          success: async response => {
            console.log(opts, response)
            const res = {
              status: response.statusCode,
              statusText: response.errMsg,
              data: response.data
            }
            if (response.statusCode < 200 || response.statusCode >= 300) {
              reject(res)
            } else if (res.data.code != 0) {
              reject(res)
            } else {
              resolve(res.data)
            }
          },
          fail: async(err) => {
            reject(err)
            // const network = await wxTools.getNetworkType()
            // this.$clear()
            // reject({
            //   status: 0,
            //   statusText: '',
            //   errcode: -1,
            //   errmsg: `${err.errMsg}`
            // })
            // if (err.errMsg && err.errMsg.indexOf('abort') == -1 || network.networkType == 'none') {
            //   this.reload()
            // }
          }
        })
      })
    }
  },
}
