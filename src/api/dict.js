import request from '@/utils/request'

export function getDictList(dictType) {
  return request({
    url: '/dict/getDictList',
    method: 'get',
    params: {
      dictType,
    }
  })
}

export function addDict(params) {
  return request({
    url: '/dict/addDict',
    method: 'post',
    data: params,
  })
}

export function updateDict(params, id) {
  return request({
    url: `/dict/updateDict/${id}`,
    method: 'post',
    data: params,
  })
}