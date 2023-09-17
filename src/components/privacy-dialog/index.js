let privacyHandler
let privacyResolves = new Set()
let closeOtherPageshowDialogHooks = new Set()

if (wx.onNeedPrivacyAuthorization) {
  wx.onNeedPrivacyAuthorization(resolve => {
    if (typeof privacyHandler === 'function') {
      privacyHandler(resolve)
    }
  })
}

const closeOtherPageshowDialog = (closeDialog) => {
  closeOtherPageshowDialogHooks.forEach(hook => {
    if (closeDialog !== hook) {
      hook()
    }
  })
}

Component({
  data: {
    visible: false,
    mini_logo: __wxConfig.accountInfo.icon,
    mini_name: __wxConfig.accountInfo.nickname
  },
  properties: {
    useSafeArea: { // 是否在非tabBar页面引用
      type: Boolean,
      value: true
    }
  },
  lifetimes: {
    attached() {
      const closeDialog = () => {
        this.hideDialog()
      }
      privacyHandler = resolve => {
        privacyResolves.add(resolve)
        this.showDialog()
        // 额外逻辑：当前页面的隐私弹窗弹起的时候，关掉其他页面的隐私弹窗
        closeOtherPageshowDialog(closeDialog)
      }
      this.closeDialog = closeDialog
      closeOtherPageshowDialogHooks.add(closeDialog)
    },
    detached() {
      closeOtherPageshowDialogHooks.delete(this.closeDialog)
    }
  },
  pageLifetimes: {
    show() {
      if (this.closeDialog) {
        privacyHandler = resolve => {
          privacyResolves.add(resolve)
          this.showDialog()
          // 额外逻辑：当前页面的隐私弹窗弹起的时候，关掉其他页面的隐私弹窗
          closeOtherPageshowDialog(this.closeDialog)
        }
      }
    }
  },
  methods: {
    handleAgree() {
      this.hideDialog()
      // 这里演示了同时调用多个wx隐私接口时要如何处理：让隐私弹窗保持单例，点击一次同意按钮即可让所有pending中的wx隐私接口继续执行
      privacyResolves.forEach(resolve => {
        resolve({
          event: 'agree',
          buttonId: 'agree-btn'
        })
      })
      privacyResolves.clear()
    },
    handleDisagree(e) {
      this.hideDialog()
      privacyResolves.forEach(resolve => {
        resolve({
          event: 'disagree'
        })
      })
      privacyResolves.clear()
    },
    showDialog() {
      if (!this.data.visible) {
        this.setData({
          visible: true
        })
        wx.setPageStyle({
          style: {
            overflow: 'hidden'
          }
        })
      }
    },
    hideDialog() {
      if (this.data.visible) {
        this.setData({
          visible: false
        })
        wx.setPageStyle({
          style: {
            overflow: 'auto'
          }
        })
      }
    },
    openPrivacyContract() {
      wx.openPrivacyContract({
        success: res => {
          console.log('openPrivacyContract success', res)
        },
        fail: err => {
          console.error('openPrivacyContract fail', err)
        }
      })
    },
    tabBarPageShow() {
      this.handleDisagree()
      if (this.closeDialog) {
        privacyHandler = resolve => {
          privacyResolves.add(resolve)
          this.showDialog()
          // 额外逻辑：当前页面的隐私弹窗弹起的时候，关掉其他页面的隐私弹窗
          closeOtherPageshowDialog(this.closeDialog)
        }
      }
    }
  }
})