export async function getRealpoliticsList(data) {
  return await wx.cloud.callFunction({
    name: 'realpolitics',
    data: {
      func: 'getRealpoliticsList',
      data
    },
  })
}
