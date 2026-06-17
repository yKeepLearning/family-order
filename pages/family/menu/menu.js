const { getDishes, createOrder, getOrders } = require('../../../utils/api')

Page({
  data: {
    tab: 'menu', dinerName: '小明',
    dishes: [], filteredDishes: [], myOrders: [], reversedOrders: [], pendingCount: 0,
    cart: [], cartItems: [], groupedCart: [], cartTotal: 0, cartOpen: false, note: '',
    categories: [
      { value: '火锅', label: '火锅' }, { value: '凉菜', label: '凉菜' },
      { value: '热菜', label: '热菜' }, { value: '汤羹', label: '汤羹' },
      { value: '酒水', label: '酒水' }, { value: '水果', label: '水果' }
    ],
    activeCat: '火锅', statusBarHeight: 44
  },
  onShow() {
    if (this.data.statusBarHeight === 44) this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
    this.loadDishes(); this.loadOrders()
  },
  loadDishes() {
    getDishes().then(r => {
      if (!r.success) return
      this.setData({ dishes: r.data.filter(d => d.isAvailable) }, () => this.buildCartView())
    }).catch(() => {})
  },
  loadOrders() {
    getOrders().then(r => {
      if (!r.success) return
      const my = r.data.filter(o => o.dinerName === this.data.dinerName)
      const rev = [...my].reverse().map(o => {
        const g = {}
        for (const ci of o.items) {
          const d = this.data.dishes.find(x => x.id === ci.id)
          const cat = d ? d.category : '其他'
          if (!g[cat]) g[cat] = []; g[cat].push(ci)
        }
        return { ...o, itemsGrouped: Object.keys(g).map(c => ({ cat: c, items: g[c] })), timeText: this.fmt(o.createTime) }
      })
      this.setData({ myOrders: my, reversedOrders: rev, pendingCount: my.filter(o => o.status !== 'served').length })
    }).catch(() => {})
  },
  buildCartView() {
    const cart = this.data.cart
    const dishes = this.data.dishes.map(d => {
      const ci = cart.find(c => c.dishId === d.id)
      return { ...d, cartQty: ci ? ci.quantity : 0 }
    })
    const cg = {}
    for (const c of cart) {
      const d = this.data.dishes.find(x => x.id === c.dishId)
      const cat = (c.dish && c.dish.category) || (d ? d.category : '其他')
      if (!cg[cat]) cg[cat] = []; cg[cat].push(c)
    }
    this.setData({
      dishes, cartItems: cart,
      groupedCart: Object.keys(cg).map(c => ({ cat: c, items: cg[c] })),
      cartTotal: cart.reduce((s, c) => s + c.quantity, 0)
    }, () => this.setData({ filteredDishes: dishes.filter(d => d.category === this.data.activeCat) }))
  },
  onSwitchCat(e) { this.setData({ activeCat: e.currentTarget.dataset.cat, filteredDishes: this.data.dishes.filter(d => d.category === e.currentTarget.dataset.cat) }) },
  onSwitchTab(e) { this.setData({ tab: e.currentTarget.dataset.tab }) },
  onCartPlus(e) {
    const id = e.currentTarget.dataset.id || (e.currentTarget.dataset.dish && e.currentTarget.dataset.dish.id)
    if (!id) return
    const cart = [...this.data.cart]; const idx = cart.findIndex(c => c.dishId === id)
    if (idx >= 0) cart[idx] = { ...cart[idx], quantity: cart[idx].quantity + 1 }
    else { const d = this.data.dishes.find(x => x.id === id); if (!d) return; cart.push({ dishId: d.id, dish: { id: d.id, name: d.name, emoji: d.emoji, cookTime: d.cookTime, category: d.category }, quantity: 1 }) }
    this.setData({ cart }, () => this.buildCartView())
  },
  onCartMinus(e) {
    const cart = [...this.data.cart]; const idx = cart.findIndex(c => c.dishId === e.currentTarget.dataset.id)
    if (idx < 0) return
    if (cart[idx].quantity === 1) cart.splice(idx, 1); else cart[idx] = { ...cart[idx], quantity: cart[idx].quantity - 1 }
    this.setData({ cart }, () => this.buildCartView())
  },
  onOpenCart() { this.setData({ cartOpen: true }) },
  onCloseCart() { this.setData({ cartOpen: false }) },
  onNoteInput(e) { this.setData({ note: e.detail.value }) },
  onSubmitOrder() {
    if (!this.data.cart.length) return
    const items = this.data.cart.map(c => ({ id: c.dishId, name: c.dish.name, emoji: c.dish.emoji, quantity: c.quantity }))
    createOrder({ items, notes: this.data.note, dinerName: this.data.dinerName }).then(r => {
      if (r.success) { this.setData({ cart: [], cartOpen: false, note: '', tab: 'orders' }); this.loadOrders() }
      else wx.showToast({ title: '下单失败', icon: 'none' })
    }).catch(() => wx.showToast({ title: '网络错误', icon: 'none' }))
  },
  onEditName() { wx.showModal({ title: '修改昵称', editable: true, placeholderText: this.data.dinerName, success: r => { if (r.confirm && r.content) this.setData({ dinerName: r.content }) } }) },
  onGoHome() { getApp().globalData.role = ''; wx.reLaunch({ url: '/pages/index/index' }) },
  noop() {},
  fmt(t) { if (!t) return ''; const d = new Date(t); return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` }
})
