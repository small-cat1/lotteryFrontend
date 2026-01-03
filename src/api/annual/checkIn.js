import service from '@/utils/request'

// 获取签到列表
export const getCheckInList = (data) => {
  return service({
    url: '/annual/checkIn/list',
    method: 'post',
    data
  })
}

// 获取签到统计
export const getCheckInStats = (activityId) => {
  return service({
    url: `/annual/checkIn/stats/${activityId}`,
    method: 'get'
  })
}

// 导出签到
export const exportCheckIn = (params) => {
  return service({
    url: '/annual/checkIn/export',
    method: 'get',
    params
  })
}