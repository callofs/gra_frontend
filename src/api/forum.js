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

// 获取贴文列表
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