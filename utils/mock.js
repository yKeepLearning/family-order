const seedDishes = [
  { _id: 'd1',  name: '毛肚',         emoji: '🫕', category: '火锅', description: '七上八下，爽脆弹牙', isAvailable: true },
  { _id: 'd2',  name: '鱿鱼',         emoji: '🦑', category: '火锅', description: '鲜嫩爽滑，Q弹可口', isAvailable: true },
  { _id: 'd3',  name: '牛蛙',         emoji: '🐸', category: '火锅', description: '肉质细腻，入口即化', isAvailable: true },
  { _id: 'd4',  name: '火腿肠',       emoji: '🌭', category: '火锅', description: '经典搭配，老少皆宜', isAvailable: true },
  { _id: 'd5',  name: '午餐肉',       emoji: '🥫', category: '火锅', description: '厚切大块，满足感爆棚', isAvailable: true },
  { _id: 'd6',  name: '墨鱼仔',       emoji: '🐙', category: '火锅', description: '小巧玲珑，一口一个', isAvailable: true },
  { _id: 'd7',  name: '土豆',         emoji: '🥔', category: '火锅', description: '软糯入味，火锅必点', isAvailable: true },
  { _id: 'd8',  name: '莲藕',         emoji: '🪷', category: '火锅', description: '清脆拉丝，口感独特', isAvailable: true },
  { _id: 'd9',  name: '萝卜',         emoji: '🥕', category: '火锅', description: '清甜多汁，解腻首选', isAvailable: true },
  { _id: 'd10', name: '西红柿',       emoji: '🍅', category: '火锅', description: '酸甜开胃，汤底必备', isAvailable: true },
  { _id: 'd11', name: '凉拌黄瓜',     emoji: '🥒', category: '凉菜', description: '清脆爽口，解腻神器', isAvailable: true },
  { _id: 'd12', name: '烧椒皮蛋',     emoji: '🥚', category: '凉菜', description: '烧椒拌皮蛋，香气四溢', isAvailable: true },
  { _id: 'd13', name: '辣拌凉面',     emoji: '🍝', category: '凉菜', description: '麻辣鲜香，夏日必备', isAvailable: true },
  { _id: 'd14', name: '油酥花生',     emoji: '🥜', category: '凉菜', description: '酥脆咸香，下酒好菜', isAvailable: true },
  { _id: 'd15', name: '红烧土鸡',     emoji: '🍗', category: '热菜', description: '土鸡慢炖，肉烂汤浓', isAvailable: true },
  { _id: 'd16', name: '青椒土豆丝',   emoji: '🥔', category: '热菜', description: '酸辣脆爽，家常美味', isAvailable: true },
  { _id: 'd17', name: '冬瓜排骨汤',   emoji: '🍖', category: '汤羹', description: '清甜滋润，秋燥克星', isAvailable: true },
  { _id: 'd18', name: '酸萝卜老鸭汤', emoji: '🦆', category: '汤羹', description: '酸香开胃，暖心暖胃', isAvailable: true },
  { _id: 'd19', name: '啤酒',         emoji: '🍺', category: '酒水', description: '冰镇啤酒，火锅绝配', isAvailable: true },
  { _id: 'd20', name: '米酒',         emoji: '🍶', category: '酒水', description: '甘甜醇厚，暖身养胃', isAvailable: true },
  { _id: 'd21', name: '可乐',         emoji: '🥤', category: '酒水', description: '冰爽刺激，快乐加倍', isAvailable: true },
  { _id: 'd22', name: '雪碧',         emoji: '🧊', category: '酒水', description: '透心凉，心飞扬', isAvailable: true },
  { _id: 'd23', name: '西瓜',         emoji: '🍉', category: '水果', description: '甜蜜多汁，解暑神器', isAvailable: true },
  { _id: 'd24', name: '葡萄',         emoji: '🍇', category: '水果', description: '晶莹剔透，酸甜可口', isAvailable: true },
  { _id: 'd25', name: '提子',         emoji: '🍇', category: '水果', description: '脆甜无籽，一口爆汁', isAvailable: true },
  { _id: 'd26', name: '火龙果',       emoji: '🐉', category: '水果', description: '清甜细腻，营养丰富', isAvailable: true },
  { _id: 'd27', name: '榴莲',         emoji: '🫒', category: '水果', description: '王者之果，爱者自爱', isAvailable: true }
]

function getDishes() {
  const stored = wx.getStorageSync('dishes')
  if (stored && stored.length) return stored
  wx.setStorageSync('dishes', seedDishes)
  return seedDishes
}

function saveDishes(dishes) {
  wx.setStorageSync('dishes', dishes)
}

function getOrders() {
  return wx.getStorageSync('orders') || []
}

function saveOrders(orders) {
  wx.setStorageSync('orders', orders)
}

function getCart() {
  return wx.getStorageSync('cart') || []
}

function saveCart(cart) {
  wx.setStorageSync('cart', cart)
}

function genId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
}

module.exports = { getDishes, saveDishes, getOrders, saveOrders, getCart, saveCart, genId }
