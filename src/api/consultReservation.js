import request from '@/utils/request'

export function getExpertSchedules(expertId) {
  return request({
    url: `/consultReservation/schedules/${expertId}`,
    method: 'get',
  })
}

export function createConsultReservation(data) {
  return request({
    url: '/consultReservation/create',
    method: 'post',
    data,
  })
}

export function cancelConsultReservation(reservationId) {
  return request({
    url: `/consultReservation/cancel/${reservationId}`,
    method: 'post',
  })
}

export function getMyConsultReservations(page, size) {
  return request({
    url: '/consultReservation/my',
    method: 'get',
    params: { page, size },
  })
}

export function getExpertConsultReservations(page, size) {
  return request({
    url: '/consultReservation/expert/list',
    method: 'get',
    params: { page, size },
  })
}

export function updateConsultReservationStatus(reservationId, status) {
  return request({
    url: `/consultReservation/status/${reservationId}`,
    method: 'put',
    params: { status },
  })
}
