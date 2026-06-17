const { addDish } = require('../../../utils/api')

Page({
  data: {
    categories: [
      { label: '火锅', value: '火锅', icon: '🍲' }, { label: '凉菜', value: '凉菜', icon: '🥗' },
      { label: '热菜', value: '热菜', icon: '🍳' }, { label: '汤羹', value: '汤羹', icon: '🍜' },
      { label: '酒水', value: '酒水', icon: '🍺' }, { label: '水果', value: '水果', icon: '🍉' }
    ],
    name: '', category: '火锅', emoji: '', desc: '', loading: false, statusBarHeight: 44
  },
  onLoad() { this.setData({ statusBarHeight: getApp().globalData.statusBarHeight }) },
  onNameInput(e) { this.setData({ name: e.detail.value }) },
  onEmojiInput(e) { this.setData({ emoji: e.detail.value }) },
  onDescInput(e) { this.setData({ desc: e.detail.value }) },
  onSelectCat(e) { this.setData({ category: e.currentTarget.dataset.cat }) },
  onSave() {
    if (!this.data.name.trim()) { wx.showToast({ title: '请输入名称', icon: 'none' }); return }
    if (this.data.loading) return
    this.setData({ loading: true })
    addDish({ name: this.data.name.trim(), category: this.data.category, emoji: this.data.emoji || '🍽️', description: this.data.desc.trim() }).then(res => {
      if (res.success) { wx.showToast({ title: '添加成功', icon: 'success' }); setTimeout(() => wx.navigateBack(), 500) }
      else { wx.showToast({ title: res.msg || '添加失败', icon: 'none' }); this.setData({ loading: false }) }
    }).catch(() => { wx.showToast({ title: '网络错误', icon: 'none' }); this.setData({ loading: false }) })
  },
  onBack() { wx.navigateBack() }
})
