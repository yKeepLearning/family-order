# 吃货端 — 菜单浏览、购物车、我的订单 设计文档

## 概述

实现吃货端 3 个页面：菜单浏览（分类侧边栏 + 菜品列表）、购物车（数量调整 + 备注 + 下单）、我的订单（状态跟踪）。3 个页面底部共享自定义胶囊 Tab 栏。

## 页面路由

| 路由 | 页面 |
|------|------|
| `pages/family/menu/menu` | 菜单浏览 |
| `pages/family/cart/cart` | 购物车 |
| `pages/family/orders/orders` | 我的订单 |

## 页面设计

### 1. 菜单浏览（menu）

- **顶部状态栏** + 问候语「👋 今天想吃什么？」+ 厨师营业状态文字
- **主体两栏布局**（不包含 Tab 栏高度 56px）：
  - **左侧分类栏**：85px 宽，灰底 `#F8F8F8`，4 个分类垂直排列：主食🍚、汤品🍜、小食🥗、甜品🍰。选中态白底高亮，非选中态透明
  - **右侧菜品区**：305px 宽，按分类分组滚动。每个菜品卡片 90px 高，水平排列 emoji(48px) + 名称(加粗14px) + 简介(12px灰色) + [+]圆形按钮
- **底部浮动购物车条**：暗色(`$color-secondary`)圆角胶囊 56px 高，水平 padding 20px，左侧 🛒图标 + ¥合计 + 红色角标(数量)，右侧「去下单」按钮。点击跳转购物车页，数据来自页面内 cartItems 数组
- 数据：`getMenu` 云函数返回按分类分组的菜品列表（isAvailable=true），菜品用 emoji 占位

### 2. 购物车（cart）

- **页面标题**「我的订单」+ 「清空」按钮
- **菜品列表**：每项 emoji(28px) + 名称 + 数量调节器（− 1 +，圆角边框）+ 单价。项间分隔线
- **备注区**：「特殊要求」标签 + 输入框（灰底圆角，placeholder "例如：少盐、多辣..."）
- **底栏**：合计 ¥xx（左）+ 「下单」橙色圆角按钮（右）
- **交互**：清空二次确认；点击「下单」调用 `submitOrder` 云函数，成功后清空购物车并 `redirectTo` 订单页
- 数据：页面内 cartItems 数组，通过 `getApp().globalData.cart` 或页面参数传递

### 3. 我的订单（orders）

- **页面标题**「我的订单」+ 「追踪你的餐食进度」
- **订单卡片列表**：白色圆角卡片，包含：emoji(20px) + 菜品摘要 + 状态标签(右对齐) + 下单时间 + 备注
- **状态标签**：
  - 待接单：灰底灰字 `#F0F0F0 / $color-text-light`
  - 烹饪中：黄底黄字 `#FFF5E0 / $color-pending`
  - 已出餐：绿底绿字 `#E8F8F0 / $color-accent`
- **空状态**：无订单时显示 🛒 图标 + 「还没有订单\n去菜单逛逛吧」提示
- 数据：`getOrders` 云函数，按 openid + familyName 查询，时间倒序

### 4. 底部胶囊 Tab 栏（共享组件）

- 样式：白色圆角胶囊，56px 高，cornerRadius 28，两 tab 居中，背景 `#FFFFFF`
- 选中态：图标 + 文字变 `$color-primary`，背景 `#FFF0E8`，cornerRadius 22
- 非选中态：`$color-text-light` 文字 + 图标
- tab：「🍽️ 菜单」|「📋 订单」
- 交互：点击 `wx.redirectTo` 切换页面
- 在 `menu` 和 `orders` 页面的 WXML 中复用

## 云函数

### getMenu
- 入参：`{ familyName }`
- 逻辑：查询 `dishes` 集合 where `{ familyName, isAvailable: true }`，按 `category` 分组
- 返回：`{ success, data: { 主食: [...], 汤品: [...], ... } }`

### submitOrder
- 入参：`{ familyName, items: [{ dishId, dishName, quantity }], notes }`
- 逻辑：插入 `orders` 集合，status: 'pending'，dinerId: openid，createTime: serverDate
- 返回：`{ success, orderId }`

### getOrders
- 入参：`{ familyName }`
- 逻辑：查询 `orders` 集合 where `{ familyName, dinerId: openid }`，时间倒序
- 返回：`{ success, orders: [...] }`

## 数据流

```
getMenu → 菜单页展示 → 用户点击[+] → cartItems[] 增加
菜单页[去下单] → redirectTo 购物车页（cartItems 通过 globalData 传递）
购物车[下单] → submitOrder → redirectTo 订单页
订单页 onShow → getOrders → 渲染列表
```

## 设计 Token（沿用）

| Token | Value |
|-------|-------|
| `$color-primary` | `#FF6B35` |
| `$color-secondary` | `#2D3436` |
| `$color-background` | `#FFF8F0` |
| `$color-card` | `#FFFFFF` |
| `$color-accent` | `#00B894` |
| `$color-pending` | `#FDCB6E` |
| `$color-text` | `#2D3436` |
| `$color-text-light` | `#999999` |
| `$radius-lg` | 20px |
| `$radius-md` | 12px |
