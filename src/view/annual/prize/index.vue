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
        <el-form-item label="奖品名称">
          <el-input v-model="searchInfo.name" placeholder="请输入奖品名称" />
        </el-form-item>
        <el-form-item label="奖品等级">
          <el-select v-model="searchInfo.level" placeholder="请选择" clearable>
            <el-option label="特等奖" :value="1" />
            <el-option label="一等奖" :value="2" />
            <el-option label="二等奖" :value="3" />
            <el-option label="三等奖" :value="4" />
            <el-option label="参与奖" :value="5" />
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
        <el-button type="primary" icon="Plus" @click="openDialog('add')">新增奖品</el-button>
        <el-button type="danger" icon="Delete" :disabled="!multipleSelection.length" @click="handleBatchDelete">
          批量删除
        </el-button>
      </div>

      <el-table :data="tableData" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column label="ID" prop="ID" width="80" />
        <el-table-column label="奖品图片" width="100">
          <template #default="scope">
            <el-image 
              v-if="scope.row.image" 
              :src="getUrl(scope.row.image)" 
              style="width: 60px; height: 60px" 
              fit="cover"
              :preview-src-list="[scope.row.image]"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="奖品名称" prop="name" min-width="150" />
        <el-table-column label="奖品等级" width="100" align="center">
          <template #default="scope">
            <el-tag :type="levelTagType(scope.row.level)" size="small">
              {{ levelText(scope.row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="总数量" prop="totalCount" width="100" align="center" />
        <el-table-column label="剩余数量" prop="remainCount" width="100" align="center">
          <template #default="scope">
            <span :class="{ 'text-danger': scope.row.remainCount === 0 }">
              {{ scope.row.remainCount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="已发放" width="100" align="center">
          <template #default="scope">
            {{ scope.row.totalCount - scope.row.remainCount }}
          </template>
        </el-table-column>
        <el-table-column label="排序" prop="sort" width="80" align="center" />
        <el-table-column label="创建时间" width="170">
          <template #default="scope">
            {{ formatDate(scope.row.CreatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" link icon="Edit" @click="openDialog('edit', scope.row)">编辑</el-button>
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="所属活动" prop="activityId">
          <el-select v-model="formData.activityId" placeholder="请选择活动" style="width: 100%">
            <el-option 
              v-for="item in activityList" 
              :key="item.ID" 
              :label="item.title" 
              :value="item.ID" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="奖品名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入奖品名称" />
        </el-form-item>
        <el-form-item label="奖品图片" prop="image">
          <el-upload
            class="avatar-uploader"
            action="/api/fileUploadAndDownload/upload"
            :headers="{ 'x-token': token }"
            :show-file-list="false"
            :on-success="handleImageSuccess"
          >
            <el-image v-if="formData.image" :src="formData.image" class="avatar" fit="cover" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="奖品等级" prop="level">
          <el-select v-model="formData.level" placeholder="请选择" style="width: 100%">
            <el-option label="特等奖" :value="1" />
            <el-option label="一等奖" :value="2" />
            <el-option label="二等奖" :value="3" />
            <el-option label="三等奖" :value="4" />
            <el-option label="参与奖" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="奖品数量" prop="totalCount">
          <el-input-number v-model="formData.totalCount" :min="1" :max="9999" />
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/pinia/modules/user'
import { getPrizeList, createPrize, updatePrize, deletePrize, deletePrizeByIds } from '@/api/annual/prize'
import { getActivityList } from '@/api/annual/activity'
import { formatDate } from '@/utils/format'
import { getUrl, isVideoExt } from '@/utils/image'

const userStore = useUserStore()
const token = computed(() => userStore.token)

// 活动列表
const activityList = ref([])

// 搜索
const searchInfo = reactive({
  activityId: null,
  name: '',
  level: null
})

// 分页
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref([])
const multipleSelection = ref([])

// 弹窗
const dialogVisible = ref(false)
const dialogType = ref('add')
const dialogTitle = computed(() => dialogType.value === 'add' ? '新增奖品' : '编辑奖品')
const formRef = ref(null)
const formData = reactive({
  ID: 0,
  activityId: null,
  name: '',
  image: '',
  level: 1,
  totalCount: 1,
  sort: 0
})

const rules = {
  activityId: [{ required: true, message: '请选择活动', trigger: 'change' }],
  name: [{ required: true, message: '请输入奖品名称', trigger: 'blur' }],
  level: [{ required: true, message: '请选择奖品等级', trigger: 'change' }],
  totalCount: [{ required: true, message: '请输入奖品数量', trigger: 'blur' }]
}

// 等级
const levelText = (level) => {
  const map = { 1: '特等奖', 2: '一等奖', 3: '二等奖', 4: '三等奖', 5: '参与奖' }
  return map[level] || '未知'
}

const levelTagType = (level) => {
  const map = { 1: 'danger', 2: 'warning', 3: 'success', 4: 'info', 5: '' }
  return map[level] || 'info'
}

// 获取活动列表
const getActivityData = async () => {
  const res = await getActivityList({ page: 1, pageSize: 100 })
  if (res.code === 0) {
    activityList.value = res.data.list || []
  }
}

// 获取奖品列表
const getTableData = async () => {
  const res = await getPrizeList({
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
    name: '',
    level: null
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
const openDialog = (type, row = null) => {
  dialogType.value = type
  if (type === 'edit' && row) {
    Object.assign(formData, row)
  } else {
    Object.assign(formData, {
      ID: 0,
      activityId: searchInfo.activityId || null,
      name: '',
      image: '',
      level: 1,
      totalCount: 1,
      sort: 0
    })
  }
  dialogVisible.value = true
}

// 图片上传成功
const handleImageSuccess = (response) => {
  if (response.code === 0) {
    formData.image = response.data.file.url
  }
}

// 提交表单
const handleSubmit = async () => {
  await formRef.value.validate()
  
  let res
  if (dialogType.value === 'add') {
    res = await createPrize(formData)
  } else {
    res = await updatePrize(formData)
  }
  
  if (res.code === 0) {
    ElMessage.success(dialogType.value === 'add' ? '创建成功' : '更新成功')
    dialogVisible.value = false
    getTableData()
  }
}

// 删除
const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该奖品吗？', '提示', { type: 'warning' })
  
  const res = await deletePrize({ id: row.ID })
  if (res.code === 0) {
    ElMessage.success('删除成功')
    getTableData()
  }
}

// 批量删除
const handleBatchDelete = async () => {
  await ElMessageBox.confirm(`确定要删除选中的 ${multipleSelection.value.length} 个奖品吗？`, '提示', { type: 'warning' })
  
  const ids = multipleSelection.value.map(item => item.ID)
  const res = await deletePrizeByIds({ ids })
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
.text-danger {
  color: #f56c6c;
  font-weight: bold;
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
</style>