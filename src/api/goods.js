import request from '@/utils/request'

// 发布闲置物品
export function publishGoods(params) {
  return request({
    url: '/idleGoods/publish',
    method: 'post',
    data: params,
  })
}

// 获取闲置物品列表
export function getGoodsList(params) {
  return request({
    url: '/idleGoods/list',
    method: 'get',
    params: {
      page: params?.page || 1,
      size: params?.size || 8,
      goodsTypeCode: params?.goodsTypeCode || '',
      keyword: params?.keyword || '',
    }
  })
}

// 获取闲置物品详细信息
export function getGoodsDetail(id) {
  return request({
    url: `/idleGoods/detail/${id}`,
    method: 'get',
  })
}

// 修改闲置物品
export function updateGoods(params, id) {
  return request({
    url: `/idleGoods/update/${id}`,
    method: 'post',
    data: params,
  })
}

// 获取我的闲置物品列表
export function getMyGoodsList(params) {
  return request({
    url: '/idleGoods/my/list',
    method: 'get',
    params: {
      page: params?.page || 1,
      size: params?.size || 8,
    }
  })
}

// 上传闲置物品图片
export function uploadGoodsImage(file) {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: '/idleGoods/images',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

//图片预览
export function viewImages(objectKey) {
  return request({
    url: '/idleGoods/images/view',
    method: 'get',
    params: {
      objectKey
    }
  })
}