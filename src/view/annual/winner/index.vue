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
        <el-form-item label="中奖方式">
          <el-select v-model="searchInfo.winType" placeholder="请选择" clearable>
            <el-option label="摇一摇" :value="1" />
            <el-option label="随机抽奖" :value="2" />
            <el-option label="弹幕抽奖" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="领奖状态">
          <el-select v-model="searchInfo.status" placeholder="请选择" clearable>
            <el-option label="未领取" :value="0" />
            <el-option label="已领取" :value="1" />
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
        <el-button type="primary" icon="Present" @click="openDrawDialog">随机抽奖</el-button>
        <el-button icon="Download" @click="handleExport">导出</el-button>
      </div>

      <el-table :data="tableData" border stripe>
        <el-table-column label="ID" prop="id" width="80" />
        <el-table-column label="中奖用户" min-width="150">
          <template #default="scope">
            <div class="user-info">
              <el-avatar :src="scope.row.user?.avatar" :size="32" />
              <div class="user-detail">
                <div>{{ scope.row.user?.nickname || '-' }}</div>
                <div class="text-muted">{{ scope.row.user?.realName || '' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="奖品" min-width="150">
          <template #default="scope">
            <div class="prize-info">
              <el-image 
                v-if="scope.row.prize?.image" 
                :src="scope.row.prize.image" 
                style="width: 40px; height: 40px" 
                fit="cover" 
              />
              <span>{{ scope.row.prize?.name || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="奖品等级" width="100" align="center">
          <template #default="scope">
            <el-tag :type="levelTagType(scope.row.prize?.level)" size="small">
              {{ levelText(scope.row.prize?.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="中奖方式" width="100" align="center">
          <template #default="scope">
            {{ winTypeText(scope.row.winType) }}
          </template>
        </el-table-column>
        <el-table-column label="领奖状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'warning'" size="small">
              {{ scope.row.status === 1 ? '已领取' : '未领取' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="中奖时间" width="170">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="领奖时间" width="170">
          <template #default="scope">
            {{ scope.row.receiveTime ? formatDate(scope.row.receiveTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === 0"
              type="success" 
              link 
              @click="handleReceive(scope.row)"
            >确认领奖</el-button>
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

    <!-- 随机抽奖弹窗 -->
    <el-dialog v-model="drawVisible" title="随机抽奖" width="500px" :close-on-click-modal="false">
      <el-form ref="drawFormRef" :model="drawForm" :rules="drawRules" label-width="80px">
        <el-form-item label="选择活动" prop="activityId">
          <el-select v-model="drawForm.activityId" placeholder="请选择活动" style="width: 100%" @change="handleDrawActivityChange">
            <el-option 
              v-for="item in activityList" 
              :key="item.ID" 
              :label="item.title" 
              :value="item.ID" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择奖品" prop="prizeId">
          <el-select v-model="drawForm.prizeId" placeholder="请选择奖品" style="width: 100%">
            <el-option 
              v-for="item in prizeList" 
              :key="item.ID" 
              :label="`${item.name} (剩余${item.remainCount})`" 
              :value="item.ID"
              :disabled="item.remainCount === 0"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="抽奖人数" prop="count">
          <el-input-number v-model="drawForm.count" :min="1" :max="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="drawVisible = false">取消</el-button>
        <el-button type="primary" :loading="drawLoading" @click="handleDraw">开始抽奖</el-button>
      </template>
    </el-dialog>

    <!-- 中奖结果弹窗 -->
    <el-dialog v-model="resultVisible" title="🎉 中奖名单" width="500px">
      <div class="winner-list">
        <div v-for="(item, index) in drawResult" :key="index" class="winner-item">
          <el-avatar :src="item.avatar" :size="48" />
          <div class="winner-info">
            <div class="winner-name">{{ item.nickname }}</div>
            <div class="winner-real-name">{{ item.realName }} - {{ item.department }}</div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getWinnerList, confirmReceive, deleteWinner, exportWinner, randomDraw } from '@/api/annual/winner'
import { getActivityList } from '@/api/annual/activity'
import { getPrizeList } from '@/api/annual/prize'
import { formatDate } from '@/utils/format'

// 活动和奖品列表
const activityList = ref([])
const prizeList = ref([])

// 搜索
const searchInfo = reactive({
  activityId: null,
  winType: null,
  status: null
})

// 分页
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref([])

// 抽奖弹窗
const drawVisible = ref(false)
const drawLoading = ref(false)
const drawFormRef = ref(null)
const drawForm = reactive({
  activityId: null,
  prizeId: null,
  count: 1
})
const drawRules = {
  activityId: [{ required: true, message: '请选择活动', trigger: 'change' }],
  prizeId: [{ required: true, message: '请选择奖品', trigger: 'change' }],
  count: [{ required: true, message: '请输入抽奖人数', trigger: 'blur' }]
}

// 抽奖结果
const resultVisible = ref(false)
const drawResult = ref([])

// 等级
const levelText = (level) => {
  const map = { 1: '特等奖', 2: '一等奖', 3: '二等奖', 4: '三等奖', 5: '参与奖' }
  return map[level] || '未知'
}

const levelTagType = (level) => {
  const map = { 1: 'danger', 2: 'warning', 3: 'success', 4: 'info', 5: '' }
  return map[level] || 'info'
}

// 中奖方式
const winTypeText = (type) => {
  const map = { 1: '摇一摇', 2: '随机抽奖', 3: '弹幕抽奖' }
  return map[type] || '未知'
}

// 获取活动列表
const getActivityData = async () => {
  const res = await getActivityList({ page: 1, pageSize: 100 })
  if (res.code === 0) {
    activityList.value = res.data.list || []
  }
}

// 获取奖品列表
const getPrizeData = async (activityId) => {
  if (!activityId) {
    prizeList.value = []
    return
  }
  const res = await getPrizeList({ page: 1, pageSize: 100, activityId })
  if (res.code === 0) {
    prizeList.value = res.data.list || []
  }
}

// 获取中奖列表
const getTableData = async () => {
  const res = await getWinnerList({
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
    winType: null,
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

// 打开抽奖弹窗
const openDrawDialog = () => {
  Object.assign(drawForm, {
    activityId: searchInfo.activityId || null,
    prizeId: null,
    count: 1
  })
  if (drawForm.activityId) {
    getPrizeData(drawForm.activityId)
  }
  drawVisible.value = true
}

// 抽奖活动变化
const handleDrawActivityChange = (val) => {
  drawForm.prizeId = null
  getPrizeData(val)
}

// 开始抽奖
const handleDraw = async () => {
  await drawFormRef.value.validate()
  
  drawLoading.value = true
  try {
    const res = await randomDraw(drawForm)
    if (res.code === 0) {
      ElMessage.success('抽奖成功')
      drawVisible.value = false
      drawResult.value = res.data || []
      if (drawResult.value.length > 0) {
        resultVisible.value = true
      }
      getTableData()
    }
  } finally {
    drawLoading.value = false
  }
}

// 确认领奖
const handleReceive = async (row) => {
  await ElMessageBox.confirm('确定该用户已领取奖品吗？', '提示', { type: 'warning' })
  
  const res = await confirmReceive({ id: row.id })
  if (res.code === 0) {
    ElMessage.success('确认成功')
    getTableData()
  }
}

// 删除
const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该中奖记录吗？', '提示', { type: 'warning' })
  
  const res = await deleteWinner({ id: row.id })
  if (res.code === 0) {
    ElMessage.success('删除成功')
    getTableData()
  }
}

// 导出
const handleExport = async () => {
  const res = await exportWinner(searchInfo)
  if (res.code === 0) {
    ElMessage.success('导出成功')
    window.open(res.data)
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
.user-detail {
  overflow: hidden;
}
.text-muted {
  color: #909399;
  font-size: 12px;
}
.prize-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.winner-list {
  max-height: 400px;
  overflow-y: auto;
}
.winner-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #eee;
}
.winner-item:last-child {
  border-bottom: none;
}
.winner-info {
  flex: 1;
}
.winner-name {
  font-size: 16px;
  font-weight: bold;
}
.winner-real-name {
  color: #909399;
  font-size: 13px;
  margin-top: 4px;
}
</style>