Page({
  data: { statusBarHeight: 44 },
  onLoad() {
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
  },
  onSelectChef() {
    getApp().globalData.role = 'chef'
    wx.reLaunch({ url: '/pages/chef/board/board' })
  },
  onSelectFoodie() {
    getApp().globalData.role = 'diner'
    wx.reLaunch({ url: '/pages/family/menu/menu' })
  }
})
