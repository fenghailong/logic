export function getUser() {
  return wx.getStorageSync('user')
}

export function setUser(user, perms) {
  return wx.setStorageSync('user', user)
}

export function getId() {
  console.log(wx.getStorageSync('_id'), '=========================')
  return wx.getStorageSync('_id')
}

export function setId(tokenPayload) {
  const _id = tokenPayload._id
  // const _id = 'def1da45650eaf1103c840f72b76cb09'

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
