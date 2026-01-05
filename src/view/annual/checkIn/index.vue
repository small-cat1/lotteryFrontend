<template>
  <div>
    <!-- 搜索栏 -->
    <div class="gva-search-box">
      <el-form :inline="true" :model="searchInfo" class="demo-form-inline">
        <el-form-item label="活动">
          <el-select v-model="searchInfo.activityId" placeholder="请选择活动" @change="handleActivityChange">
            <el-option 
              v-for="item in activityList" 
              :key="item.ID" 
              :label="item.title" 
              :value="item.ID" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="searchInfo.realName" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchInfo.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="部门">
          <el-input v-model="searchInfo.department" placeholder="请输入部门" clearable />
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
          <!-- <el-button icon="Download" @click="handleExport">导出</el-button> -->
        </el-form-item>
      </el-form>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row" v-if="stats">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">总签到人数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-value text-warning">{{ stats.pending }}</div>
            <div class="stat-label">待审核</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-value text-success">{{ stats.approved }}</div>
            <div class="stat-label">已通过</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-value text-danger">{{ stats.rejected }}</div>
            <div class="stat-label">已拒绝</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <div class="gva-table-box">
      <div class="gva-btn-list">
        <el-button 
          type="success" 
          icon="Check" 
          :disabled="!pendingSelection.length" 
          @click="handleBatchAudit(1)"
        >
          批量通过
        </el-button>
        <el-button 
          type="warning" 
          icon="Close" 
          :disabled="!pendingSelection.length" 
          @click="handleBatchAudit(2)"
        >
          批量拒绝
        </el-button>
      </div>

      <el-table :data="tableData" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column label="ID" prop="id" width="80" />
        <el-table-column label="微信用户" min-width="160">
          <template #default="scope">
            <div class="user-info">
              <el-avatar :src="scope.row.user?.avatar" :size="40" />
              <div class="user-detail">
                <div>{{ scope.row.user?.nickname || '-' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="真实姓名" prop="realName" min-width="100" />
        <el-table-column label="手机号" prop="phone" width="130" />
        <el-table-column label="部门" prop="department" min-width="120" />
        <el-table-column label="工号" prop="employeeNo" width="100" />
        <el-table-column label="审核状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.status)" size="small">
              {{ statusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="拒绝原因" prop="rejectReason" min-width="120" show-overflow-tooltip />
        <el-table-column label="签到时间" width="170">
          <template #default="scope">
            {{ formatDate(scope.row.checkInTime) }}
          </template>
        </el-table-column>
        <el-table-column label="签到IP" prop="ip" width="140" />
        <el-table-column label="操作" width="200" fixed="right">
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
              @click="openRejectDialog(scope.row)"
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
    <el-dialog v-model="dialogVisible" title="编辑签到信息" width="500px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="formData.department" placeholder="请输入部门" />
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
        <el-form-item v-if="formData.status === 2" label="拒绝原因" prop="rejectReason">
          <el-input v-model="formData.rejectReason" type="textarea" placeholder="请输入拒绝原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 拒绝弹窗 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝签到" width="400px" :close-on-click-modal="false">
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="拒绝原因">
          <el-input v-model="rejectForm.reason" type="textarea" placeholder="请输入拒绝原因（选填）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReject">确定拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getCheckInList, 
  getCheckInStats, 
  updateCheckIn,
  updateCheckInStatus,
  deleteCheckIn,
  exportCheckIn 
} from '@/api/annual/checkIn'
import { getActivityList } from '@/api/annual/activity'
import { formatDate } from '@/utils/format'

// 活动列表
const activityList = ref([])

// 搜索
const searchInfo = reactive({
  activityId: null,
  realName: '',
  phone: '',
  department: '',
  status: null
})

// 统计
const stats = ref(null)

// 分页
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref([])
const multipleSelection = ref([])

// 筛选出待审核的选中项
const pendingSelection = computed(() => {
  return multipleSelection.value.filter(item => item.status === 0)
})

// 弹窗
const dialogVisible = ref(false)
const formRef = ref(null)
const formData = reactive({
  id: 0,
  realName: '',
  phone: '',
  department: '',
  employeeNo: '',
  status: 1,
  rejectReason: ''
})

// 拒绝弹窗
const rejectDialogVisible = ref(false)
const rejectForm = reactive({
  id: 0,
  reason: ''
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

// 获取活动列表
const getActivityData = async () => {
  const res = await getActivityList({ page: 1, pageSize: 100 })
  if (res.code === 0) {
    activityList.value = res.data.list || []
    if (activityList.value.length > 0) {
      searchInfo.activityId = activityList.value[0].ID
      getTableData()
      getStats()
    }
  }
}

// 获取统计
const getStats = async () => {
  if (!searchInfo.activityId) return
  const res = await getCheckInStats(searchInfo.activityId)
  if (res.code === 0) {
    stats.value = res.data
  }
}

// 获取签到列表
const getTableData = async () => {
  if (!searchInfo.activityId) return
  const res = await getCheckInList({
    page: page.value,
    pageSize: pageSize.value,
    ...searchInfo
  })
  if (res.code === 0) {
    tableData.value = res.data.list || []
    total.value = res.data.total
  }
}

// 活动变化
const handleActivityChange = () => {
  page.value = 1
  getTableData()
  getStats()
}

// 搜索
const onSubmit = () => {
  page.value = 1
  getTableData()
}

// 重置
const onReset = () => {
  Object.assign(searchInfo, {
    realName: '',
    phone: '',
    department: '',
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

// 打开编辑弹窗
const openDialog = (row) => {
  Object.assign(formData, {
    id: row.id,
    realName: row.realName,
    phone: row.phone,
    department: row.department,
    employeeNo: row.employeeNo,
    status: row.status,
    rejectReason: row.rejectReason || ''
  })
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  await formRef.value.validate()
  const res = await updateCheckIn(formData)
  if (res.code === 0) {
    ElMessage.success('更新成功')
    dialogVisible.value = false
    getTableData()
    getStats()
  }
}

// 审核通过
const handleAudit = async (row, status) => {
  await ElMessageBox.confirm('确定要通过该签到吗？', '提示', { type: 'warning' })
  
  const res = await updateCheckInStatus({ id: row.id, status })
  if (res.code === 0) {
    ElMessage.success('审核成功')
    getTableData()
    getStats()
  }
}

// 打开拒绝弹窗
const openRejectDialog = (row) => {
  rejectForm.id = row.id
  rejectForm.reason = ''
  rejectDialogVisible.value = true
}

// 确认拒绝
const confirmReject = async () => {
  const res = await updateCheckInStatus({ 
    id: rejectForm.id, 
    status: 2, 
    rejectReason: rejectForm.reason 
  })
  if (res.code === 0) {
    ElMessage.success('已拒绝')
    rejectDialogVisible.value = false
    getTableData()
    getStats()
  }
}

// 批量审核
const handleBatchAudit = async (status) => {
  const actionText = status === 1 ? '通过' : '拒绝'
  await ElMessageBox.confirm(`确定要${actionText}选中的 ${pendingSelection.value.length} 条签到吗？`, '提示', { type: 'warning' })
  
  const ids = pendingSelection.value.map(item => item.id)
  const res = await updateCheckInStatus({ ids, status })
  if (res.code === 0) {
    ElMessage.success(`${actionText}成功`)
    getTableData()
    getStats()
  }
}

// 删除
const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该签到记录吗？', '提示', { type: 'warning' })
  
  const res = await deleteCheckIn({ id: row.id })
  if (res.code === 0) {
    ElMessage.success('删除成功')
    getTableData()
    getStats()
  }
}

// 导出
const handleExport = async () => {
  const res = await exportCheckIn(searchInfo)
  if (res.code === 0) {
    ElMessage.success('导出成功')
    window.open(res.data)
  }
}

// 初始化
onMounted(() => {
  getActivityData()
})
</script>

<style scoped>
.stats-row {
  margin-bottom: 20px;
}
.stat-item {
  text-align: center;
  padding: 10px 0;
}
.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
}
.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}
.text-success {
  color: #67c23a;
}
.text-warning {
  color: #e6a23c;
}
.text-danger {
  color: #f56c6c;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-detail {
  overflow: hidden;
}
</style>