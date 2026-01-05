<template>
  <div>
    <!-- 搜索栏 -->
    <div class="gva-search-box">
      <el-form :inline="true" :model="searchInfo" class="demo-form-inline">
        <el-form-item label="昵称">
          <el-input v-model="searchInfo.nickname" placeholder="请输入昵称" />
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
        <el-button
          type="danger"
          icon="Delete"
          :disabled="!multipleSelection.length"
          @click="handleBatchDelete"
        >
          批量删除
        </el-button>
      </div>

      <el-table
        :data="tableData"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="ID" prop="ID" width="80" />
        <el-table-column label="头像" width="80">
          <template #default="scope">
            <el-avatar :src="scope.row.avatar" :size="40" />
          </template>
        </el-table-column>
        <el-table-column label="微信昵称" prop="nickname" min-width="150" />
        <el-table-column
          label="OpenID"
          prop="openid"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column
          label="UnionID"
          prop="unionid"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column label="授权时间" width="170">
          <template #default="scope">
            {{ formatDate(scope.row.CreatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
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
  </div>
</template>

<script setup>
  import { deleteUser, deleteUserByIds, getUserList } from '@/api/annual/user'
  import { formatDate } from '@/utils/format'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { reactive, ref } from 'vue'

  // 搜索
  const searchInfo = reactive({
    nickname: ''
  })

  // 分页
  const page = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  const tableData = ref([])
  const multipleSelection = ref([])

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
    searchInfo.nickname = ''
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

  // 删除
  const handleDelete = async (row) => {
    await ElMessageBox.confirm(
      '确定要删除该用户吗？删除后该用户的所有签到记录也会被删除',
      '提示',
      { type: 'warning' }
    )

    const res = await deleteUser({ id: row.ID })
    if (res.code === 0) {
      ElMessage.success('删除成功')
      getTableData()
    }
  }

  // 批量删除
  const handleBatchDelete = async () => {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${multipleSelection.value.length} 个用户吗？`,
      '提示',
      { type: 'warning' }
    )

    const ids = multipleSelection.value.map((item) => item.ID)
    const res = await deleteUserByIds({ ids })
    if (res.code === 0) {
      ElMessage.success('删除成功')
      getTableData()
    }
  }

  // 初始化
  getTableData()
</script>
