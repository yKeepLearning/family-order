const express = require('express')
const Redis = require('ioredis')

const app = express()
const redis = new Redis({ host: 'localhost', port: 6379 })

app.use(express.json())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

const seed = [
  { id: 'd1',  name: '毛肚',         emoji: '🫕', category: '火锅', description: '七上八下，爽脆弹牙', isAvailable: true },
  { id: 'd2',  name: '鱿鱼',         emoji: '🦑', category: '火锅', description: '鲜嫩爽滑，Q弹可口', isAvailable: true },
  { id: 'd3',  name: '牛蛙',         emoji: '🐸', category: '火锅', description: '肉质细腻，入口即化', isAvailable: true },
  { id: 'd4',  name: '火腿肠',       emoji: '🌭', category: '火锅', description: '经典搭配，老少皆宜', isAvailable: true },
  { id: 'd5',  name: '午餐肉',       emoji: '🥫', category: '火锅', description: '厚切大块，满足感爆棚', isAvailable: true },
  { id: 'd6',  name: '墨鱼仔',       emoji: '🐙', category: '火锅', description: '小巧玲珑，一口一个', isAvailable: true },
  { id: 'd7',  name: '土豆',         emoji: '🥔', category: '火锅', description: '软糯入味，火锅必点', isAvailable: true },
  { id: 'd8',  name: '莲藕',         emoji: '🪷', category: '火锅', description: '清脆拉丝，口感独特', isAvailable: true },
  { id: 'd9',  name: '萝卜',         emoji: '🥕', category: '火锅', description: '清甜多汁，解腻首选', isAvailable: true },
  { id: 'd10', name: '西红柿',       emoji: '🍅', category: '火锅', description: '酸甜开胃，汤底必备', isAvailable: true },
  { id: 'd11', name: '凉拌黄瓜',     emoji: '🥒', category: '凉菜', description: '清脆爽口，解腻神器', isAvailable: true },
  { id: 'd12', name: '烧椒皮蛋',     emoji: '🥚', category: '凉菜', description: '烧椒拌皮蛋，香气四溢', isAvailable: true },
  { id: 'd13', name: '辣拌凉面',     emoji: '🍝', category: '凉菜', description: '麻辣鲜香，夏日必备', isAvailable: true },
  { id: 'd14', name: '油酥花生',     emoji: '🥜', category: '凉菜', description: '酥脆咸香，下酒好菜', isAvailable: true },
  { id: 'd15', name: '红烧土鸡',     emoji: '🍗', category: '热菜', description: '土鸡慢炖，肉烂汤浓', isAvailable: true },
  { id: 'd16', name: '青椒土豆丝',   emoji: '🥔', category: '热菜', description: '酸辣脆爽，家常美味', isAvailable: true },
  { id: 'd17', name: '冬瓜排骨汤',   emoji: '🍖', category: '汤羹', description: '清甜滋润，秋燥克星', isAvailable: true },
  { id: 'd18', name: '酸萝卜老鸭汤', emoji: '🦆', category: '汤羹', description: '酸香开胃，暖心暖胃', isAvailable: true },
  { id: 'd19', name: '啤酒',         emoji: '🍺', category: '酒水', description: '冰镇啤酒，火锅绝配', isAvailable: true },
  { id: 'd20', name: '米酒',         emoji: '🍶', category: '酒水', description: '甘甜醇厚，暖身养胃', isAvailable: true },
  { id: 'd21', name: '可乐',         emoji: '🥤', category: '酒水', description: '冰爽刺激，快乐加倍', isAvailable: true },
  { id: 'd22', name: '雪碧',         emoji: '🧊', category: '酒水', description: '透心凉，心飞扬', isAvailable: true },
  { id: 'd23', name: '西瓜',         emoji: '🍉', category: '水果', description: '甜蜜多汁，解暑神器', isAvailable: true },
  { id: 'd24', name: '葡萄',         emoji: '🍇', category: '水果', description: '晶莹剔透，酸甜可口', isAvailable: true },
  { id: 'd25', name: '提子',         emoji: '🍇', category: '水果', description: '脆甜无籽，一口爆汁', isAvailable: true },
  { id: 'd26', name: '火龙果',       emoji: '🐉', category: '水果', description: '清甜细腻，营养丰富', isAvailable: true },
  { id: 'd27', name: '榴莲',         emoji: '🫒', category: '水果', description: '王者之果，爱者自爱', isAvailable: true }
]

