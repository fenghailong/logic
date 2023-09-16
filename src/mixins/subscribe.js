import { addMessage } from '@/api/subscribe'
export default {
data: {
},
methods: {
    async onSubscribe() {
        let that = this
        let tmplId = 'YYZyC81sN90SfsOfzO8e2bzsX_spTgvnRSl6fckmHuA'
        await wx.requestSubscribeMessage({
            tmplIds: [tmplId],
            async success (res) {
                if (res[tmplId] == 'accept') {
                    wx.showLoading({
                        title: '订阅中',
                        mask:true
                    })
                    await addMessage({
                        templateId: tmplId,
                        user_id: that._id
                    })
                    await that.$store.dispatch('login')
                        wx.hideLoading();
                        wx.showToast({
                        title: '订阅成功'
                    });
                    // that.cloudSendMsg();
                } else if (res[tmplId] == 'reject') { // 用户拒绝授权
                    wx.showModal({
                        title: '温馨提示',
                        content: "您已关闭消息推送，可能会导致小程序异常，请点击确定跳转设置页面打开订阅消息。",
                        success: function(modal) {
                            if (modal.confirm) { // 点击确定
                                wx.openSetting({ withSubscriptions: true })
                            }
                        }
                    })
                }
            },
            fail(err) {
                if (err.errCode == '20004') {
                    wx.showModal({
                        title: '温馨提示',
                        content: "您的消息订阅主开关已关闭，可能会导致小程序异常，请点击确定跳转设置页面打开订阅消息。",
                        success: function(modal) {
                            if (modal.confirm) { // 点击确定
                                wx.openSetting({ withSubscriptions: true })
                            }
                        }
                    })
                }
            }
        })
    },
    // async onSubscribe() {
    //   let lessonTmplId = 'YYZyC81sN90SfsOfzO8e2bzsX_spTgvnRSl6fckmHuA'
    //   let subscribeMessage = await wx.requestSubscribeMessage({
    //     tmplIds: [lessonTmplId]
    //   })
    //   console.log(subscribeMessage,'==============')
    //   if (subscribeMessage[lessonTmplId] === 'accept') {
    //     wx.showLoading({
    //       title: '订阅中',
    //       mask:true
    //     })
    //     await addMessage({
    //       templateId: lessonTmplId,
    //       user_id: this._id
    //     })
    //     await this.$store.dispatch('login')
    //     wx.hideLoading();
    //     wx.showToast({
    //       title: '订阅成功'
    //     });
    //   }
    // },
  }
}
