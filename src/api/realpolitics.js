export async function getRealpoliticsList(data) {
  return await wx.cloud.callFunction({
    name: 'realpolitics',
    data: {
      func: 'getRealpoliticsList',
      data
    },
  })
}

export async function getRealpoliticsByModuleId(data) {
  return await wx.cloud.callFunction({
    name: 'realpolitics',
    data: {
      func: 'getRealpoliticsByModuleId',
      data
    },
  })
}

export async function getRealpoliticsByDetailId(data) {
  return await wx.cloud.callFunction({
    name: 'realpolitics',
    data: {
      func: 'getRealpoliticsByDetailId',
      data
    },
  })
}
