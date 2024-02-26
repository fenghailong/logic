// 收藏
export async function addCollection(data) {
  return await wx.cloud.callFunction({
    name: 'collect',
    data: {
      func: 'addCollection',
      data,
    },
  })
}

// 取消收藏
export async function deleteCollection(data) {
  return await wx.cloud.callFunction({
    name: 'collect',
    data: {
      func: 'deleteCollection',
      data,
    },
  })
}

// 获取收藏列表
export async function getCollectionList(data) {
  return await wx.cloud.callFunction({
    name: 'collect',
    data: {
      func: 'getCollectionList',
      data,
    },
  })
}

// 获取收藏列表
export async function getCollectionListByType(data) {
  return await wx.cloud.callFunction({
    name: 'collect',
    data: {
      func: 'getCollectionListByType',
      data,
    },
  })
}

// 获取收藏列表
export async function addErrorBack(data) {
  return await wx.cloud.callFunction({
    name: 'collect',
    data: {
      func: 'addErrorBack',
      data,
    },
  })
}