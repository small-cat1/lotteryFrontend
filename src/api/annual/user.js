import service from '@/utils/request'

// 获取用户列表
export const getUserList = (data) => {
  return service({
    url: '/annual/user/list',
    method: 'post',
    data
  })
}

// 获取用户详情
export const getUserById = (id) => {
  return service({
    url: `/annual/user/${id}`,
    method: 'get'
  })
}

// 更新用户
export const updateUser = (data) => {
  return service({
    url: '/annual/user',
    method: 'put',
    data
  })
}

// 更新用户状态
export const updateUserStatus = (data) => {
  return service({
    url: '/annual/user/status',
    method: 'put',
    data
  })
}

// 删除用户
export const deleteUser = (data) => {
  return service({
    url: '/annual/user',
    method: 'delete',
    data
  })
}

// 批量删除用户
export const deleteUserByIds = (data) => {
  return service({
    url: '/annual/user/batch',
    method: 'delete',
    data
  })
}

// 导出用户
export const exportUser = (params) => {
  return service({
    url: '/annual/user/export',
    method: 'get',
    params
  })
}