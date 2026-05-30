import request from '@/utils/request'

// 提交认领申请
export function createClaim(params) {
  return request({
    url: '/idleGoods/claim/apply',
    method: 'post',
    data: params,
  })
}

// 取消认领申请
export function cancelClaim(claimId) {
  return request({
    url: `/idleGoods/claim/cancel/${claimId}`,
    method: 'post'
  })
}

// 获取我的认领记录
export function getMyClaimList(params) {
  return request({
    url: '/idleGoods/claim/my',
    method: 'get',
    params: {
      page: params?.page || 1,
      size: params?.size || 10,
    }
  })
}

// 我收到的认领申请
export function getMyReceivedClaim(params) {
  return request({
    url: '/idleGoods/claim/received',
    method: 'get',
    params: {
      page: params?.page || 1,
      size: params?.size || 10,
      goodsId: params?.goodsId || '',
    }
  })
}

// 处理认领状态 status 0=待确认 1=已同意 2=已拒绝 3=已完成 4=已取消
export function updateClaimState(claimId, status) {
  return request({
    url: `/idleGoods/claim/status/${claimId}`,
    method: 'post',
    params: {
      status
    }
  })
}