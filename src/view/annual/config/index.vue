<template>
  <div class="config-container">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 微信配置 -->
      <el-tab-pane label="微信配置" name="wechat">
        <el-form 
          ref="wechatFormRef" 
          :model="wechatForm" 
          :rules="wechatRules" 
          label-width="120px"
          class="config-form"
        >
          <el-form-item label="AppID" prop="appId">
            <el-input v-model="wechatForm.appId" placeholder="请输入微信公众号AppID" />
          </el-form-item>
          <el-form-item label="AppSecret" prop="secret">
            <el-input 
              v-model="wechatForm.secret" 
              type="password" 
              show-password
              placeholder="请输入微信公众号AppSecret" 
            />
          </el-form-item>
          <el-form-item label="Token" prop="token">
            <el-input v-model="wechatForm.token" placeholder="请输入微信公众号Token（可选）" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveWechatConfig" :loading="saving">保存配置</el-button>
            <el-button @click="resetWechatForm">重置</el-button>
          </el-form-item>
        </el-form>
        
        <el-divider />
        
        <div class="config-tips">
          <h4>配置说明</h4>
          <ol>
            <li>登录 <a href="https://mp.weixin.qq.com" target="_blank">微信公众平台</a></li>
            <li>进入 开发 → 基本配置，获取 AppID 和 AppSecret</li>
            <li>在 开发 → 基本配置 → 服务器配置 中设置服务器地址</li>
            <li>服务器地址格式：<code>https://你的域名/api/annual/wechat/callback</code></li>
            <li>需要认证的服务号才能使用网页授权功能</li>
          </ol>
        </div>
      </el-tab-pane>

      <!-- 站点配置 -->
      <el-tab-pane label="站点配置" name="site">
        <el-form 
          ref="siteFormRef" 
          :model="siteForm" 
          :rules="siteRules" 
          label-width="120px"
          class="config-form"
        >
          <el-form-item label="站点名称" prop="name">
            <el-input v-model="siteForm.name" placeholder="请输入站点名称" />
          </el-form-item>
          <el-form-item label="站点Logo" prop="logo">
            <div class="logo-uploader">
              <el-upload
                class="avatar-uploader"
                action="/api/fileUploadAndDownload/upload"
                :headers="{ 'x-token': token }"
                :show-file-list="false"
                :on-success="handleLogoSuccess"
              >
                <el-image v-if="siteForm.logo" :src="siteForm.logo" class="logo-preview" fit="contain" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
              <el-button v-if="siteForm.logo" type="danger" link @click="siteForm.logo = ''">删除</el-button>
            </div>
          </el-form-item>
          <el-form-item label="版权信息" prop="copyright">
            <el-input v-model="siteForm.copyright" placeholder="请输入版权信息" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveSiteConfig" :loading="saving">保存配置</el-button>
            <el-button @click="resetSiteForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 高级配置 -->
      <el-tab-pane label="高级配置" name="advanced">
        <div class="gva-btn-list mb-4">
          <el-button type="primary" icon="Plus" @click="openConfigDialog">新增配置</el-button>
        </div>
        
        <el-table :data="configList" border stripe>
          <el-table-column label="配置键" prop="configKey" min-width="180" />
          <el-table-column label="配置值" prop="configValue" min-width="200" show-overflow-tooltip />
          <el-table-column label="说明" prop="description" min-width="150" />
          <el-table-column label="更新时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.updatedAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button type="primary" link @click="editConfig(scope.row)">编辑</el-button>
              <el-button 
                type="danger" 
                link 
                @click="handleDeleteConfig(scope.row)"
                :disabled="isSystemConfig(scope.row.configKey)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 配置编辑弹窗 -->
    <el-dialog v-model="configDialogVisible" :title="configDialogTitle" width="500px">
      <el-form ref="configFormRef" :model="configForm" :rules="configRules" label-width="80px">
        <el-form-item label="配置键" prop="configKey">
          <el-input 
            v-model="configForm.configKey" 
            placeholder="请输入配置键"
            :disabled="configDialogType === 'edit'"
          />
        </el-form-item>
        <el-form-item label="配置值" prop="configValue">
          <el-input 
            v-model="configForm.configValue" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入配置值" 
          />
        </el-form-item>
        <el-form-item label="说明" prop="description">
          <el-input v-model="configForm.description" placeholder="请输入配置说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="configDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveConfig" :loading="saving">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/pinia/modules/user'
import { Plus } from '@element-plus/icons-vue'
import { 
  getConfigList, 
  getWechatConfig, 
  setWechatConfig, 
  getSiteConfig, 
  setSiteConfig,
  setConfig,
  deleteConfig
} from '@/api/annual/config'
import { formatDate } from '@/utils/format'

const userStore = useUserStore()
const token = computed(() => userStore.token)

const activeTab = ref('wechat')
const saving = ref(false)
const configList = ref([])

