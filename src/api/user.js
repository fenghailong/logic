import { request, authRequest, uploadFile } from '@/utils/request'

export async function getUser(data) {
  return await wx.cloud.callFunction({
    name: 'user',
    data: {
      func: 'getUser',
      data,
    },
  })
}

export async function updateUser(data) {
  return await wx.cloud.callFunction({
    name: 'user',
    data: {
      func: 'updateUser',
      data,
    },
  })
}

export function getCurrentUser(data) {
  return authRequest('user')
}

export function logout(token) {
  return request('authorizations/current', {
    method: 'delete',
    header: {
      'Authorization': 'Bearer ' + token
    }
  })
}


export function updateAvatar(avatar) {
  return uploadFile('images', {
    method: 'POST',
    name: 'image',
    formData: {
      type: 'avatar'
    },
    filePath: avatar
  })
}

// export function getUser(id) {
//   return request('users/' + id)
// }

export function getPerms() {
  return authRequest('user/permissions')
}
