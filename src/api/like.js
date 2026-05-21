import request from '@/utils/request'

function normalizeLikeParams(params = {}) {
  const { relatedId, relateId, ...rest } = params || {}
  return {
    ...rest,
    relateId: relateId ?? relatedId,
  }
}

// 点赞，返回String
export function like(params) {
  return request({
    url: '/postLike/like',
    method: 'post',
    data: normalizeLikeParams(params),
  })
}

// 取消点赞, 返回String
export function unlike(params) {
  return request({
    url: '/postLike/unlike',
    method: 'post',
    data: normalizeLikeParams(params),
  })
}

// 查询点赞状况，返回Boolean
export function getLikeStatus(likeType, relatedId) {
  return request({
    url: '/postLike/status',
    method: 'get',
    params: {
      likeType,
      relateId: relatedId,
    }
  })
}

