# Family Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the role-selection + family create/join onboarding flow for WeChat Mini Program.

**Architecture:** WeChat Mini Program native (WXML/WXSS/JS) with CloudBase backend. Single index page handles role selection and bottom sheet forms. On success, navigates to chef/board or family/menu placeholder pages.

**Tech Stack:** WeChat Mini Program, CloudBase, TDesign WeApp (optional for later screens)

---

## File Map

```
pages/index/index.js        # Role selection, bottom sheet toggle, CloudBase calls
pages/index/index.wxml      # Home page + two bottom sheets markup
pages/index/index.wxss      # All styles for index page
pages/index/index.json      # Page config
pages/chef/board/board.js   # Chef dashboard placeholder
pages/chef/board/board.wxml
pages/chef/board/board.wxss
pages/chef/board/board.json
pages/family/menu/menu.js   # Family menu placeholder
pages/family/menu/menu.wxml
pages/family/menu/menu.wxss
pages/family/menu/menu.json
app.js                      # App entry, CloudBase init, global user state
app.json                    # Page routes, window config
app.wxss                    # Global design tokens
```

---

### Task 1: App Scaffolding

**Files:**
- Create: `app.js`
- Create: `app.json`
- Create: `app.wxss`

- [ ] **Step 1: Create app.json with page routes**

```json
{
  "pages": [
    "pages/index/index",
    "pages/chef/board/board",
    "pages/family/menu/menu"
  ],
  "window": {
    "navigationBarTitleText": "家庭厨房",
    "navigationBarBackgroundColor": "#FF6B35",
    "navigationBarTextStyle": "white",
    "backgroundColor": "#FFF8F0"
  },
  "sitemapLocation": "sitemap.json"
}
```

- [ ] **Step 2: Create app.js with CloudBase init and global data**

```js
App({
  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({ env: 'your-env-id', traceUser: true })
    }
  },
  globalData: {
    userInfo: null,
    role: '',
    familyName: ''
  }
})
```

- [ ] **Step 3: Create app.wxss with design tokens**

```css
page {
  --color-primary: #FF6B35;
  --color-secondary: #2D3436;
  --color-background: #FFF8F0;
  --color-card: #FFFFFF;
  --color-accent: #00B894;
  --color-text: #2D3436;
  --color-text-light: #999999;
  --color-error: #E74C3C;
  --radius-lg: 40rpx;
  --radius-md: 24rpx;
  --radius-sm: 16rpx;
  --spacing-xl: 64rpx;
  --spacing-lg: 48rpx;
  --spacing-md: 32rpx;
  --spacing-sm: 16rpx;
  --spacing-xs: 8rpx;

  background-color: var(--color-background);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 28rpx;
  color: var(--color-text);
}
```

---

### Task 2: Index Page — Role Selection UI

**Files:**
- Create: `pages/index/index.json`
- Create: `pages/index/index.wxml`
- Create: `pages/index/index.wxss`
- Create: `pages/index/index.js`

- [ ] **Step 1: Create page config**

`pages/index/index.json`
```json
{
  "usingComponents": {},
  "navigationStyle": "custom"
}
```

- [ ] **Step 2: Create WXML structure**

