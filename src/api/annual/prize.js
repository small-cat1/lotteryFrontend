import service from '@/utils/request'

// 创建奖品
export const createPrize = (data) => {
  return service({
    url: '/annual/prize',
    method: 'post',
    data
  })
}

// 获取奖品列表
export const getPrizeList = (data) => {
  return service({
    url: '/annual/prize/list',
    method: 'post',
    data
  })
}

// 获取奖品详情
export const getPrizeById = (id) => {
  return service({
    url: `/annual/prize/${id}`,
    method: 'get'
  })
}

// 更新奖品
export const updatePrize = (data) => {
  return service({
    url: '/annual/prize',
    method: 'put',
    data
  })
}

// 删除奖品
export const deletePrize = (data) => {
  return service({
    url: '/annual/prize',
    method: 'delete',
    data
  })
}

// 批量删除奖品
export const deletePrizeByIds = (data) => {
  return service({
    url: '/annual/prize/batch',
    method: 'delete',
    data
  })
}