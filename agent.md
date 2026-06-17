# 家庭厨房助手 - 产品需求文档 (PRD)

## 1. 项目愿景
打造一个极简、零支付的家庭内部点餐系统。让“今天吃什么”的决策变得有趣，让“做饭”变成一种明确的任务响应。无需支付，只有期待和投喂。

## 2. 核心用户角色
- **主厨 (Chef/Admin)**：
  - 通常是家里的掌勺人（妈妈/爸爸/室友）。
  - 核心能力：发布菜品、管理菜单、接单、并标记出餐。
- **吃货 (Family/Diner)**：
  - 其他家庭成员。
  - 核心能力：浏览菜单、加购物车、提交订单。

## 3. 核心功能模块 (MVP)

### 3.1 认证与家庭绑定
- **免注册登录**：无需登录

### 3.2 厨师端
- **菜单管理（增删改查）**：
  - 字段：菜品名、图片（emoji）、简介、分类（如：主食、炒菜、汤、甜品）。
- **订单看板（实时）**：
  - 类似于奶茶店的大屏模式或简单列表。
  - 显示：下单人、下单时间、菜品明细、备注（如：不要葱）。
  - 状态流转：`待接单` -> `烹饪中` -> `已出餐/请取餐`。
- **“今日供应”开关**：可一键开启或关闭点餐窗口（非用餐时间防止乱下单）。

### 3.3 家人端
- **简易购物车**：临时性购物车，提交后清空。
- **订单提交**：
  - 选好菜后，可选择“立即下单”。
  - 支持备注：如“少盐”、“多放辣椒”。
- **我的订单**：查看自己订单的实时状态（我的饭做到哪一步了？）。
- **等待动画/彩蛋**：提交后显示幽默的等待语，如“大厨正在颠勺”、“记得收拾桌子”。

## 4. 数据模型草图 (CloudBase 集合设计)

集合名：`family_kitchen`

**`users` 集合**
- `_id`: 自动
- `openid`: string
- `nickName`: string
- `avatarUrl`: string
- `role`: 'chef' | 'family'
- `familyId`: string (关联的家庭ID)

**`dishes` 集合**
- `_id`: 自动
- `name`: string
- `image`: string (cloud:// fileID)
- `category`: string
- `isAvailable`: boolean (今日是否上架)
- `familyId`: string

**`orders` 集合**
- `_id`: 自动
- `familyId`: string
- `dinerId`: string (下单人 openid)
- `dinerName`: string
- `items`: array [{ dishId, dishName, quantity }]
- `notes`: string
- `status`: 'pending' | 'cooking' | 'ready'
- `createTime`: Date

## 5. 交互与页面结构

1.  **启动页 (`pages/index/index`)**：检查用户是否绑定家庭。
    - 未绑定：引导创建或加入家庭。
    - 已绑定：识别角色自动跳转。
2.  **厨师工作台 (`pages/chef/board`)**：
    - Tab 1：订单列表（按状态排序）。
    - Tab 2：菜单管理。
3.  **家人点餐台 (`pages/family/menu`)**：
    - 顶部：厨师是否“营业中”的状态栏。
    - 中间：菜品瀑布流或列表。
    - 底部：悬浮购物车图标。
4.  **购物车弹窗/页 (`pages/family/cart`)**：确认下单页。
5.  **我的订单 (`pages/family/orders`)**：追踪进度。

## 6. 技术栈与低码策略 (Vibe Coding 指南)
- **平台**：微信小程序原生 + 微信云开发 (CloudBase)。
- **云函数**：
  - `getMenu`：获取今日菜单。
  - `submitOrder`：创建订单。
  - `updateOrder`：厨师更新状态。
  - `manageDish`：增删改菜品。
- **实时性**：家人提交订单后，厨师端可以使用 `watch` 监听数据库变更，即时弹出提示（“您有新的饿了吗订单”）。
- **UI 素材**：使用 `TDesign` 小程序组件库快速构建美食卡片风格。