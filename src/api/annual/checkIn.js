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

// 更新签到信息
export const updateCheckIn = (data) => {
  return service({
    url: '/annual/checkIn',
    method: 'put',
    data
  })
}

// 更新签到状态（审核通过/拒绝）
export const updateCheckInStatus = (data) => {
  return service({
    url: '/annual/checkIn/status',
    method: 'put',
    data
  })
}

// 删除签到
export const deleteCheckIn = (data) => {
  return service({
    url: '/annual/checkIn',
    method: 'delete',
    data
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
