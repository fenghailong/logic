import { request } from '@/utils/request'

// export function login(data) {
//   return request('weapp/authorizations', {method: 'post', data: data})
// }
export async function login() {
  return await wx.cloud.callFunction({
    name: 'login'
  })
}

export function refresh(token) {
  return request('authorizations/current', {
    method: 'put',
    header: {
      'Authorization': 'Bearer ' + token
    }
  })
}

export function getCaptcha(phone) {
  return request('captchas', {
    method: 'post',
    data: {
      phone: phone
    }
  })
}

export function getVerificationCode(key, code) {
  return request('verificationCodes', {
    method: 'post',
    data: {
      captcha_key: key,
      captcha_code: code
    }
  })
}

export function register(data) {
  return request('weapp/users', {
    method: 'post',
    data: data
  })
}
