import service from '@/utils/request'

// 获取配置列表
export const getConfigList = () => {
  return service({
    url: '/annual/config/list',
    method: 'get'
  })
}

// 获取所有配置（按分组）
export const getAllConfig = () => {
  return service({
    url: '/annual/config/all',
    method: 'get'
  })
}

// 获取单个配置
export const getConfigByKey = (key) => {
  return service({
    url: `/annual/config/${key}`,
    method: 'get'
  })
}

// 设置配置
export const setConfig = (data) => {
  return service({
    url: '/annual/config',
    method: 'post',
    data
  })
}

// 批量设置配置
export const batchSetConfig = (data) => {
  return service({
    url: '/annual/config/batch',
    method: 'post',
    data
  })
}

// 删除配置
export const deleteConfig = (key) => {
  return service({
    url: `/annual/config/${key}`,
    method: 'delete'
  })
}

// 获取微信配置
export const getWechatConfig = () => {
  return service({
    url: '/annual/config/wechat',
    method: 'get'
  })
}

// 设置微信配置
export const setWechatConfig = (data) => {
  return service({
    url: '/annual/config/wechat',
    method: 'post',
    data
  })
}

// 获取站点配置
export const getSiteConfig = () => {
  return service({
    url: '/annual/config/site',
    method: 'get'
  })
}

// 设置站点配置
export const setSiteConfig = (data) => {
  return service({
    url: '/annual/config/site',
    method: 'post',
    data
  })
}