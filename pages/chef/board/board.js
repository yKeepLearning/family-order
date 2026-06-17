const { getOrders, updateOrder, getDishes } = require('../../../utils/api')

Page({
  data: {
    segments: [
      { key: 'pending', label: '新订单', count: 0 },
      { key: 'cooking', label: '制作中', count: 0 },
      { key: 'served', label: '已出餐', count: 0 }
    ],
    activeSeg: 'pending',
    orders: [],
    filteredOrders: [],
    totalActive: 0,
    statusBarHeight: 44
  },
  onShow() {
    if (this.data.statusBarHeight === 44) this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
    this.load()
  },
  load() {
    Promise.all([getOrders(), getDishes()]).then(([or, dr]) => {
      if (!or.success) return
      const dishes = dr.success ? dr.data : []
      const orders = or.data.map(o => {
        const g = {}
        for (const ci of o.items) {
          const d = dishes.find(x => x.id === ci.id)
          const cat = d ? d.category : '其他'
          if (!g[cat]) g[cat] = []; g[cat].push(ci)
        }
        return { ...o, itemsGrouped: Object.keys(g).map(c => ({ cat: c, items: g[c] })), timeText: this.fmt(o.createTime) }
      })
      const counts = { pending: 0, cooking: 0, served: 0 }
      orders.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++ })
      this.setData({
        orders,
        segments: this.data.segments.map(s => ({ ...s, count: counts[s.key] || 0 })),
        totalActive: counts.pending + counts.cooking
      }, () => this.filter())
    }).catch(() => {})
  },
  onSwitchSeg(e) { this.setData({ activeSeg: e.currentTarget.dataset.key }, () => this.filter()) },
  filter() {
    this.setData({ filteredOrders: this.data.orders.filter(o => o.status === this.data.activeSeg) })
  },
  onAccept(e) {
    updateOrder(e.currentTarget.dataset.id, { status: 'cooking' }).then(r => { if (r.success) this.load() }).catch(() => {})
  },
  onDone(e) {
    updateOrder(e.currentTarget.dataset.id, { status: 'served' }).then(r => { if (r.success) this.load() }).catch(() => {})
  },
  onTabClick(e) {
    if (e.currentTarget.dataset.idx == 0) wx.redirectTo({ url: '/pages/chef/menu/menu' })
  },
  onGoHome() { getApp().globalData.role = ''; wx.reLaunch({ url: '/pages/index/index' }) },
  fmt(t) { if (!t) return ''; const d = new Date(t); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` }
})
