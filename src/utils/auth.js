export function getUser() {
  return wx.getStorageSync('user')
}

export function setUser(user, perms) {
  return wx.setStorageSync('user', user)
}

export function getId() {
  return wx.getStorageSync('_id')
}

export function setId(tokenPayload) {
  const _id = tokenPayload._id
  wx.setStorageSync('_id', _id)
}

export function logout() {
  return wx.clearStorage()
}

export function getPerms() {
  return wx.getStorageSync('perms')
}

export function setPerms(perms) {
  return wx.setStorageSync('perms', perms)
}
