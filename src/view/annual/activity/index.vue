<template>
  <div>
    <!-- 搜索栏 -->
    <div class="gva-search-box">
      <el-form :inline="true" :model="searchInfo" class="demo-form-inline">
        <el-form-item label="活动名称">
          <el-input v-model="searchInfo.title" placeholder="请输入活动名称" />
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
          >新增活动</el-button
        >
      </div>

      <el-table :data="tableData" border stripe>
        <el-table-column label="ID" prop="ID" width="80" />
        <el-table-column label="活动名称" prop="title" min-width="150" />
        <el-table-column label="封面" width="120">
          <template #default="scope">
            <el-image
              v-if="scope.row.cover"
              :src="getUrl(scope.row.cover)"
              style="width: 50px; height: 50px"
              fit="cover"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="活动时间" min-width="180">
          <template #default="scope">
            <div>{{ formatDate(scope.row.startTime) }}</div>
            <div>至 {{ formatDate(scope.row.endTime) }}</div>
          </template>
        </el-table-column>
        
        <!-- 大屏幕地址 -->
        <el-table-column label="大屏幕地址" min-width="200">
          <template #default="scope">
            <div class="link-cell">
              <el-link 
                type="primary" 
                :href="getScreenUrl(scope.row.ID)" 
                target="_blank"
                :underline="false"
              >
                打开大屏幕
              </el-link>
              <el-button 
                type="primary" 
                link 
                icon="CopyDocument"
                @click="copyLink(getScreenUrl(scope.row.ID), '大屏幕地址')"
              >
                复制
              </el-button>
            </div>
          </template>
        </el-table-column>
        
        <!-- 用户参与地址 -->
        <el-table-column label="用户参与地址" min-width="200">
          <template #default="scope">
            <div class="link-cell">
              <el-link 
                type="success" 
                :href="getEntryUrl(scope.row.ID)" 
                target="_blank"
                :underline="false"
              >
                打开页面
              </el-link>
              <el-button 
                type="primary" 
                link 
                icon="CopyDocument"
                @click="copyLink(getEntryUrl(scope.row.ID), '参与地址')"
              >
                复制
              </el-button>
              <el-button 
                type="success" 
                link
                @click="showQrcode(scope.row)"
              >
                <el-icon><Iphone /></el-icon>
                二维码
              </el-button>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="签到" width="80" align="center">
          <template #default="scope">
            <el-tag
              :type="scope.row.checkInEnabled === 1 ? 'success' : 'info'"
              size="small"
            >
              {{ scope.row.checkInEnabled === 1 ? '开启' : '关闭' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="弹幕" width="80" align="center">
          <template #default="scope">
            <el-tag
              :type="scope.row.danmakuEnabled === 1 ? 'success' : 'info'"
              size="small"
            >
              {{ scope.row.danmakuEnabled === 1 ? '开启' : '关闭' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="弹幕审核" width="90" align="center">
          <template #default="scope">
            <el-tag
              :type="scope.row.danmakuAudit === 1 ? 'warning' : 'info'"
              size="small"
            >
              {{ scope.row.danmakuAudit === 1 ? '需审核' : '免审核' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="中奖排除" width="90" align="center">
          <template #default="scope">
            <el-tag
              :type="scope.row.winnerExclude === 1 ? 'warning' : 'info'"
              size="small"
            >
              {{ scope.row.winnerExclude === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.status)" size="small">
              {{ statusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="170">
          <template #default="scope">
            {{ formatDate(scope.row.CreatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              link
              icon="Edit"
              @click="openDialog('edit', scope.row)"
              >编辑</el-button
            >
            <el-button type="primary" link @click="handleStatus(scope.row)">
              {{ scope.row.status === 1 ? '结束' : '开始' }}
            </el-button>
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
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="活动名称" prop="title">
          <el-input v-model="formData.title" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="活动封面" prop="cover">
          <el-upload
            class="avatar-uploader"
            action="/api/fileUploadAndDownload/upload"
            :headers="{ 'x-token': token }"
            :show-file-list="false"
            :on-success="handleCoverSuccess"
          >
            <el-image
              v-if="formData.cover"
              :src="getUrl(formData.cover)"
              class="avatar"
              fit="cover"
            />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="活动时间" prop="timeRange">
          <el-date-picker
            v-model="formData.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DDTHH:mm:ssZ"
          />
        </el-form-item>
        <el-form-item label="活动描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入活动描述"
          />
        </el-form-item>
        <el-form-item label="开启签到" prop="checkInEnabled">
          <el-switch
            v-model="formData.checkInEnabled"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
        <el-form-item label="开启弹幕" prop="danmakuEnabled">
          <el-switch
            v-model="formData.danmakuEnabled"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
        <el-form-item label="弹幕审核" prop="danmakuAudit">
          <el-switch
            v-model="formData.danmakuAudit"
            :active-value="1"
            :inactive-value="0"
          />
          <span class="form-tip">开启后弹幕需审核通过才会显示</span>
        </el-form-item>
        <el-form-item label="中奖排除" prop="winnerExclude">
          <el-switch
            v-model="formData.winnerExclude"
            :active-value="1"
            :inactive-value="0"
          />
          <span class="form-tip">开启后中奖用户不参与后续抽奖</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 二维码弹窗 -->
    <el-dialog
      v-model="qrcodeVisible"
      title="扫码参与活动"
      width="400px"
      align-center
    >
      <div class="qrcode-dialog">
        <h3 class="activity-title">{{ currentActivity?.title }}</h3>
        <div class="qrcode-wrap">
          <qrcode-vue :value="currentQrcodeUrl" :size="200" level="H" />
        </div>
        <p class="qrcode-url">{{ currentQrcodeUrl }}</p>
        <el-button type="primary" @click="copyLink(currentQrcodeUrl, '参与地址')">
          <el-icon><CopyDocument /></el-icon>
          复制链接
        </el-button>
        <el-button @click="downloadQrcode">
          <el-icon><Download /></el-icon>
          下载二维码
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
  import {
    createActivity,
    deleteActivity,
    getActivityList,
    updateActivity,
    updateActivityStatus
  } from '@/api/annual/activity'
  import { useUserStore } from '@/pinia/modules/user'
  import { formatDate } from '@/utils/format'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { computed, reactive, ref } from 'vue'
  import { getUrl } from '@/utils/image'
  import { Iphone, CopyDocument, Download } from '@element-plus/icons-vue'
  import QrcodeVue from 'qrcode.vue'

  defineOptions({
    name: 'ActivityManager'
  })

  // 基础地址配置
  const BASE_URL = 'https://h5.app88.shop'

  const userStore = useUserStore()
  const token = computed(() => userStore.token)

  // 搜索
  const searchInfo = reactive({
    title: '',
    status: null
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
    dialogType.value === 'add' ? '新增活动' : '编辑活动'
  )
  const formRef = ref(null)
  const formData = reactive({
    ID: 0,
    title: '',
    cover: '',
    description: '',
    timeRange: [],
    startTime: null,
    endTime: null,
    checkInEnabled: 1,
    danmakuEnabled: 1,
    danmakuAudit: 0,
    winnerExclude: 0
  })

  const rules = {
    title: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
    timeRange: [
      { required: true, message: '请选择活动时间', trigger: 'change' }
    ]
  }

  // 二维码弹窗
  const qrcodeVisible = ref(false)
  const currentActivity = ref(null)
  const currentQrcodeUrl = computed(() => {
    if (!currentActivity.value) return ''
    return getEntryUrl(currentActivity.value.ID)
  })

  // 生成大屏幕地址
  const getScreenUrl = (activityId) => {
    return `${BASE_URL}/screen?activityId=${activityId}`
  }

  // 生成用户参与地址
  const getEntryUrl = (activityId) => {
    return `${BASE_URL}/entry?activityId=${activityId}`
  }

  // 复制链接
  const copyLink = async (url, name) => {
    try {
      await navigator.clipboard.writeText(url)
      ElMessage.success(`${name}已复制到剪贴板`)
    } catch (err) {
      // 降级方案
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      ElMessage.success(`${name}已复制到剪贴板`)
    }
  }

  // 显示二维码弹窗
  const showQrcode = (row) => {
    currentActivity.value = row
    qrcodeVisible.value = true
  }

  // 下载二维码
  const downloadQrcode = () => {
    const canvas = document.querySelector('.qrcode-wrap canvas')
    if (!canvas) return
    
    const link = document.createElement('a')
    link.download = `${currentActivity.value?.title || '活动'}-二维码.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  // 获取列表
  const getTableData = async () => {
    const res = await getActivityList({
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
    searchInfo.title = ''
    searchInfo.status = null
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

  // 状态文本
  const statusText = (status) => {
    const map = { 0: '未开始', 1: '进行中', 2: '已结束' }
    return map[status] || '未知'
  }

  const statusTagType = (status) => {
    const map = { 0: 'info', 1: 'success', 2: 'danger' }
    return map[status] || 'info'
  }

  // 打开弹窗
  const openDialog = (type, row = null) => {
    dialogType.value = type
    if (type === 'edit' && row) {
      Object.assign(formData, {
        ...row,
        timeRange:
          row.startTime && row.endTime ? [row.startTime, row.endTime] : []
      })
    } else {
      Object.assign(formData, {
        ID: 0,
        title: '',
        cover: '',
        description: '',
        timeRange: [],
        startTime: null,
        endTime: null,
        checkInEnabled: 1,
        danmakuEnabled: 1,
        danmakuAudit: 0,
        winnerExclude: 0
      })
    }
    dialogVisible.value = true
  }

  // 封面上传成功
  const handleCoverSuccess = (response) => {
    if (response.code === 0) {
      formData.cover = response.data.file.url
    }
  }

  // 提交表单
  const handleSubmit = async () => {
    await formRef.value.validate()

    const submitData = {
      ...formData,
      startTime: formData.timeRange[0],
      endTime: formData.timeRange[1]
    }
    delete submitData.timeRange

    let res
    if (dialogType.value === 'add') {
      res = await createActivity(submitData)
    } else {
      res = await updateActivity(submitData)
    }

    if (res.code === 0) {
      ElMessage.success(dialogType.value === 'add' ? '创建成功' : '更新成功')
      dialogVisible.value = false
      getTableData()
    }
  }

  // 更新状态
  const handleStatus = async (row) => {
    const newStatus = row.status === 1 ? 2 : 1
    const actionText = newStatus === 1 ? '开始' : '结束'

    await ElMessageBox.confirm(`确定要${actionText}该活动吗？`, '提示', {
      type: 'warning'
    })

    const res = await updateActivityStatus({ id: row.ID, status: newStatus })
    if (res.code === 0) {
      ElMessage.success(`${actionText}成功`)
      getTableData()
    }
  }

  // 删除
  const handleDelete = async (row) => {
    await ElMessageBox.confirm('确定要删除该活动吗？', '提示', {
      type: 'warning'
    })

    const res = await deleteActivity({ id: row.ID })
    if (res.code === 0) {
      ElMessage.success('删除成功')
      getTableData()
    }
  }

  // 初始化
  getTableData()
</script>

<style scoped>
  .form-tip {
    margin-left: 10px;
    color: #909399;
    font-size: 12px;
  }
  .avatar-uploader {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .avatar {
    width: 100px;
    height: 100px;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
  }

  /* 链接单元格样式 */
  .link-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  /* 二维码弹窗样式 */
  .qrcode-dialog {
    text-align: center;
    padding: 20px 0;
  }
  .qrcode-dialog .activity-title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin-bottom: 20px;
  }
  .qrcode-dialog .qrcode-wrap {
    display: inline-flex;
    padding: 16px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    margin-bottom: 16px;
  }
  .qrcode-dialog .qrcode-url {
    font-size: 12px;
    color: #999;
    margin-bottom: 20px;
    word-break: break-all;
    padding: 0 20px;
  }
</style>