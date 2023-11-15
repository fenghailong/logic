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
  // const _id = '7dc1d502652bf588071ed42143a37fc3'

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
