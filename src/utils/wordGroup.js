// 获取成语列表
export function getIdiomGroupList() {
    return wx.getStorageSync('idiomGroupList')
}
// 设置成语列表
export function setIdiomGroupList(idiomGroupList) {
    wx.setStorageSync('idiomGroupList', idiomGroupList)
}

// 获取当前成语Id
export function getIdiomGroupId() {
    return wx.getStorageSync('idiomGroupId')
}
// 设置当前成语Id
export function setIdiomGroupId(idiomGroupId) {
    wx.setStorageSync('idiomGroupId', idiomGroupId)
}

// 获取实词列表
export function getNotionalGroupList() {
    return wx.getStorageSync('notionalGroupList')
}

// 设置实词列表
export function setNotionalGroupList(notionalGroupList) {
    wx.setStorageSync('notionalGroupList', notionalGroupList)
}

// 获取当前实词Id
export function getNotionalGroupId() {
    return wx.getStorageSync('notionalGroupId')
}
// 设置当前实词Id
export function setNotionalGroupId(notionalGroupId) {
    wx.setStorageSync('notionalGroupId', notionalGroupId)
}

// 获取成语已学数量
export function getIdiomGroupStudyCount() {
    return wx.getStorageSync('idiomGroupStudyCount')
}
// 设置成语已学数量
export function setIdiomGroupStudyCount(idiomGroupStudyCount) {
    wx.setStorageSync('idiomGroupStudyCount', idiomGroupStudyCount)
}

// 获取实词已学数量
export function getNotionalGroupStudyCount() {
    return wx.getStorageSync('notionalGroupStudyCount')
}
// 设置实词已学数量
export function setNotionalGroupStudyCount(notionalGroupStudyCount) {
    wx.setStorageSync('notionalGroupStudyCount', notionalGroupStudyCount)
}