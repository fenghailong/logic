export async function doPay(data) {
    return await wx.cloud.callFunction({
        name: 'pay',
        data: {
            func: 'doPay',
            data
        }
    })
}