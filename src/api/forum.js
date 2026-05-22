import request from '@/utils/request'

// 上传贴文图片
export function uploadPostImage(file) {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: '/forumPost/images',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 上传贴文
export function uploadForum(params) {
  return request({
    url: '/forumPost/uploadForum',
    method: 'post',
    data: params,
  })
}

// 获取贴文列表（审核通过）
export function getForumList(params) {
  return request({
    url: '/forumPost/summary',
    method: 'get',
    params: {
      page: params?.page || 1,
      size: params?.size || 10,
      sectionCode: params?.sectionCode || '',
      keyword: params?.keyword || '',
    }
  })
}

// 获取贴文内容
export function getForumDetail(id) {
  return request({
    url: `/forumPost/getForum/${id}`,
    method: 'get',
  })
}

// 获取所有贴文列表（管理员）
export function getAllForumList(params) {
  return request({
    url: '/forumPost/admin/audit/list',
    method: 'get',
    params: {
      page: params?.page || 1,
      size: params?.size || 10,
      status: params?.status || '',
      keyword: params?.keyword || '',
    }
  })
}

// 获取当前用户的所有贴文
export function getOwnForumList(params) {
  return request({
    url: '/forumPost/my/audit-status',
    method: 'get',
    params: {
      page: params?.page || 1,
      size: params?.size || 10,
    }
  })
}

// 管理员审核贴文
// params 包括postId和审核后贴文状态（1=已发布，2=已驳回）
export function auditForum(params) {
  return request({
    url: '/forumPost/admin/audit',
    method: 'post',
    data: params,
  })
}