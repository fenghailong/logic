import { addMessage } from '@/api/subscribe'
export default {
  data: {
  },
  methods: {
    async onSubscribe() {
      let lessonTmplId = 'YYZyC81sN90SfsOfzO8e2bzsX_spTgvnRSl6fckmHuA'
      let subscribeMessage = await wx.requestSubscribeMessage({
        tmplIds: [lessonTmplId]
      })
      console.log(subscribeMessage)
      if (subscribeMessage[lessonTmplId] === 'accept') {
        wx.showLoading({
          title: '订阅中',
          mask:true
        })
        await addMessage({
          templateId: lessonTmplId,
          user_id: this._id
        })
        await this.$store.dispatch('login')
        wx.hideLoading();
        wx.showToast({
          title: '订阅成功'
        });
      }
    },
  }
}
