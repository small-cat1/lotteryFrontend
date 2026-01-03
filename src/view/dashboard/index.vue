<template>
  <div class="annual-dashboard">
    <!-- 活动选择器 -->
    <div class="activity-selector mb-4">
      <el-select 
        v-model="currentActivityId" 
        placeholder="请选择活动" 
        size="large"
        @change="handleActivityChange"
      >
        <el-option
          v-for="item in activityList"
          :key="item.ID"
          :label="item.title"
          :value="item.ID"
        />
      </el-select>
      <el-button type="primary" :icon="Refresh" @click="refreshData" :loading="loading">
        刷新数据
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <stat-card
        title="签到人数"
        :value="stats.checkInCount"
        :sub-value="stats.registeredCount"
        sub-label="已报名"
        icon="UserFilled"
        color="#409EFF"
        :trend="12.5"
      />
      <stat-card
        title="弹幕总数"
        :value="stats.danmakuCount"
        :sub-value="stats.pendingDanmakuCount"
        sub-label="待审核"
        icon="ChatDotRound"
        color="#67C23A"
        :trend="8.2"
      />
      <stat-card
        title="摇一摇次数"
        :value="stats.shakeCount"
        :sub-value="stats.shakeRoundCount"
        sub-label="场次"
        icon="Cellphone"
        color="#E6A23C"
        :trend="25.8"
      />
      <stat-card
        title="中奖人数"
        :value="stats.winnerCount"
        :sub-value="stats.receivedCount"
        sub-label="已领奖"
        icon="Trophy"
        color="#F56C6C"
        :trend="5.3"
      />
    </div>

    <!-- 图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-7 gap-4 mb-4">
      <!-- 签到趋势 -->
      <gva-card title="签到趋势" custom-class="col-span-1 lg:col-span-4">
        <check-in-chart :data="checkInTrendData" height="280px" />
      </gva-card>

      <!-- 奖品发放统计 -->
      <gva-card title="奖品发放" custom-class="col-span-1 lg:col-span-3">
        <prize-chart :data="prizeData" height="280px" />
      </gva-card>
    </div>

    <!-- 下半部分 -->
    <div class="grid grid-cols-1 lg:grid-cols-7 gap-4">
      <!-- 最新中奖 -->
      <gva-card title="最新中奖" show-action custom-class="col-span-1 lg:col-span-3 row-span-2">
        <template #action>
          <span class="text-sm text-blue-500 cursor-pointer" @click="goToWinner">查看更多</span>
        </template>
        <winner-table :data="recentWinners" />
      </gva-card>

      <!-- 弹幕热词 -->
      <gva-card title="弹幕热词" custom-class="col-span-1 lg:col-span-2">
        <word-cloud :data="hotWords" height="200px" />
      </gva-card>

      <!-- 最新弹幕 -->
      <gva-card title="最新弹幕" show-action custom-class="col-span-1 lg:col-span-2">
        <template #action>
          <span class="text-sm text-blue-500 cursor-pointer" @click="goToDanmaku">查看更多</span>
        </template>
        <danmaku-list :data="recentDanmaku" />
      </gva-card>

      <!-- 摇一摇排行 -->
      <gva-card title="摇一摇排行" show-action custom-class="col-span-1 lg:col-span-2">
        <template #action>
          <span class="text-sm text-blue-500 cursor-pointer" @click="goToShakeRound">查看更多</span>
        </template>
        <shake-ranking :data="shakeRanking" />
      </gva-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getActivityList } from '@/api/annual/activity'
import { getDashboardStats, getCheckInTrend, getPrizeStats, getRecentWinners, getHotWords, getRecentDanmaku, getShakeRanking } from '@/api/annual/dashboard'

import GvaCard from './components/card.vue'
import StatCard from './components/stat-card.vue'
import CheckInChart from './components/check-in-chart.vue'
import PrizeChart from './components/prize-chart.vue'
import WinnerTable from './components/winner-table.vue'
import WordCloud from './components/word-cloud.vue'
import DanmakuList from './components/danmaku-list.vue'
import ShakeRanking from './components/shake-ranking.vue'

defineOptions({
  name: 'AnnualDashboard'
})

const router = useRouter()
const loading = ref(false)
const currentActivityId = ref(null)
const activityList = ref([])

// 统计数据
const stats = reactive({
  checkInCount: 0,
  registeredCount: 0,
  danmakuCount: 0,
  pendingDanmakuCount: 0,
  shakeCount: 0,
  shakeRoundCount: 0,
  winnerCount: 0,
  receivedCount: 0
})

// 图表数据
const checkInTrendData = ref([])
const prizeData = ref([])
const recentWinners = ref([])
const hotWords = ref([])
const recentDanmaku = ref([])
const shakeRanking = ref([])

// 获取活动列表
const getActivities = async () => {
  try {
    const res = await getActivityList({ page: 1, pageSize: 100 })
    if (res.code === 0) {
      activityList.value = res.data.list || []
      if (activityList.value.length > 0) {
        // 默认选择进行中的活动，没有则选第一个
        const ongoingActivity = activityList.value.find(item => item.status === 1)
        currentActivityId.value = ongoingActivity?.ID || activityList.value[0].ID
        await refreshData()
      }
    }
  } catch (error) {
    console.error('获取活动列表失败', error)
  }
}

// 活动切换
const handleActivityChange = () => {
  refreshData()
}

