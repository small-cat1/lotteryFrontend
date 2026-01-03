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
        <el-form-item>
          <el-button type="primary" icon="Search" @click="onSubmit">查询</el-button>
          <el-button icon="Download" @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row" v-if="stats">
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">总签到人数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-value text-success">{{ stats.registered }}</div>
            <div class="stat-label">已报名用户</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-value text-warning">{{ stats.guest }}</div>
            <div class="stat-label">游客用户</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <div class="gva-table-box">
      <el-table :data="tableData" border stripe>
        <el-table-column label="ID" prop="id" width="80" />
        <el-table-column label="用户" min-width="180">
          <template #default="scope">
            <div class="user-info">
              <el-avatar :src="scope.row.user?.avatar" :size="40" />
              <div class="user-detail">
                <div>{{ scope.row.user?.nickname || '-' }}</div>
                <div class="text-muted">{{ scope.row.user?.realName || '游客' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="部门" min-width="120">
          <template #default="scope">
            {{ scope.row.user?.department || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="手机号" width="130">
          <template #default="scope">
            {{ scope.row.user?.phone || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="用户类型" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.user?.isRegistered === 1 ? 'success' : 'info'" size="small">
              {{ scope.row.user?.isRegistered === 1 ? '已报名' : '游客' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="签到时间" width="170">
          <template #default="scope">
            {{ formatDate(scope.row.checkInTime) }}
          </template>
        </el-table-column>
        <el-table-column label="签到IP" prop="ip" width="140" />
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
import { ElMessage } from 'element-plus'
import { getCheckInList, getCheckInStats, exportCheckIn } from '@/api/annual/checkIn'
import { getActivityList } from '@/api/annual/activity'
import { formatDate } from '@/utils/format'

// 活动列表
const activityList = ref([])

// 搜索
const searchInfo = reactive({
  activityId: null
})

// 统计
const stats = ref(null)

// 分页
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref([])

// 获取活动列表
const getActivityData = async () => {
  const res = await getActivityList({ page: 1, pageSize: 100 })
  if (res.code === 0) {
    activityList.value = res.data.list || []
    // 默认选中第一个
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

// 分页
const handleCurrentChange = (val) => {
  page.value = val
  getTableData()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  getTableData()
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
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-detail {
  overflow: hidden;
}
.text-muted {
  color: #909399;
  font-size: 12px;
}
</style>