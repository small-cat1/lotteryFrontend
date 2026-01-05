<template>
  <div>
    <!-- 搜索栏 -->
    <div class="gva-search-box">
      <el-form :inline="true" :model="searchInfo" class="demo-form-inline">
        <el-form-item label="活动">
          <el-select v-model="searchInfo.activityId" placeholder="请选择活动" clearable>
            <el-option 
              v-for="item in activityList" 
              :key="item.ID" 
              :label="item.title" 
              :value="item.ID" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="弹幕内容">
          <el-input v-model="searchInfo.content" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="状态">
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
        <el-button 
          type="success" 
          icon="Check" 
          :disabled="!multipleSelection.length" 
          @click="handleBatchAudit(1)"
        >批量通过</el-button>
        <el-button 
          type="warning" 
          icon="Close" 
          :disabled="!multipleSelection.length" 
          @click="handleBatchAudit(2)"
        >批量拒绝</el-button>
        <el-button 
          type="danger" 
          icon="Delete" 
          :disabled="!multipleSelection.length" 
          @click="handleBatchDelete"
        >批量删除</el-button>
      </div>

      <el-table :data="tableData" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column label="ID" prop="id" width="80" />
        <el-table-column label="用户" min-width="150">
          <template #default="scope">
            <div class="user-info">
              <el-avatar :src="scope.row.user?.avatar" :size="32" />
              <span class="user-name">{{ scope.row.user?.nickname || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="弹幕内容" prop="content" min-width="200">
          <template #default="scope">
            <span >{{ scope.row.content }}</span>
          </template>
        </el-table-column>
        <el-table-column label="颜色" width="100" align="center">
          <template #default="scope">
            <div class="color-box" :style="{ backgroundColor: scope.row.color }"></div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.status)" size="small">
              {{ statusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="置顶" width="80" align="center">
          <template #default="scope">
            <el-switch 
              v-model="scope.row.isTop" 
              :active-value="1" 
              :inactive-value="0"
              @change="handleTop(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="发送时间" width="170">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDanmakuList, auditDanmaku, topDanmaku, deleteDanmaku, deleteDanmakuByIds } from '@/api/annual/danmaku'
import { getActivityList } from '@/api/annual/activity'
import { formatDate } from '@/utils/format'

// 活动列表
const activityList = ref([])

// 搜索
const searchInfo = reactive({
  activityId: null,
  content: '',
  status: null
})

// 分页
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref([])
const multipleSelection = ref([])

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
  }
}

// 获取弹幕列表
const getTableData = async () => {
  const res = await getDanmakuList({
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
    activityId: null,
    content: '',
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

// 审核
const handleAudit = async (row, status) => {
  const actionText = status === 1 ? '通过' : '拒绝'
  
  const res = await auditDanmaku({ ids: [row.id], status })
  if (res.code === 0) {
    ElMessage.success(`${actionText}成功`)
    getTableData()
  }
}

// 批量审核
const handleBatchAudit = async (status) => {
  const actionText = status === 1 ? '通过' : '拒绝'
  await ElMessageBox.confirm(`确定要${actionText}选中的 ${multipleSelection.value.length} 条弹幕吗？`, '提示', { type: 'warning' })
  
  const ids = multipleSelection.value.map(item => item.id)
  const res = await auditDanmaku({ ids, status })
  if (res.code === 0) {
    ElMessage.success(`${actionText}成功`)
    getTableData()
  }
}

// 置顶
const handleTop = async (row) => {
  const res = await topDanmaku({ id: row.id, isTop: row.isTop })
  if (res.code === 0) {
    ElMessage.success('操作成功')
  } else {
    row.isTop = row.isTop === 1 ? 0 : 1
  }
}

// 删除
const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该弹幕吗？', '提示', { type: 'warning' })
  
  const res = await deleteDanmaku({ id: row.id })
  if (res.code === 0) {
    ElMessage.success('删除成功')
    getTableData()
  }
}

// 批量删除
const handleBatchDelete = async () => {
  await ElMessageBox.confirm(`确定要删除选中的 ${multipleSelection.value.length} 条弹幕吗？`, '提示', { type: 'warning' })
  
  const ids = multipleSelection.value.map(item => item.id)
  const res = await deleteDanmakuByIds({ ids })
  if (res.code === 0) {
    ElMessage.success('删除成功')
    getTableData()
  }
}

// 初始化
onMounted(() => {
  getActivityData()
  getTableData()
})
</script>

<style scoped>
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.user-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.color-box {
  width: 30px;
  height: 20px;
  border-radius: 4px;
  margin: 0 auto;
}
</style>