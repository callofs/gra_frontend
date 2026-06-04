import request from '@/utils/request'

// 上传课程 "mp4", "mov", "avi", "mkv", "flv", "wmv"
export function uploadCourse(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/expertCourse/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 课程视频预览
export function courseVedioView(objectKey) {
  return request({
    url: '/expertCourse/video/view',
    method: 'get',
    params: {
      objectKey
    },
    responseType: 'arraybuffer'
  })
}

// 上传封面图片
export function uploadCoverImg(file) {
  const formData = new FormData()
  formData.append('file', file);

  return request({
    url: '/expertCourse/uploadCover',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

//图片预览
export function lectureViewImages(objectKey) {
  return request({
    url: '/expertCourse/cover/view',
    method: 'get',
    params: {
      objectKey
    },
    responseType: 'arraybuffer'
  })
}

// 创建课程
/**
 * 
 * @param {
    "id": 0,
    "expertId": 0,
    "title": "string",
    "coverUrl": "string",
    "courseDesc": "string",
    "videoObjectKey": "string",
    "durationSeconds": 0,
    "auditStatus": 0,
    "auditComment": "string",
    "auditTime": "2026-05-31T03:34:23.696Z",
    "auditBy": 0,
    "viewCount": 0,
    "createTime": "2026-05-31T03:34:23.696Z",
    "updateTime": "2026-05-31T03:34:23.696Z",
    "expertNickname": "string",
    "expertAvatar": [
      "string"
    ]
  } params 
 * @returns {
      "id": 0,
      "expertId": 0,
      "title": "string",
      "coverUrl": "string",
      "courseDesc": "string",
      "videoObjectKey": "string",
      "durationSeconds": 0,
      "auditStatus": 0,
      "auditComment": "string",
      "auditTime": "2026-05-31T03:34:23.697Z",
      "auditBy": 0,
      "viewCount": 0,
      "createTime": "2026-05-31T03:34:23.697Z",
      "updateTime": "2026-05-31T03:34:23.697Z",
      "expertNickname": "string",
      "expertAvatar": [
        "string"
      ]
    }
 */
export function createCourse(params) {
  return request({
    url: '/expertCourse/createCourse',
    method: 'post',
    data: params
  })
}

// 修改课程
/**
 * 
 * @param {
      "id": 0,
      "expertId": 0,
      "title": "string",
      "coverUrl": "string",
      "courseDesc": "string",
      "videoObjectKey": "string",
      "durationSeconds": 0,
      "auditStatus": 0,
      "auditComment": "string",
      "auditTime": "2026-05-31T03:35:52.391Z",
      "auditBy": 0,
      "viewCount": 0,
      "createTime": "2026-05-31T03:35:52.391Z",
      "updateTime": "2026-05-31T03:35:52.391Z",
      "expertNickname": "string",
      "expertAvatar": [
        "string"
      ]
    } params 
 * @returns {
    "code": 0,
    "message": "string",
    "data": "string"
  }
 */
export function updateCourse(params) {
  return request({
    url: '/expertCourse/updateCourse',
    method: 'post',
    data: params,
  })
}

// 删除课程
export function deleteCourse(courseId) {
  return request({
    url: `/expertCourse/deleteCourse/${courseId}`,
    method: 'post',
  })
}

// 获取课程详情
/**
 * 
 * @param {*} courseId 
 * @returns "data": {
      "id": 0,
      "expertId": 0,
      "title": "string",
      "coverUrl": "string",
      "courseDesc": "string",
      "videoObjectKey": "string",
      "durationSeconds": 0,
      "auditStatus": 0,
      "auditComment": "string",
      "auditTime": "2026-05-31T06:10:25.752Z",
      "auditBy": 0,
      "viewCount": 0,
      "createTime": "2026-05-31T06:10:25.752Z",
      "updateTime": "2026-05-31T06:10:25.752Z",
      "expertNickname": "string",
      "expertAvatar": [
        "string"
      ]
    }
 */
export function getCourseDetail(courseId) {
  return request({
    url: `/expertCourse/getCourseDetail/${courseId}`,
    method: 'get',
  })
}

// 获取审核通过的课程列表
export function getCourseList(params) {
  return request({
    url: '/expertCourse/approved',
    method: 'get',
    params: {
      page: params?.page || 1,
      size: params?.size || 10
    }
  })
}

// 获取我创建的课程列表
export function getMyCourseList(params) {
  return request({
    url: '/expertCourse/my/courseList',
    method: 'get',
    params: {
      page: params?.page || 1,
      size: params?.size || 10
    }
  })
}

// 管理员获取所有课程列表
export function getAllCourseList(params) {
  return request({
    url: '/expertCourse/admin/list',
    method: 'get',
    params: {
      page: params?.page || 1,
      size: params?.size || 10,
      auditStatus: params?.auditStatus || '',
      expertId: params?.expertId || '',
      keyword: params?.keyword || '',
    }
  })
}

// 管理员审核课程 auditStatus 0待审核 1通过 2驳回 3下架
export function auditCourse(courseId, auditStatus, auditComment) {
  return request({
    url: `/expertCourse/audit/${courseId}`,
    method: 'post',
    params: {
      auditStatus,
      auditComment
    }
  })
}