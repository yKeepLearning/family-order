# 购物车代码 - 家庭厨房小程序
主要问题：加减按钮溢出右侧。WXML 结构是 emoji | 菜名 | − 数量 +，需要控制三个区域总宽度不超屏幕
## WXML（pages/family/menu/menu.wxml 中的购物车弹层）

<!-- 购物车浮动条 -->
<view wx:if="{{cartTotal > 0 && !cartOpen && tab === 'menu'}}" class="cart-pill" bindtap="onOpenCart">
  <text class="cp-icon">🛒</text>
  <text class="cp-badge">{{cartTotal}}</text>
  <text class="cp-text">查看购物车</text>
  <text class="cp-arrow">去结算 ›</text>
</view>

<!-- 购物车弹层 -->
<view wx:if="{{cartOpen}}" class="overlay" bindtap="onCloseCart">
  <view class="sheet" catchtap="noop">
    <view class="sheet-head">
      <text class="sheet-title">购物车 ({{cartTotal}} 件)</text>
      <text class="sheet-close" bindtap="onCloseCart">✕</text>
    </view>
    <scroll-view class="sheet-body" scroll-y>
      <view wx:for="{{groupedCart}}" wx:key="cat" class="cg-group">
        <text class="cg-cat">{{item.cat}}</text>
        <view wx:for="{{item.items}}" wx:for-item="ci" wx:key="dishId" class="cart-row">
          <text class="cr-emoji">{{ci.dish.emoji || '🍽️'}}</text>
          <view class="cr-info">
            <text class="cr-name">{{ci.dish.name}}</text>
          </view>
          <view class="cr-qty">
            <view class="qty-minus" data-id="{{ci.dishId}}" bindtap="onCartMinus">−</view>
            <text class="qty-num">{{ci.quantity}}</text>
            <view class="qty-plus" data-id="{{ci.dishId}}" bindtap="onCartPlus">+</view>
          </view>
        </view>
      </view>
    </scroll-view>
    <view class="sheet-foot">
      <view class="sf-field">
        <text class="sf-label">备注（口味偏好等）</text>
        <input class="sf-input" placeholder="例如：少盐、不要辣..." value="{{note}}" bindinput="onNoteInput" />
      </view>
      <button class="sf-btn" bindtap="onSubmitOrder">提交订单</button>
    </view>
  </view>
</view>


## WXSS

.overlay { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.4); display: flex; align-items: flex-end; }
.sheet { width: 100%; background: var(--color-card); border-radius: 48rpx 48rpx 0 0; max-height: 80vh; display: flex; flex-direction: column; }
.sheet-head { display: flex; justify-content: space-between; align-items: center; padding: 32rpx 32rpx 24rpx; border-bottom: 1px solid var(--color-border); flex-shrink: 0; }
.sheet-title { font-size: 32rpx; font-weight: 600; }
.sheet-close { font-size: 36rpx; color: var(--color-muted-foreground); }
.sheet-body { padding: 0 32rpx; }
.cg-group { margin-bottom: 16rpx; }
.cg-cat { font-size: 24rpx; color: var(--color-muted-foreground); padding: 16rpx 0 8rpx; display: block; }
.cart-row { display: flex; align-items: center; padding: 24rpx 0; border-bottom: 1px solid var(--color-border); box-sizing: border-box; width: 100%; }
.cr-emoji { width: 48rpx; text-align: center; flex-shrink: 0; font-size: 36rpx; margin-right: 12rpx; }
.cr-info { flex: 1; min-width: 0; overflow: hidden; }
.cr-name { font-size: 28rpx; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cr-qty { flex-shrink: 0; margin-left: 12rpx; display: flex; align-items: center; }
.qty-plus { width: 44rpx; height: 44rpx; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: var(--color-primary); color: #FFF; font-size: 28rpx; }
.qty-minus { width: 44rpx; height: 44rpx; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; border: 2rpx solid var(--color-primary); color: var(--color-primary); font-size: 28rpx; margin-right: 8rpx; }
.qty-num { font-size: 26rpx; font-weight: 600; min-width: 28rpx; text-align: center; margin-right: 8rpx; }
.cart-pill { position: fixed; bottom: 130rpx; left: 32rpx; right: 32rpx; height: 100rpx; background: var(--color-primary); color: #FFF; border-radius: 50rpx; display: flex; align-items: center; padding: 0 32rpx; gap: 16rpx; z-index: 50; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.2); }
.cp-icon { font-size: 36rpx; }
.cp-badge { background: rgba(255,255,255,0.2); border-radius: 20rpx; padding: 4rpx 14rpx; font-size: 22rpx; font-weight: 600; }
.cp-text { flex: 1; font-size: 28rpx; font-weight: 500; }
.cp-arrow { font-size: 26rpx; opacity: 0.8; }
.sheet-foot { padding: 24rpx 32rpx 48rpx; border-top: 1px solid var(--color-border); flex-shrink: 0; }
.sf-field { margin-bottom: 20rpx; }
.sf-label { font-size: 24rpx; color: var(--color-muted-foreground); margin-bottom: 12rpx; display: block; }
.sf-input { background: var(--color-muted); border-radius: 20rpx; padding: 20rpx 24rpx; font-size: 28rpx; }
.sf-btn { width: 100%; height: 88rpx; background: var(--color-primary); color: #FFF; border-radius: 44rpx; font-size: 30rpx; font-weight: 500; display: flex; align-items: center; justify-content: center; border: none; }


## JS (pages/family/menu/menu.js 中的关键部分)

Page({
  data: {
    cart: [], cartItems: [], groupedCart: [], cartTotal: 0, cartOpen: false, note: '',
  },

  onOpenCart() { this.setData({ cartOpen: true }) },
  onCloseCart() { this.setData({ cartOpen: false }) },
  onNoteInput(e) { this.setData({ note: e.detail.value }) },

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

  onSubmitOrder() {
    if (!this.data.cart.length) return
    const items = this.data.cart.map(c => ({ id: c.dishId, name: c.dish.name, emoji: c.dish.emoji, quantity: c.quantity }))
    createOrder({ items, notes: this.data.note, dinerName: this.data.dinerName }).then(r => {
      if (r.success) { this.setData({ cart: [], cartOpen: false, note: '', tab: 'orders' }); this.loadOrders() }
      else wx.showToast({ title: '下单失败', icon: 'none' })
    }).catch(() => wx.showToast({ title: '网络错误', icon: 'none' }))
  },
})
