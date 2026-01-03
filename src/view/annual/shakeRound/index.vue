<template>
  <div>
    <!-- 搜索栏 -->
    <div class="gva-search-box">
      <el-form :inline="true" :model="searchInfo" class="demo-form-inline">
        <el-form-item label="活动">
          <el-select
            v-model="searchInfo.activityId"
            placeholder="请选择活动"
            clearable
          >
            <el-option
              v-for="item in activityList"
              :key="item.ID"
              :label="item.title"
              :value="item.ID"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="场次名称">
          <el-input
            v-model="searchInfo.roundName"
            placeholder="请输入场次名称"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchInfo.status" placeholder="请选择" clearable>
            <el-option label="未开始" :value="0" />
            <el-option label="进行中" :value="1" />
            <el-option label="已结束" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="onSubmit"
            >查询</el-button
          >
          <el-button icon="Refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格 -->
    <div class="gva-table-box">
      <div class="gva-btn-list">
        <el-button type="primary" icon="Plus" @click="openDialog('add')"
          >新增场次</el-button
        >
      </div>

      <el-table :data="tableData" border stripe>
        <el-table-column label="ID" prop="ID" width="80" />
        <el-table-column label="场次名称" prop="roundName" min-width="150" />
        <el-table-column label="关联奖品" min-width="150">
          <template #default="scope">
            <span v-if="scope.row.prize">{{ scope.row.prize.name }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="游戏时长" width="100" align="center">
          <template #default="scope"> {{ scope.row.duration }}秒 </template>
        </el-table-column>
        <el-table-column
          label="获奖人数"
          prop="winnerCount"
          width="100"
          align="center"
        />
        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.status)" size="small">
              {{ statusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="开始时间" width="170">
          <template #default="scope">
            {{ scope.row.startTime ? formatDate(scope.row.startTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="结束时间" width="170">
          <template #default="scope">
            {{ scope.row.endTime ? formatDate(scope.row.endTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              link
              icon="Edit"
              @click="openDialog('edit', scope.row)"
              >编辑</el-button
            >
            <el-button
              v-if="scope.row.status === 0"
              type="success"
              link
              icon="VideoPlay"
              @click="handleStart(scope.row)"
              >开始</el-button
            >
            <el-button
              v-if="scope.row.status === 1"
              type="warning"
              link
              icon="VideoPause"
              @click="handleStop(scope.row)"
              >结束</el-button
            >
            <el-button
              v-if="scope.row.status === 2"
              type="primary"
              link
              icon="Trophy"
              @click="showScores(scope.row)"
              >排行榜</el-button
            >
            <el-button
              type="danger"
              link
              icon="Delete"
              @click="handleDelete(scope.row)"
              >删除</el-button
            >
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="所属活动" prop="activityId">
          <el-select
            v-model="formData.activityId"
            placeholder="请选择活动"
            style="width: 100%"
            @change="handleActivityChange"
          >
            <el-option
              v-for="item in activityList"
              :key="item.ID"
              :label="item.title"
              :value="item.ID"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="场次名称" prop="roundName">
          <el-input v-model="formData.roundName" placeholder="请输入场次名称" />
        </el-form-item>
        <el-form-item label="关联奖品" prop="prizeId">
          <el-select
            v-model="formData.prizeId"
            placeholder="请选择奖品"
            style="width: 100%"
          >
            <el-option
              v-for="item in prizeList"
              :key="item.ID"
              :label="`${item.name} (剩余${item.remainCount})`"
              :value="item.ID"
              :disabled="item.remainCount === 0"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="游戏时长" prop="duration">
          <el-input-number v-model="formData.duration" :min="10" :max="120" />
          <span class="form-tip">秒</span>
        </el-form-item>
        <el-form-item label="获奖人数" prop="winnerCount">
          <el-input-number
            v-model="formData.winnerCount"
            :min="1"
            :max="currentPrizeRemain"
            :disabled="!formData.prizeId"
          />
          <span class="form-tip">最多 {{ currentPrizeRemain }} 人</span>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 排行榜弹窗 -->
    <el-dialog v-model="scoresVisible" title="成绩排行榜" width="600px">
      <el-table :data="scoresList" border stripe>
        <el-table-column label="排名" type="index" width="80" align="center" />
        <el-table-column label="头像" width="80">
          <template #default="scope">
            <el-avatar :src="scope.row.user?.avatar" :size="40" />
          </template>
        </el-table-column>
        <el-table-column label="昵称" min-width="120">
          <template #default="scope">
            {{ scope.row.user?.nickname || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="姓名" min-width="100">
          <template #default="scope">
            {{ scope.row.user?.realName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="得分" prop="score" width="100" align="center" />
        <el-table-column label="是否获奖" width="100" align="center">
          <template #default="scope">
            <el-tag
              :type="scope.row.isWinner === 1 ? 'success' : 'info'"
              size="small"
            >
              {{ scope.row.isWinner === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
  import { getActivityList } from '@/api/annual/activity'
  import { getPrizeList } from '@/api/annual/prize'
  import {
    createShakeRound,
    deleteShakeRound,
    getShakeRoundList,
    getShakeScores,
    startShakeRound,
    stopShakeRound,
    updateShakeRound
  } from '@/api/annual/shakeRound'
  import { formatDate } from '@/utils/format'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { computed, onMounted, reactive, ref, watch } from 'vue'

  // 活动列表
  const activityList = ref([])
  const prizeList = ref([])

  // 搜索
  const searchInfo = reactive({
    activityId: null,
    roundName: '',
    status: null
  })
  // 计算当前选中奖品的剩余数量
  const currentPrizeRemain = computed(() => {
    if (!formData.prizeId) return 100
    const prize = prizeList.value.find((p) => p.ID === formData.prizeId)
    return prize ? prize.remainCount : 100
  })
  // 分页
  const page = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  const tableData = ref([])

  // 弹窗
  const dialogVisible = ref(false)
  const dialogType = ref('add')
  const dialogTitle = computed(() =>
    dialogType.value === 'add' ? '新增场次' : '编辑场次'
  )
  const formRef = ref(null)
  const formData = reactive({
    ID: 0,
    activityId: null,
    roundName: '',
    prizeId: null,
    duration: 30,
    winnerCount: 1,
    sort: 0
  })

  const rules = {
    activityId: [{ required: true, message: '请选择活动', trigger: 'change' }],
    roundName: [{ required: true, message: '请输入场次名称', trigger: 'blur' }],
    prizeId: [{ required: true, message: '请选择奖品', trigger: 'change' }],
    duration: [{ required: true, message: '请输入游戏时长', trigger: 'blur' }],
    winnerCount: [
      { required: true, message: '请输入获奖人数', trigger: 'blur' }
    ]
  }

  // 排行榜
  const scoresVisible = ref(false)
  const scoresList = ref([])

  // 状态
  const statusText = (status) => {
    const map = { 0: '未开始', 1: '进行中', 2: '已结束' }
    return map[status] || '未知'
  }

  const statusTagType = (status) => {
    const map = { 0: 'info', 1: 'success', 2: 'danger' }
    return map[status] || 'info'
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

  // 活动变化
  const handleActivityChange = (val) => {
    formData.prizeId = null
    getPrizeData(val)
  }

  // 获取场次列表
  const getTableData = async () => {
    const res = await getShakeRoundList({
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
      roundName: '',
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

  // 打开弹窗
  const openDialog = async (type, row = null) => {
    dialogType.value = type
    if (type === 'edit' && row) {
      Object.assign(formData, row)
      await getPrizeData(row.activityId)
    } else {
      Object.assign(formData, {
        ID: 0,
        activityId: searchInfo.activityId || null,
        roundName: '',
        prizeId: null,
        duration: 30,
        winnerCount: 1,
        sort: 0
      })
      if (searchInfo.activityId) {
        await getPrizeData(searchInfo.activityId)
      }
    }
    dialogVisible.value = true
  }

  // 提交表单
  const handleSubmit = async () => {
    await formRef.value.validate()

    let res
    if (dialogType.value === 'add') {
      res = await createShakeRound(formData)
    } else {
      res = await updateShakeRound(formData)
    }

    if (res.code === 0) {
      ElMessage.success(dialogType.value === 'add' ? '创建成功' : '更新成功')
      dialogVisible.value = false
      getTableData()
    }
  }

  // 开始游戏
  const handleStart = async (row) => {
    await ElMessageBox.confirm('确定要开始该场次游戏吗？', '提示', {
      type: 'warning'
    })

    const res = await startShakeRound(row.ID)
    if (res.code === 0) {
      ElMessage.success('游戏已开始')
      getTableData()
    }
  }

  // 结束游戏
  const handleStop = async (row) => {
    await ElMessageBox.confirm(
      '确定要结束该场次游戏吗？系统将自动计算获奖者',
      '提示',
      { type: 'warning' }
    )

    const res = await stopShakeRound(row.ID)
    if (res.code === 0) {
      ElMessage.success('游戏已结束')
      getTableData()
      // 显示获奖者
      if (res.data && res.data.length > 0) {
        scoresList.value = res.data
        scoresVisible.value = true
      }
    }
  }

  // 查看排行榜
  const showScores = async (row) => {
    const res = await getShakeScores(row.ID)
    if (res.code === 0) {
      scoresList.value = res.data || []
      scoresVisible.value = true
    }
  }

  // 删除
  const handleDelete = async (row) => {
    await ElMessageBox.confirm('确定要删除该场次吗？', '提示', {
      type: 'warning'
    })

    const res = await deleteShakeRound({ id: row.ID })
    if (res.code === 0) {
      ElMessage.success('删除成功')
      getTableData()
    }
  }
  // 监听奖品变化，自动调整获奖人数
  watch(
    () => formData.prizeId,
    (newVal) => {
      if (newVal) {
        const prize = prizeList.value.find((p) => p.ID === newVal)
        if (prize) {
          // 如果当前获奖人数超过剩余数量，自动调整
          if (formData.winnerCount > prize.remainCount) {
            formData.winnerCount = prize.remainCount
          }
          // 如果剩余数量为0，提示用户
          if (prize.remainCount === 0) {
            ElMessage.warning('该奖品剩余数量为0，请选择其他奖品')
            formData.prizeId = null
          }
        }
      }
    }
  )
  // 初始化
  onMounted(() => {
    getActivityData()
    getTableData()
  })
</script>

<style scoped>
  .form-tip {
    margin-left: 10px;
    color: #909399;
  }
</style>
