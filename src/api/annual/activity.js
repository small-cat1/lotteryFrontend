import service from '@/utils/request'

// 创建活动
export const createActivity = (data) => {
  return service({
    url: '/annual/activity',
    method: 'post',
    data
  })
}

// 获取活动列表
export const getActivityList = (data) => {
  return service({
    url: '/annual/activity/list',
    method: 'post',
    data
  })
}

// 获取活动详情
export const getActivityById = (id) => {
  return service({
    url: `/annual/activity/${id}`,
    method: 'get'
  })
}

// 更新活动
export const updateActivity = (data) => {
  return service({
    url: '/annual/activity',
    method: 'put',
    data
  })
}

// 更新活动状态
export const updateActivityStatus = (data) => {
  return service({
    url: '/annual/activity/status',
    method: 'put',
    data
  })
}

// 删除活动
export const deleteActivity = (data) => {
  return service({
    url: '/annual/activity',
    method: 'delete',
    data
  })
}

// 批量删除活动
export const deleteActivityByIds = (data) => {
  return service({
    url: '/annual/activity/batch',
    method: 'delete',
    data
  })
}