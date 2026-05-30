import request from '@/utils/request'

// 管理员获取专家认证材料接口
export function getExpertCertificationMaterial(userId) {
  return request({
    url: `/user/admin/certificationMaterial/${userId}`,
    method: 'get',
    responseType: 'blob',
  })
}

// 管理员获取专家认证材料列表
export function getExpertCertificationMaterialList() {
  return request({
    url: '/user/admin/certificationMaterials',
    method: 'get',
  })
}

// 管理员修改用户角色
export function changeUserRole(userId, role) {
  return request({
    url: `/user/admin/role/${userId}`,
    method: 'post',
    params: {
      role
    }
  })
}