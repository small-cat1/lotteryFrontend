import service from '@/utils/request'

// 获取中奖列表
export const getWinnerList = (data) => {
  return service({
    url: '/annual/winner/list',
    method: 'post',
    data
  })
}

// 确认领奖
export const confirmReceive = (data) => {
  return service({
    url: '/annual/winner/receive',
    method: 'put',
    data
  })
}

// 删除中奖记录
export const deleteWinner = (data) => {
  return service({
    url: '/annual/winner',
    method: 'delete',
    data
  })
}

// 导出中奖记录
export const exportWinner = (params) => {
  return service({
    url: '/annual/winner/export',
    method: 'get',
    params
  })
}

// 随机抽奖
export const randomDraw = (data) => {
  return service({
    url: '/annual/winner/draw',
    method: 'post',
    data
  })
}