// 系统配置键（不允许删除）
const systemConfigKeys = ['wechat_appid', 'wechat_secret', 'wechat_token', 'site_name', 'site_logo', 'site_copyright']
const isSystemConfig = (key) => systemConfigKeys.includes(key)

// ========== 微信配置 ==========
const wechatFormRef = ref(null)
const wechatForm = reactive({
  appId: '',
  secret: '',
  token: ''
})
const wechatRules = {
  appId: [{ required: true, message: '请输入AppID', trigger: 'blur' }],
  secret: [{ required: true, message: '请输入AppSecret', trigger: 'blur' }]
}

const loadWechatConfig = async () => {
  try {
    const res = await getWechatConfig()
    if (res.code === 0) {
      Object.assign(wechatForm, res.data)
    }
  } catch (error) {
    console.error('获取微信配置失败', error)
  }
}

const saveWechatConfig = async () => {
  await wechatFormRef.value.validate()
  saving.value = true
  try {
    const res = await setWechatConfig(wechatForm)
    if (res.code === 0) {
      ElMessage.success('保存成功')
    }
  } finally {
    saving.value = false
  }
}

const resetWechatForm = () => {
  loadWechatConfig()
}

// ========== 站点配置 ==========
const siteFormRef = ref(null)
const siteForm = reactive({
  name: '',
  logo: '',
  copyright: ''
})
const siteRules = {
  name: [{ required: true, message: '请输入站点名称', trigger: 'blur' }]
}

const loadSiteConfig = async () => {
  try {
    const res = await getSiteConfig()
    if (res.code === 0) {
      Object.assign(siteForm, res.data)
    }
  } catch (error) {
    console.error('获取站点配置失败', error)
  }
}

const saveSiteConfig = async () => {
  await siteFormRef.value.validate()
  saving.value = true
  try {
    const res = await setSiteConfig(siteForm)
    if (res.code === 0) {
      ElMessage.success('保存成功')
    }
  } finally {
    saving.value = false
  }
}

const resetSiteForm = () => {
  loadSiteConfig()
}

const handleLogoSuccess = (response) => {
  if (response.code === 0) {
    siteForm.logo = response.data.file.url
  }
}

// ========== 高级配置 ==========
const configDialogVisible = ref(false)
const configDialogType = ref('add')
const configDialogTitle = computed(() => configDialogType.value === 'add' ? '新增配置' : '编辑配置')
const configFormRef = ref(null)
const configForm = reactive({
  configKey: '',
  configValue: '',
  description: ''
})
const configRules = {
  configKey: [
    { required: true, message: '请输入配置键', trigger: 'blur' },
    { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '只能包含字母、数字和下划线，且以字母或下划线开头', trigger: 'blur' }
  ],
  configValue: [{ required: true, message: '请输入配置值', trigger: 'blur' }]
}

const loadConfigList = async () => {
  try {
    const res = await getConfigList()
    if (res.code === 0) {
      configList.value = res.data || []
    }
  } catch (error) {
    console.error('获取配置列表失败', error)
  }
}

const openConfigDialog = () => {
  configDialogType.value = 'add'
  Object.assign(configForm, {
    configKey: '',
    configValue: '',
    description: ''
  })
  configDialogVisible.value = true
}

const editConfig = (row) => {
  configDialogType.value = 'edit'
  Object.assign(configForm, row)
  configDialogVisible.value = true
}

const saveConfig = async () => {
  await configFormRef.value.validate()
  saving.value = true
  try {
    const res = await setConfig(configForm)
    if (res.code === 0) {
      ElMessage.success('保存成功')
      configDialogVisible.value = false
      loadConfigList()
    }
  } finally {
    saving.value = false
  }
}

const handleDeleteConfig = async (row) => {
  await ElMessageBox.confirm('确定要删除该配置吗？', '提示', { type: 'warning' })
  
  const res = await deleteConfig(row.configKey)
  if (res.code === 0) {
    ElMessage.success('删除成功')
    loadConfigList()
  }
}

// 初始化
onMounted(() => {
  loadWechatConfig()
  loadSiteConfig()
  loadConfigList()
})
</script>

<style scoped lang="scss">
.config-container {
  padding: 20px;
}

.config-form {
  max-width: 600px;
}

.config-tips {
  background-color: #f5f7fa;
  padding: 16px 20px;
  border-radius: 8px;
  
  h4 {
    margin: 0 0 12px;
    color: #303133;
  }
  
  ol {
    margin: 0;
    padding-left: 20px;
    color: #606266;
    line-height: 2;
    
    a {
      color: #409eff;
    }
    
    code {
      background-color: #e6e6e6;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
    }
  }
}

.logo-uploader {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    border-color: #409eff;
  }
}

.logo-preview {
  width: 120px;
  height: 120px;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}
</style>