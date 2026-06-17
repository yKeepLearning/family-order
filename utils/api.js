const BASE = 'http://192.168.1.3:3000'

function request(method, path, data) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE + path,
      method,
      data,
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          reject(new Error(res.data.msg || '请求失败'))
        }
      },
      fail: (err) => reject(err)
    })
  })
}

function getDishes() {
  return request('GET', '/dishes')
}

function addDish(dish) {
  return request('POST', '/dishes', dish)
}

function updateDish(id, data) {
  return request('PUT', '/dishes/' + id, data)
}

function getOrders() {
  return request('GET', '/orders')
}

function createOrder(order) {
  return request('POST', '/orders', order)
}

function updateOrder(id, data) {
  return request('PUT', '/orders/' + id, data)
}

module.exports = { getDishes, addDish, updateDish, getOrders, createOrder, updateOrder }
