<template>
  <div>
    <!-- 搜索栏 -->
    <div class="gva-search-box">
      <el-form :inline="true" :model="searchInfo" class="demo-form-inline">
        <el-form-item label="昵称">
          <el-input v-model="searchInfo.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="searchInfo.realName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="部门">
          <el-input v-model="searchInfo.department" placeholder="请输入部门" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchInfo.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="报名状态">
          <el-select v-model="searchInfo.isRegistered" placeholder="请选择" clearable>
            <el-option label="游客" :value="0" />
            <el-option label="已报名" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="searchInfo.status" placeholder="请选择" clearable>
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已拒绝" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="onSubmit">查询</el-button>
          <el-button icon="Refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格 -->
    <div class="gva-table-box">
      <div class="gva-btn-list">
        <el-button type="danger" icon="Delete" :disabled="!multipleSelection.length" @click="handleBatchDelete">
          批量删除
        </el-button>
        <el-button icon="Download" @click="handleExport">导出</el-button>
      </div>

      <el-table :data="tableData" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column label="ID" prop="ID" width="80" />
        <el-table-column label="头像" width="80">
          <template #default="scope">
            <el-avatar :src="scope.row.avatar" :size="40" />
          </template>
        </el-table-column>
        <el-table-column label="微信昵称" prop="nickname" min-width="120" />
        <el-table-column label="真实姓名" prop="realName" min-width="100" />
        <el-table-column label="部门" prop="department" min-width="120" />
        <el-table-column label="手机号" prop="phone" width="130" />
        <el-table-column label="工号" prop="employeeNo" width="100" />
        <el-table-column label="报名状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.isRegistered === 1 ? 'success' : 'info'" size="small">
              {{ scope.row.isRegistered === 1 ? '已报名' : '游客' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.status)" size="small">
              {{ statusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="注册时间" width="170">
          <template #default="scope">
            {{ formatDate(scope.row.CreatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button type="primary" link icon="Edit" @click="openDialog(scope.row)">编辑</el-button>
            <el-button 
              v-if="scope.row.status === 0" 
              type="success" 
              link 
              @click="handleAudit(scope.row, 1)"
            >通过</el-button>
            <el-button 
              v-if="scope.row.status === 0" 
              type="warning" 
              link 
              @click="handleAudit(scope.row, 2)"
            >拒绝</el-button>
            <el-button type="danger" link icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="gva-pagination">
        <el-pagination
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" title="编辑用户" width="500px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="formData.department" placeholder="请输入部门" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="工号" prop="employeeNo">
          <el-input v-model="formData.employeeNo" placeholder="请输入工号" />
        </el-form-item>
        <el-form-item label="审核状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择">
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已拒绝" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getUserList, 
  updateUser, 
  updateUserStatus, 
  deleteUser, 
  deleteUserByIds,
  exportUser 
} from '@/api/annual/user'
import { formatDate } from '@/utils/format'

// 搜索
const searchInfo = reactive({
  nickname: '',
  realName: '',
  department: '',
  phone: '',
  isRegistered: null,
  status: null
})

// 分页
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref([])
const multipleSelection = ref([])

// 弹窗
const dialogVisible = ref(false)
const formRef = ref(null)
const formData = reactive({
  ID: 0,
  realName: '',
  department: '',
  phone: '',
  employeeNo: '',
  status: 1
})

const rules = {
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
}

// 状态
const statusText = (status) => {
  const map = { 0: '待审核', 1: '已通过', 2: '已拒绝' }
  return map[status] || '未知'
}

const statusTagType = (status) => {
  const map = { 0: 'warning', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

// 获取列表
const getTableData = async () => {
  const res = await getUserList({
    page: page.value,
    pageSize: pageSize.value,
    ...searchInfo
  })
  if (res.code === 0) {
    tableData.value = res.data.list || []
    total.value = res.data.total
  }
}

// 搜索
const onSubmit = () => {
  page.value = 1
  getTableData()
}

// 重置
const onReset = () => {
  Object.assign(searchInfo, {
    nickname: '',
    realName: '',
    department: '',
    phone: '',
    isRegistered: null,
    status: null
  })
  onSubmit()
}

// 分页
const handleCurrentChange = (val) => {
  page.value = val
  getTableData()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  getTableData()
}

// 多选
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

// 打开弹窗
const openDialog = (row) => {
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  await formRef.value.validate()
  const res = await updateUser(formData)
  if (res.code === 0) {
    ElMessage.success('更新成功')
    dialogVisible.value = false
    getTableData()
  }
}

// 审核
const handleAudit = async (row, status) => {
  const actionText = status === 1 ? '通过' : '拒绝'
  await ElMessageBox.confirm(`确定要${actionText}该用户吗？`, '提示', { type: 'warning' })
  
  const res = await updateUserStatus({ id: row.ID, status })
  if (res.code === 0) {
    ElMessage.success(`${actionText}成功`)
    getTableData()
  }
}

// 删除
const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该用户吗？', '提示', { type: 'warning' })
  
  const res = await deleteUser({ id: row.ID })
  if (res.code === 0) {
    ElMessage.success('删除成功')
    getTableData()
  }
}

// 批量删除
const handleBatchDelete = async () => {
  await ElMessageBox.confirm(`确定要删除选中的 ${multipleSelection.value.length} 个用户吗？`, '提示', { type: 'warning' })
  
  const ids = multipleSelection.value.map(item => item.ID)
  const res = await deleteUserByIds({ ids })
  if (res.code === 0) {
    ElMessage.success('删除成功')
    getTableData()
  }
}

// 导出
const handleExport = async () => {
  const res = await exportUser(searchInfo)
  if (res.code === 0) {
    ElMessage.success('导出成功')
    // 下载文件
    window.open(res.data)
  }
}

// 初始化
getTableData()
</script>