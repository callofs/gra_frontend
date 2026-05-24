import request from '@/utils/request'

// 创建讲座
export function createLecture(data) {
  return request({
    url: '/lecture/create',
    method: 'post',
    data
  })
}

// 更新讲座
export function updateLecture(data) {
  return request({
    url: '/lecture/update',
    method: 'put',
    data
  })
}

// 删除讲座（软删除）
export function deleteLecture(lectureId) {
  return request({
    url: `/lecture/delete/${lectureId}`,
    method: 'post'
  })
}

// 获取讲座详情
export function getLectureDetail(lectureId) {
  return request({
    url: `/lecture/detail/${lectureId}`,
    method: 'get'
  })
}

// 获取讲座列表（分页）
export function getLectureList(page, size) {
  return request({
    url: '/lecture/list',
    method: 'get',
    params: { page, size }
  })
}

// 获取专家的讲座列表（分页）
export function getExpertLectures(expertId, page, size) {
  return request({
    url: `/lecture/expert/${expertId}`,
    method: 'get',
    params: { page, size }
  })
}

// 更新讲座状态
export function updateLectureStatus(lectureId, status) {
  return request({
    url: `/lecture/status/${lectureId}`,
    method: 'put',
    params: { status }
  })
}

// 报名讲座
export function signupLecture(lectureId) {
  return request({
    url: `/lecture/signup/${lectureId}`,
    method: 'post'
  })
}

// 取消报名
export function cancelSignup(lectureId) {
  return request({
    url: `/lecture/signup/cancel/${lectureId}`,
    method: 'post'
  })
}

// 检查是否已报名
export function checkSignup(lectureId) {
  return request({
    url: `/lecture/signup/check/${lectureId}`,
    method: 'get'
  })
}

// 获取我的报名列表（分页）
export function getMySignups(page, size) {
  return request({
    url: '/lecture/signup/my',
    method: 'get',
    params: { page, size }
  })
}

// 获取讲座的报名列表（分页）
export function getLectureSignups(lectureId, page, size) {
  return request({
    url: `/lecture/signup/lecture/${lectureId}`,
    method: 'get',
    params: { page, size }
  })
}

// 更新到场状态
export function updateAttendance(signUpId, isAttend) {
  return request({
    url: `/lecture/signup/attendance/${signUpId}`,
    method: 'put',
    params: { isAttend }
  })
}

// 上传讲座封面图片
export function uploadLectureImage(file) {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: '/lecture/images',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

//图片预览
export function lectureViewImages(objectKey) {
  return request({
    url: '/lecture/images/view',
    method: 'get',
    params: {
      objectKey
    }
  })
}