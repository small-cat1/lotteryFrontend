import service from '@/utils/request'

// 获取用户列表
export const getUserList = (data) => {
  return service({
    url: '/annual/user/list',
    method: 'post',
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

