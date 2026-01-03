import service from '@/utils/request'

// 创建摇一摇场次
export const createShakeRound = (data) => {
  return service({
    url: '/annual/shakeRound',
    method: 'post',
    data
  })
}

// 获取场次列表
export const getShakeRoundList = (data) => {
  return service({
    url: '/annual/shakeRound/list',
    method: 'post',
    data
  })
}

// 获取场次详情
export const getShakeRoundById = (id) => {
  return service({
    url: `/annual/shakeRound/${id}`,
    method: 'get'
  })
}

// 更新场次
export const updateShakeRound = (data) => {
  return service({
    url: '/annual/shakeRound',
    method: 'put',
    data
  })
}

// 开始游戏
export const startShakeRound = (id) => {
  return service({
    url: `/annual/shakeRound/start/${id}`,
    method: 'put'
  })
}

// 结束游戏
export const stopShakeRound = (id) => {
  return service({
    url: `/annual/shakeRound/stop/${id}`,
    method: 'put'
  })
}

// 删除场次
export const deleteShakeRound = (data) => {
  return service({
    url: '/annual/shakeRound',
    method: 'delete',
    data
  })
}

// 获取成绩排行
export const getShakeScores = (roundId) => {
  return service({
    url: `/annual/shakeRound/scores/${roundId}`,
    method: 'get'
  })
}