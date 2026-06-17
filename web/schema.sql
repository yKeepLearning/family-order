-- Supabase 数据库建表 SQL。在 Supabase Dashboard → SQL Editor 中运行。

CREATE TABLE dishes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '🍽️',
  category TEXT NOT NULL DEFAULT '其他',
  description TEXT DEFAULT '',
  "isAvailable" BOOLEAN DEFAULT true,
  "cookTime" INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "dinerName" TEXT DEFAULT '匿名',
  items JSONB NOT NULL DEFAULT '[]',
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'cooking', 'served')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 种子数据
INSERT INTO dishes (name, emoji, category, description, "isAvailable", "cookTime") VALUES
('毛肚', '🫕', '火锅', '七上八下，爽脆弹牙', true, 10),
('鱿鱼', '🦑', '火锅', '鲜嫩爽滑，Q弹可口', true, 10),
('牛蛙', '🐸', '火锅', '肉质细腻，入口即化', true, 15),
('火腿肠', '🌭', '火锅', '经典搭配，老少皆宜', true, 5),
('午餐肉', '🥫', '火锅', '厚切大块，满足感爆棚', true, 5),
('墨鱼仔', '🐙', '火锅', '小巧玲珑，一口一个', true, 8),
('土豆', '🥔', '火锅', '软糯入味，火锅必点', true, 10),
('莲藕', '🪷', '火锅', '清脆拉丝，口感独特', true, 8),
('萝卜', '🥕', '火锅', '清甜多汁，解腻首选', true, 8),
('西红柿', '🍅', '火锅', '酸甜开胃，汤底必备', true, 5),
('凉拌黄瓜', '🥒', '凉菜', '清脆爽口，解腻神器', true, 5),
('烧椒皮蛋', '🥚', '凉菜', '烧椒拌皮蛋，香气四溢', true, 8),
('辣拌凉面', '🍝', '凉菜', '麻辣鲜香，夏日必备', true, 10),
('油酥花生', '🥜', '凉菜', '酥脆咸香，下酒好菜', true, 5),
('红烧土鸡', '🍗', '热菜', '土鸡慢炖，肉烂汤浓', true, 40),
('青椒土豆丝', '🥔', '热菜', '酸辣脆爽，家常美味', true, 10),
('冬瓜排骨汤', '🍖', '汤羹', '清甜滋润，秋燥克星', true, 30),
('酸萝卜老鸭汤', '🦆', '汤羹', '酸香开胃，暖心暖胃', true, 40),
('啤酒', '🍺', '酒水', '冰镇啤酒，火锅绝配', true, 0),
('米酒', '🍶', '酒水', '甘甜醇厚，暖身养胃', true, 0),
('可乐', '🥤', '酒水', '冰爽刺激，快乐加倍', true, 0),
('雪碧', '🧊', '酒水', '透心凉，心飞扬', true, 0),
('西瓜', '🍉', '水果', '甜蜜多汁，解暑神器', true, 0),
('葡萄', '🍇', '水果', '晶莹剔透，酸甜可口', true, 0),
('提子', '🍇', '水果', '脆甜无籽，一口爆汁', true, 0),
('火龙果', '🐉', '水果', '清甜细腻，营养丰富', true, 0),
('榴莲', '🫒', '水果', '王者之果，爱者自爱', true, 0);