`pages/index/index.wxml`
```xml
<view class="page">
  <view class="status-bar"></view>

  <view class="hero">
    <text class="hero-icon">🍳</text>
    <text class="hero-title">家庭厨房</text>
    <text class="hero-subtitle">今天想吃什么？</text>
  </view>

  <view class="role-cards">
    <view class="role-card chef-card" bindtap="onSelectChef">
      <text class="role-icon">👨‍🍳</text>
      <text class="role-label">主厨</text>
    </view>
    <view class="role-card foodie-card" bindtap="onSelectFoodie">
      <text class="role-icon">👨‍👩‍👧‍👦</text>
      <text class="role-label">吃货</text>
    </view>
  </view>

  <view class="bottom-note">
    <text class="note-text">无需注册，选择角色即可开始</text>
  </view>
</view>

<!-- Overlay -->
<view class="overlay {{showSheet ? 'show' : ''}}" bindtap="onCloseSheet"></view>

<!-- Chef Bottom Sheet -->
<view class="sheet {{showSheet && role === 'chef' ? 'show' : ''}}">
  <view class="sheet-handle"><view class="handle-bar"></view></view>

  <view class="sheet-title-row">
    <text class="sheet-title-icon">👨‍🍳</text>
    <text class="sheet-title">创建我的厨房</text>
  </view>

  <view class="sheet-input-area">
    <input
      class="sheet-input"
      placeholder="取个名字，比如'张家厨房'"
      placeholder-class="placeholder"
      value="{{familyName}}"
      bindinput="onNameInput"
      maxlength="20"
    />
    <text class="sheet-hint">名称唯一，创建后不可修改</text>
    <text class="sheet-error" wx:if="{{errorMsg}}">{{errorMsg}}</text>
  </view>

  <view class="sheet-btn-area">
    <button class="sheet-btn chef-btn" bindtap="onCreateFamily" loading="{{loading}}">
      创建并进入
    </button>
  </view>
</view>

<!-- Foodie Bottom Sheet -->
<view class="sheet {{showSheet && role === 'foodie' ? 'show' : ''}}">
  <view class="sheet-handle"><view class="handle-bar"></view></view>

  <view class="sheet-title-row">
    <text class="sheet-title-icon">🍽️</text>
    <text class="sheet-title">加入家庭</text>
  </view>

  <view class="sheet-input-area">
    <input
      class="sheet-input"
      placeholder="输入家庭名称"
      placeholder-class="placeholder"
      value="{{familyName}}"
      bindinput="onNameInput"
      maxlength="20"
    />
    <text class="sheet-hint">输入主厨创建的家庭名称即可加入</text>
    <text class="sheet-error" wx:if="{{errorMsg}}">{{errorMsg}}</text>
  </view>

  <view class="sheet-btn-area">
    <button class="sheet-btn foodie-btn" bindtap="onJoinFamily" loading="{{loading}}">
      加入
    </button>
  </view>
</view>
```

- [ ] **Step 3: Create WXSS styles**

`pages/index/index.wxss`
```css
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background: var(--color-background);
}

.status-bar {
  height: 62px;
  width: 100%;
  background: var(--color-primary);
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 64rpx 80rpx;
  gap: 24rpx;
}

.hero-icon {
  font-size: 128rpx;
}

.hero-title {
  font-size: 56rpx;
  font-weight: 700;
  color: var(--color-text);
}

.hero-subtitle {
  font-size: 32rpx;
  color: var(--color-text-light);
}

.role-cards {
  display: flex;
  gap: 32rpx;
  padding: 0 32rpx;
}

.role-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 334rpx;
  height: 320rpx;
  border-radius: var(--radius-md);
  gap: 24rpx;
}

.chef-card {
  background: var(--color-primary);
}

.foodie-card {
  background: var(--color-secondary);
}

.role-icon {
  font-size: 80rpx;
}

.role-label {
  font-size: 40rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.bottom-note {
  padding: 80rpx 64rpx;
}

.note-text {
  font-size: 24rpx;
  color: var(--color-text-light);
  text-align: center;
}

/* Overlay */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 100;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s, visibility 0.25s;
}

.overlay.show {
  opacity: 1;
  visibility: visible;
}

/* Bottom Sheet */
.sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-card);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  z-index: 101;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  padding-bottom: env(safe-area-inset-bottom);
}

.sheet.show {
  transform: translateY(0);
}

.sheet-handle {
  display: flex;
  justify-content: center;
  padding: 24rpx 0 0;
}

.handle-bar {
  width: 80rpx;
  height: 8rpx;
  background: #DDDDDD;
  border-radius: 4rpx;
}

.sheet-title-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 32rpx 40rpx;
}

.sheet-title-icon {
  font-size: 48rpx;
}

.sheet-title {
  font-size: 40rpx;
  font-weight: 600;
  color: var(--color-text);
}

.sheet-input-area {
  padding: 0 40rpx 32rpx;
}

.sheet-input {
  width: 100%;
  height: 96rpx;
  background: #F5F5F5;
  border-radius: var(--radius-md);
  padding: 0 32rpx;
  font-size: 28rpx;
  color: var(--color-text);
  box-sizing: border-box;
}

.placeholder {
  color: #CCCCCC;
}

.sheet-hint {
  font-size: 24rpx;
  color: var(--color-text-light);
  margin-top: 16rpx;
  display: block;
}

.sheet-error {
  font-size: 24rpx;
  color: var(--color-error);
  margin-top: 8rpx;
  display: block;
}

.sheet-btn-area {
  padding: 0 40rpx 48rpx;
}

.sheet-btn {
  width: 100%;
  height: 96rpx;
  border-radius: var(--radius-md);
  font-size: 32rpx;
  font-weight: 600;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.sheet-btn::after {
  border: none;
}

.chef-btn {
  background: var(--color-primary);
}

.foodie-btn {
  background: var(--color-secondary);
}
```

