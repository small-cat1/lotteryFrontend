<!--
    年会统计页面 - 统计卡片组件
-->

<template>
  <div class="stat-card bg-white dark:bg-slate-900 rounded-lg shadow p-4 relative overflow-hidden">
    <!-- 背景装饰 -->
    <div class="absolute top-0 right-0 w-24 h-24 opacity-10" :style="{ backgroundColor: color }">
      <div class="w-full h-full rounded-full transform translate-x-8 -translate-y-8"></div>
    </div>
    
    <!-- 图标 -->
    <div 
      class="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
      :style="{ backgroundColor: `${color}20` }"
    >
      <el-icon :size="24" :style="{ color }">
        <component :is="icon" />
      </el-icon>
    </div>
    
    <!-- 主数值 -->
    <div class="text-gray-500 dark:text-gray-400 text-sm mb-1">{{ title }}</div>
    <div class="flex items-end gap-2">
      <el-statistic :value="value" class="stat-value" />
      <div v-if="trend" class="trend-tag" :class="trend >= 0 ? 'trend-up' : 'trend-down'">
        <el-icon><component :is="trend >= 0 ? 'TopRight' : 'BottomRight'" /></el-icon>
        {{ Math.abs(trend) }}%
      </div>
    </div>
    
    <!-- 副数值 -->
    <div v-if="subLabel" class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
      <span class="text-gray-400 text-sm">{{ subLabel }}：</span>
      <span class="text-gray-600 dark:text-gray-300 font-medium">{{ subValue }}</span>
    </div>
  </div>
</template>

<script setup>
import { TopRight, BottomRight } from '@element-plus/icons-vue'

defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    default: 0
  },
  subValue: {
    type: Number,
    default: 0
  },
  subLabel: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'DataAnalysis'
  },
  color: {
    type: String,
    default: '#409EFF'
  },
  trend: {
    type: Number,
    default: null
  }
})
</script>

<style scoped lang="scss">
.stat-card {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }
}

.stat-value {
  :deep(.el-statistic__content) {
    font-size: 28px;
    font-weight: bold;
    color: #303133;
  }
}

.trend-tag {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  
  &.trend-up {
    background-color: #f0f9eb;
    color: #67c23a;
  }
  
  &.trend-down {
    background-color: #fef0f0;
    color: #f56c6c;
  }
}
</style>
