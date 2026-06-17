# 主厨端 — 订单看板、菜单管理 设计文档

## 概述

主厨端 3 个页面：订单看板（按状态管理订单）、菜单管理（菜品上下架）、添加菜品（表单录入）。订单看板和菜单管理通过底部 Tab 切换。

## 页面路由

| 路由 | 页面 |
|------|------|
| `pages/chef/board/board` | 订单看板 |
| `pages/chef/menu/menu` | 菜单管理 |
| `pages/chef/dish/dish` | 添加菜品 |

## 页面设计

### 1. 订单看板（board — 覆盖现有占位页）

- 暗色状态栏 + 标题「订单看板」+ 副标题「N 个待处理 \| 厨房营业中」
- 状态标签栏：待接单 / 烹饪中 / 已出餐（圆角标签，选中橙色高亮）
- 订单卡片：下单人 + 时间 + 菜品×数量 + 备注
  - 待接单：[接单] 橙色按钮
  - 烹饪中：[完成] 绿色按钮
  - 已出餐：无按钮
- 底部 Tab：📋订单（选中）\| 🍽️菜单
- 空状态提示

### 2. 菜单管理（menu — 新建）

- 状态栏 + 标题「菜单管理」+ 口号
- 厨房开关行：文字 + 绿色 toggle
- 菜品列表：emoji + 名称 + 分类标签 + 上架/下架开关
- 底部「+ 添加菜品」按钮（fixed 底部）
- 底部 Tab：📋订单 \| 🍽️菜单（选中）

### 3. 添加菜品（dish — 新建）

- 返回导航 + 标题「添加菜品」
- 表单：名称(必填)、分类选择器(4项)、emoji选择、简介
- [保存] 按钮，成功后 redirectTo 菜单管理

## 云函数

**updateOrder**：入参 orderId + status，更新 orders 集合
**updateDish**：入参 dishId + isAvailable，更新 dishes 集合

## Tab 栏样式（同吃货端）

白色胶囊，56px 高，cornerRadius 28，两 tab 居中。选中橙色背景 `#FFF0E8`。

## 设计 Token（沿用）

| Token | Value |
|-------|-------|
| `$color-primary` | `#FF6B35` |
| `$color-secondary` | `#2D3436` |
| `$color-accent` | `#00B894` |
| `$color-background` | `#FFF8F0` |
| `$color-card` | `#FFFFFF` |
| `$color-text-light` | `#999999` |
