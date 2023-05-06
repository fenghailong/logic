export async function addActivateRecord(data) {
  return await wx.cloud.callFunction({
    name: 'activate',
    data: {
      func: 'addActivateRecord',
      data
    },
  })
}