async function ensureSeed() {
  const exists = await redis.exists('dishes')
  if (!exists) {
    await redis.set('dishes', JSON.stringify(seed))
  }
  if (!(await redis.exists('orders'))) {
    await redis.set('orders', JSON.stringify([]))
  }
}

async function getDishes() {
  const raw = await redis.get('dishes')
  return JSON.parse(raw || '[]')
}

async function saveDishes(data) {
  await redis.set('dishes', JSON.stringify(data))
}

async function getOrders() {
  const raw = await redis.get('orders')
  return JSON.parse(raw || '[]')
}

async function saveOrders(data) {
  await redis.set('orders', JSON.stringify(data))
}

// GET /dishes
app.get('/dishes', async (req, res) => {
  try { res.json({ success: true, data: await getDishes() }) }
  catch (e) { res.status(500).json({ success: false, msg: e.message }) }
})

// POST /dishes
app.post('/dishes', async (req, res) => {
  try {
    const { name, category, emoji, description, cookTime } = req.body
    if (!name) return res.json({ success: false, msg: '名称不能为空' })
    const dishes = await getDishes()
    const dish = { id: 'd' + Date.now(), name, category: category || '其他', emoji: emoji || '🍽️', description: description || '', isAvailable: true, cookTime: cookTime || 15 }
    dishes.push(dish)
    await saveDishes(dishes)
    res.json({ success: true, data: dish })
  } catch (e) { res.status(500).json({ success: false, msg: e.message }) }
})

// PUT /dishes/:id
app.put('/dishes/:id', async (req, res) => {
  try {
    const dishes = await getDishes()
    const d = dishes.find(d => d.id === req.params.id)
    if (!d) return res.json({ success: false, msg: '未找到菜品' })
    if (req.body.deleted) {
      const idx = dishes.findIndex(d => d.id === req.params.id)
      if (idx >= 0) { dishes.splice(idx, 1); await saveDishes(dishes); return res.json({ success: true }) }
    }
    if (typeof req.body.isAvailable === 'boolean') d.isAvailable = req.body.isAvailable
    await saveDishes(dishes)
    res.json({ success: true })
  } catch (e) { res.status(500).json({ success: false, msg: e.message }) }
})

// GET /orders
app.get('/orders', async (req, res) => {
  try { res.json({ success: true, data: await getOrders() }) }
  catch (e) { res.status(500).json({ success: false, msg: e.message }) }
})

// POST /orders
app.post('/orders', async (req, res) => {
  try {
    const { items, notes, dinerName } = req.body
    if (!items || !items.length) return res.json({ success: false, msg: '购物车为空' })
    const orders = await getOrders()
    const order = {
      id: 'o' + Date.now(),
      items, notes: notes || '', dinerName: dinerName || '匿名',
      status: 'pending', createTime: Date.now()
    }
    orders.unshift(order)
    await saveOrders(orders)
    res.json({ success: true, data: order })
  } catch (e) { res.status(500).json({ success: false, msg: e.message }) }
})

// PUT /orders/:id
app.put('/orders/:id', async (req, res) => {
  try {
    const orders = await getOrders()
    const o = orders.find(o => o.id === req.params.id)
    if (!o) return res.json({ success: false, msg: '未找到订单' })
    if (req.body.status) o.status = req.body.status
    await saveOrders(orders)
    res.json({ success: true })
  } catch (e) { res.status(500).json({ success: false, msg: e.message }) }
})

const PORT = 3000
app.listen(PORT, async () => {
  await ensureSeed()
  console.log(`Server running on http://localhost:${PORT}`)
})
