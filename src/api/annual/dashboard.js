import service from '@/utils/request'

// 获取统计概览数据
export const getDashboardStats = (activityId) => {
  return service({
    url: `/annual/dashboard/stats/${activityId}`,
    method: 'get'
  })
}

// 获取签到趋势
export const getCheckInTrend = (activityId) => {
  return service({
    url: `/annual/dashboard/checkInTrend/${activityId}`,
    method: 'get'
  })
}

// 获取奖品统计
export const getPrizeStats = (activityId) => {
  return service({
    url: `/annual/dashboard/prizeStats/${activityId}`,
    method: 'get'
  })
}

// 获取最新中奖记录
export const getRecentWinners = (activityId, limit = 5) => {
  return service({
    url: `/annual/dashboard/recentWinners/${activityId}`,
    method: 'get',
    params: { limit }
  })
}

// 获取弹幕热词
export const getHotWords = (activityId, limit = 10) => {
  return service({
    url: `/annual/dashboard/hotWords/${activityId}`,
    method: 'get',
    params: { limit }
  })
}

// 获取最新弹幕
export const getRecentDanmaku = (activityId, limit = 5) => {
  return service({
    url: `/annual/dashboard/recentDanmaku/${activityId}`,
    method: 'get',
    params: { limit }
  })
}

// 获取摇一摇排行榜
export const getShakeRanking = (activityId, limit = 5) => {
  return service({
    url: `/annual/dashboard/shakeRanking/${activityId}`,
    method: 'get',
    params: { limit }
  })
}
