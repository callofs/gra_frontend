import request from '@/utils/request'

// 发表评论
export function makeComment(params) {
  return request({
    url: '/forumPost/comments/makeComment',
    method: 'post',
    data: params,
  })
}

// 获取贴文评论
export function getComment(postId) {
  return request({
    url: '/forumPost/comments/getComments',
    method: 'get',
    params: {
      postId
    }
  })
}

// 获取评论的回复
export function getReplies(parentCommentId) {
  return request({
    url: '/forumPost/comments/getReplies',
    method: 'get',
    params: {
      parentCommentId
    }
  })
}