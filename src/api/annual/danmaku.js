import service from '@/utils/request'

// 获取弹幕列表
export const getDanmakuList = (data) => {
  return service({
    url: '/annual/danmaku/list',
    method: 'post',
    data
  })
}

// 审核弹幕
export const auditDanmaku = (data) => {
  return service({
    url: '/annual/danmaku/audit',
    method: 'put',
    data
  })
}

// 置顶弹幕
export const topDanmaku = (data) => {
  return service({
    url: '/annual/danmaku/top',
    method: 'put',
    data
  })
}

// 删除弹幕
export const deleteDanmaku = (data) => {
  return service({
    url: '/annual/danmaku',
    method: 'delete',
    data
  })
}

// 批量删除弹幕
export const deleteDanmakuByIds = (data) => {
  return service({
    url: '/annual/danmaku/batch',
    method: 'delete',
    data
  })
}