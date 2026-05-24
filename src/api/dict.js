import request from '@/utils/request'

// 获取所有模块列表
export function getAllDictList() {
  return request({
    url: '/dict/getAllDictList',
    method: 'get',
  })
}

// 根据dictType获取模块列表
export function getDictList(dictType) {
  return request({
    url: '/dict/getDictList',
    method: 'get',
    params: {
      dictType,
    }
  })
}

// 添加模块列表
export function addDict(params) {
  return request({
    url: '/dict/addDict',
    method: 'post',
    data: params,
  })
}

// 更新模块列表
export function updateDict(params, id) {
  return request({
    url: `/dict/updateDict/${id}`,
    method: 'post',
    data: params,
  })
}