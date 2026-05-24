import request from '@/utils/request'

export function createExpertSchedule(data) {
  return request({
    url: '/expertSchedule/create',
    method: 'post',
    data,
  })
}

export function updateExpertSchedule(data) {
  return request({
    url: '/expertSchedule/update',
    method: 'put',
    data,
  })
}

export function deleteExpertSchedule(scheduleId) {
  return request({
    url: `/expertSchedule/delete/${scheduleId}`,
    method: 'post',
  })
}

export function getMyExpertSchedules(page, size) {
  return request({
    url: '/expertSchedule/my',
    method: 'get',
    params: { page, size },
  })
}
