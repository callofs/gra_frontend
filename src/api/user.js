import request from '@/utils/request'

// 登录
export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

// 注册
export function register(data) {
  return request({
    url: '/user/register',
    method: 'post',
    data
  })
}

// 获取当前登录用户
export function getCurrentUser() {
  return request({
    url: '/user/profile',
    method: 'get',
    skipAuthRedirect: true
  })
}

// 退出登录
export function logoutRequest() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}