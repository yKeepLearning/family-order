const { getDishes, addDish, updateDish } = require('../../../utils/api')

Page({
  data: {
    dishes: [],
    showAdd: false,
    showCatPicker: false,
    form: { name: '', emoji: '🍜', desc: '', category: '肉类', cookTime: '15' },
    categories: [
      { value: '火锅', label: '火锅' }, { value: '凉菜', label: '凉菜' },
      { value: '热菜', label: '热菜' }, { value: '汤羹', label: '汤羹' },
      { value: '酒水', label: '酒水' }, { value: '水果', label: '水果' }
    ],
    statusBarHeight: 44
  },
  onShow() {
    if (this.data.statusBarHeight === 44) this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
    this.load()
  },
  load() { getDishes().then(r => { if (r.success) this.setData({ dishes: r.data }) }).catch(() => {}) },
  onToggle(e) {
    const id = e.currentTarget.dataset.id
    const dish = this.data.dishes.find(d => d.id === id)
    if (!dish) return
    updateDish(id, { isAvailable: !dish.isAvailable }).then(r => { if (r.success) this.load() }).catch(() => {})
  },
  onDelete(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({ title: '确认删除', content: '确定删除这道菜？', success: (r) => {
      if (!r.confirm) return
      updateDish(id, { deleted: true }).then(() => this.load()).catch(() => {})
    }})
  },
  onOpenAdd() { this.setData({ showAdd: true, form: { name: '', emoji: '🍜', desc: '', category: '肉类', cookTime: '15' }, showCatPicker: false }) },
  onCloseAdd() { this.setData({ showAdd: false }) },
  onFormName(e) { this.setData({ 'form.name': e.detail.value }) },
  onFormEmoji(e) { this.setData({ 'form.emoji': e.detail.value }) },
  onFormDesc(e) { this.setData({ 'form.desc': e.detail.value }) },
  onFormCookTime(e) { this.setData({ 'form.cookTime': e.detail.value }) },
  onToggleCatPicker() { this.setData({ showCatPicker: !this.data.showCatPicker }) },
  onPickCat(e) { this.setData({ 'form.category': e.currentTarget.dataset.cat, showCatPicker: false }) },
  onSubmitDish() {
    const { name, emoji, category, desc, cookTime } = this.data.form
    if (!name.trim()) return
    addDish({ name: name.trim(), emoji: emoji || '🍽️', category, description: desc.trim(), cookTime: parseInt(cookTime) || 15 }).then(r => {
      if (r.success) { this.setData({ showAdd: false }); this.load() }
      else wx.showToast({ title: '添加失败', icon: 'none' })
    }).catch(() => wx.showToast({ title: '网络错误', icon: 'none' }))
  },
  onTabClick(e) {
    if (e.currentTarget.dataset.idx == 1) wx.redirectTo({ url: '/pages/chef/board/board' })
  },
  onGoHome() { getApp().globalData.role = ''; wx.reLaunch({ url: '/pages/index/index' }) },
  noop() {}
})
