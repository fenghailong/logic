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