- [ ] **Step 4: Create JS logic**

`pages/index/index.js`
```js
Page({
  data: {
    showSheet: false,
    role: '',
    familyName: '',
    errorMsg: '',
    loading: false
  },

  onSelectChef() {
    this.setData({ showSheet: true, role: 'chef', familyName: '', errorMsg: '' })
  },

  onSelectFoodie() {
    this.setData({ showSheet: true, role: 'foodie', familyName: '', errorMsg: '' })
  },

  onCloseSheet() {
    this.setData({ showSheet: false, familyName: '', errorMsg: '' })
  },

  onNameInput(e) {
    this.setData({ familyName: e.detail.value, errorMsg: '' })
  },

  onCreateFamily() {
    const name = this.data.familyName.trim()
    if (!name || name.length < 2) {
      this.setData({ errorMsg: '家庭名称至少 2 个字符' })
      return
    }

    this.setData({ loading: true, errorMsg: '' })

    wx.cloud.callFunction({
      name: 'createFamily',
      data: { familyName: name }
    }).then(res => {
      if (res.result.success) {
        const app = getApp()
        app.globalData.role = 'chef'
        app.globalData.familyName = name
        wx.reLaunch({ url: '/pages/chef/board/board' })
      } else {
        this.setData({ errorMsg: res.result.msg || '创建失败，请重试', loading: false })
      }
    }).catch(() => {
      this.setData({ errorMsg: '网络错误，请重试', loading: false })
    })
  },

  onJoinFamily() {
    const name = this.data.familyName.trim()
    if (!name) {
      this.setData({ errorMsg: '请输入家庭名称' })
      return
    }

    this.setData({ loading: true, errorMsg: '' })

    wx.cloud.callFunction({
      name: 'joinFamily',
      data: { familyName: name }
    }).then(res => {
      if (res.result.success) {
        const app = getApp()
        app.globalData.role = 'foodie'
        app.globalData.familyName = name
        wx.reLaunch({ url: '/pages/family/menu/menu' })
      } else {
        this.setData({ errorMsg: res.result.msg || '未找到该家庭', loading: false })
      }
    }).catch(() => {
      this.setData({ errorMsg: '网络错误，请重试', loading: false })
    })
  }
})
```

---

### Task 3: Placeholder Pages

**Files:**
- Create: `pages/chef/board/board.json`
- Create: `pages/chef/board/board.wxml`
- Create: `pages/chef/board/board.wxss`
- Create: `pages/chef/board/board.js`
- Create: `pages/family/menu/menu.json`
- Create: `pages/family/menu/menu.wxml`
- Create: `pages/family/menu/menu.wxss`
- Create: `pages/family/menu/menu.js`

- [ ] **Step 1: Create chef board placeholder**

`pages/chef/board/board.json`
```json
{
  "usingComponents": {}
}
```

`pages/chef/board/board.wxml`
```xml
<view class="container">
  <view class="status-bar"></view>
  <view class="content">
    <text class="title">👨‍🍳 主厨面板</text>
    <text class="subtitle">订单看板 · 菜单管理</text>
    <view class="info-card">
      <text class="family-label">家庭：{{familyName}}</text>
    </view>
  </view>
</view>
```

`pages/chef/board/board.wxss`
```css
.container {
  min-height: 100vh;
  background: var(--color-background);
}
.status-bar {
  height: 62px;
  background: var(--color-secondary);
}
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 160rpx;
  gap: 24rpx;
}
.title { font-size: 48rpx; font-weight: 700; }
.subtitle { font-size: 28rpx; color: var(--color-text-light); }
.info-card {
  background: var(--color-card);
  padding: 32rpx 48rpx;
  border-radius: var(--radius-md);
  margin-top: 48rpx;
}
.family-label { font-size: 28rpx; color: var(--color-primary); font-weight: 600; }
```