// 刷新数据
const refreshData = async () => {
  if (!currentActivityId.value) return
  
  loading.value = true
  try {
    await Promise.all([
      fetchStats(),
      fetchCheckInTrend(),
      fetchPrizeStats(),
      fetchRecentWinners(),
      fetchHotWords(),
      fetchRecentDanmaku(),
      fetchShakeRanking()
    ])
    ElMessage.success('数据已刷新')
  } catch (error) {
    console.error('刷新数据失败', error)
    ElMessage.error('刷新数据失败')
  } finally {
    loading.value = false
  }
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const res = await getDashboardStats(currentActivityId.value)
    if (res.code === 0) {
      Object.assign(stats, res.data)
    }
  } catch (error) {
    // 使用模拟数据
    Object.assign(stats, {
      checkInCount: 328,
      registeredCount: 286,
      danmakuCount: 1256,
      pendingDanmakuCount: 23,
      shakeCount: 8964,
      shakeRoundCount: 5,
      winnerCount: 45,
      receivedCount: 32
    })
  }
}

// 获取签到趋势
const fetchCheckInTrend = async () => {
  try {
    const res = await getCheckInTrend(currentActivityId.value)
    if (res.code === 0) {
      checkInTrendData.value = res.data
    }
  } catch (error) {
    // 使用模拟数据
    checkInTrendData.value = [
      { time: '18:00', count: 12 },
      { time: '18:30', count: 45 },
      { time: '19:00', count: 89 },
      { time: '19:30', count: 156 },
      { time: '20:00', count: 234 },
      { time: '20:30', count: 289 },
      { time: '21:00', count: 312 },
      { time: '21:30', count: 328 }
    ]
  }
}

// 获取奖品统计
const fetchPrizeStats = async () => {
  try {
    const res = await getPrizeStats(currentActivityId.value)
    if (res.code === 0) {
      prizeData.value = res.data
    }
  } catch (error) {
    // 使用模拟数据
    prizeData.value = [
      { name: '特等奖', total: 1, used: 1 },
      { name: '一等奖', total: 3, used: 3 },
      { name: '二等奖', total: 10, used: 8 },
      { name: '三等奖', total: 30, used: 25 },
      { name: '参与奖', total: 100, used: 45 }
    ]
  }
}

// 获取最新中奖
const fetchRecentWinners = async () => {
  try {
    const res = await getRecentWinners(currentActivityId.value)
    if (res.code === 0) {
      recentWinners.value = res.data || []
    }
  } catch (error) {
    // 使用模拟数据
    recentWinners.value = [
      { id: 1, userName: '张三', avatar: '', prizeName: '一等奖 iPhone 15', time: '21:30:25' },
      { id: 2, userName: '李四', avatar: '', prizeName: '二等奖 AirPods Pro', time: '21:28:18' },
      { id: 3, userName: '王五', avatar: '', prizeName: '三等奖 小米手环', time: '21:25:42' },
      { id: 4, userName: '赵六', avatar: '', prizeName: '三等奖 小米手环', time: '21:22:15' },
      { id: 5, userName: '孙七', avatar: '', prizeName: '参与奖 定制礼品', time: '21:18:33' }
    ]
  }
}

// 获取热词
const fetchHotWords = async () => {
  try {
    const res = await getHotWords(currentActivityId.value)
    if (res.code === 0) {
      hotWords.value = res.data || []
    }
  } catch (error) {
    // 使用模拟数据
    hotWords.value = [
      { name: '新年快乐', value: 156 },
      { name: '2026', value: 132 },
      { name: '加油', value: 98 },
      { name: '发财', value: 87 },
      { name: '冲冲冲', value: 76 },
      { name: '666', value: 65 },
      { name: '牛逼', value: 54 },
      { name: '感谢公司', value: 43 },
      { name: '开心', value: 38 },
      { name: '福利', value: 32 }
    ]
  }
}

// 获取最新弹幕
const fetchRecentDanmaku = async () => {
  try {
    const res = await getRecentDanmaku(currentActivityId.value)
    if (res.code === 0) {
      recentDanmaku.value = res.data || []
    }
  } catch (error) {
    // 使用模拟数据
    recentDanmaku.value = [
      { id: 1, userName: '张三', content: '新年快乐！祝公司越来越好！', color: '#FF5500' },
      { id: 2, userName: '李四', content: '2026冲冲冲！', color: '#00FF00' },
      { id: 3, userName: '王五', content: '希望今年能中大奖！', color: '#FFFF00' },
      { id: 4, userName: '赵六', content: '感谢公司的福利！', color: '#00FFFF' },
      { id: 5, userName: '孙七', content: '年会太棒了！666！', color: '#FF00FF' }
    ]
  }
}

// 获取摇一摇排行
const fetchShakeRanking = async () => {
  try {
    const res = await getShakeRanking(currentActivityId.value)
    if (res.code === 0) {
      shakeRanking.value = res.data || []
    }
  } catch (error) {
    // 使用模拟数据
    shakeRanking.value = [
      { rank: 1, userName: '张三', score: 892 },
      { rank: 2, userName: '李四', score: 856 },
      { rank: 3, userName: '王五', score: 823 },
      { rank: 4, userName: '赵六', score: 798 },
      { rank: 5, userName: '孙七', score: 765 }
    ]
  }
}

// 跳转
const goToWinner = () => router.push({ name: 'annualWinner' })
const goToDanmaku = () => router.push({ name: 'annualDanmaku' })
const goToShakeRound = () => router.push({ name: 'annualShakeRound' })

onMounted(() => {
  getActivities()
})
</script>

<style lang="scss" scoped>
.annual-dashboard {
  padding: 16px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 100px);
}

.activity-selector {
  display: flex;
  align-items: center;
  gap: 16px;
  
  .el-select {
    width: 300px;
  }
}

:deep(.el-card) {
  border-radius: 8px;
}
</style>
