App({
  onLaunch() {
    const info = wx.getSystemInfoSync()
    this.globalData.statusBarHeight = info.statusBarHeight
    this.globalData.navHeight = 44
  },
  globalData: {
    userInfo: null,
    role: '',
    cart: [],
    statusBarHeight: 44,
    navHeight: 44
  }
})