`pages/chef/board/board.js`
```js
Page({
  data: { familyName: '' },
  onLoad() {
    this.setData({ familyName: getApp().globalData.familyName || '未知' })
  }
})
```

- [ ] **Step 2: Create family menu placeholder**

`pages/family/menu/menu.json`
```json
{
  "usingComponents": {}
}
```

`pages/family/menu/menu.wxml`
```xml
<view class="container">
  <view class="status-bar"></view>
  <view class="content">
    <text class="title">🍽️ 家庭菜单</text>
    <text class="subtitle">今天想吃什么？</text>
    <view class="info-card">
      <text class="family-label">家庭：{{familyName}}</text>
    </view>
  </view>
</view>
```

`pages/family/menu/menu.wxss`
```css
.container {
  min-height: 100vh;
  background: var(--color-background);
}
.status-bar {
  height: 62px;
  background: var(--color-primary);
}
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 160rpx;
  gap: 24rpx;
}
.title { font-size: 48rpx; font-weight: 700; }
.subtitle { font-size: 28rpx; color: var(--color-text-light); }
.info-card {
  background: var(--color-card);
  padding: 32rpx 48rpx;
  border-radius: var(--radius-md);
  margin-top: 48rpx;
}
.family-label { font-size: 28rpx; color: var(--color-secondary); font-weight: 600; }
```

`pages/family/menu/menu.js`
```js
Page({
  data: { familyName: '' },
  onLoad() {
    this.setData({ familyName: getApp().globalData.familyName || '未知' })
  }
})
```

---

### Task 4: Cloud Functions

**Files:**
- Create: `cloudfunctions/createFamily/index.js`
- Create: `cloudfunctions/createFamily/package.json`
- Create: `cloudfunctions/joinFamily/index.js`
- Create: `cloudfunctions/joinFamily/package.json`

- [ ] **Step 1: Create createFamily cloud function**

`cloudfunctions/createFamily/package.json`
```json
{
  "name": "createFamily",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "latest"
  }
}
```

`cloudfunctions/createFamily/index.js`
```js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { familyName } = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!familyName || familyName.trim().length < 2 || familyName.trim().length > 20) {
    return { success: false, msg: '家庭名称需 2-20 个字符' }
  }

  try {
    const exist = await db.collection('families').where({ name: familyName.trim() }).count()
    if (exist.total > 0) {
      return { success: false, msg: '该名称已被使用，换一个试试' }
    }

    await db.collection('families').add({
      data: {
        name: familyName.trim(),
        chefId: openid,
        createTime: db.serverDate()
      }
    })

    await db.collection('users').add({
      data: {
        openid,
        role: 'chef',
        familyName: familyName.trim()
      }
    })

    return { success: true }
  } catch (err) {
    return { success: false, msg: '创建失败，请重试' }
  }
}
```

- [ ] **Step 2: Create joinFamily cloud function**

`cloudfunctions/joinFamily/package.json`
```json
{
  "name": "joinFamily",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "latest"
  }
}
```

`cloudfunctions/joinFamily/index.js`
```js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { familyName } = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!familyName || !familyName.trim()) {
    return { success: false, msg: '请输入家庭名称' }
  }

  try {
    const exist = await db.collection('families').where({ name: familyName.trim() }).count()
    if (exist.total === 0) {
      return { success: false, msg: '未找到该家庭，请确认名称' }
    }

    await db.collection('users').add({
      data: {
        openid,
        role: 'family',
        familyName: familyName.trim()
      }
    })

    return { success: true }
  } catch (err) {
    return { success: false, msg: '加入失败，请重试' }
  }
}
```

- [ ] **Step 3: Verify all files exist**

Run: `Get-ChildItem -LiteralPath "D:\prj\family-order" -Recurse -File -Include *.js,*.json,*.wxml,*.wxss | Select-Object FullName`

Expected: 16 files total (app.* + 3 pages × 4 files + 2 cloud functions × 2 files)
