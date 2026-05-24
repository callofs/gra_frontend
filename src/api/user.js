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

// 上传头像
export function uploadAvatar(file) {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: '/user/updateAvatar',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取头像
export function getAvatar() {
  return request({
    url: '/user/getAvatar',
    method: 'get',
    responseType: 'blob',
    skipAuthRedirect: true
  })
}

// 获取当前用户的认证材料
export function getCurrentUserCertificationMaterial() {
  return request({
    url: '/user/certificationMaterial',
    method: 'get',
    responseType: 'blob',
  })
}

// 根据id获取用户信息
export function getUserById(userId) {
  return request({
    url: `/user/getUserById/${userId}`,
    method: 'get',
  })
}

// 关注用户
export function followUser(userId) {
  return request({
    url: '/user/follow',
    method: 'post',
    params: {
      followedId: userId
    }
  })
}

// 取消关注用户
export function unfollowUser(userId) {
  return request({
    url: '/user/unfollow',
    method: 'post',
    params: {
      followedId: userId,
    }
  })
}

// 获取我的关注
export function getMyFollows() {
  return request({
    url: '/user/my/follows',
    method: 'get',
  })
}

// 获取我的粉丝
export function getMyFollowers() {
  return request({
    url: '/user/my/followers',
    method: 'get',
  })
}

// 获取专家列表
export function getExpertsList(limit) {
  return request({
    url: '/user/get/experts',
    method: 'get',
    params: {
      limit
    }
  })
}
