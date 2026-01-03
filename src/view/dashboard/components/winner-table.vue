<!--
    年会统计页面 - 最新中奖表格
-->

<template>
  <div class="winner-table">
    <div v-if="data.length === 0" class="empty-state">
      <el-empty description="暂无中奖记录" :image-size="80" />
    </div>
    <div v-else class="winner-list">
      <div 
        v-for="(item, index) in data" 
        :key="item.id" 
        class="winner-item"
        :class="{ 'first': index === 0 }"
      >
        <div class="winner-rank" :class="`rank-${index + 1}`">
          {{ index + 1 }}
        </div>
        <el-avatar :src="item.avatar" :size="36" class="winner-avatar">
          {{ item.userName?.charAt(0) }}
        </el-avatar>
        <div class="winner-info">
          <div class="winner-name">{{ item.userName }}</div>
          <div class="winner-prize">
            <el-icon><Trophy /></el-icon>
            {{ item.prizeName }}
          </div>
        </div>
        <div class="winner-time">{{ item.time }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Trophy } from '@element-plus/icons-vue'

defineProps({
  data: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped lang="scss">
.winner-table {
  max-height: 320px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #ddd;
    border-radius: 3px;
  }
}

.empty-state {
  padding: 20px 0;
}

.winner-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.winner-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f3f4f6;
    transform: translateX(4px);
  }
  
  &.first {
    background: linear-gradient(135deg, #fff7e6 0%, #fffbe6 100%);
    border: 1px solid #ffd666;
  }
}

.winner-rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  background-color: #e5e7eb;
  color: #6b7280;
  
  &.rank-1 {
    background: linear-gradient(135deg, #ffd700 0%, #ffb800 100%);
    color: #fff;
  }
  
  &.rank-2 {
    background: linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%);
    color: #fff;
  }
  
  &.rank-3 {
    background: linear-gradient(135deg, #cd7f32 0%, #b87333 100%);
    color: #fff;
  }
}

.winner-avatar {
  flex-shrink: 0;
  background-color: #409eff;
  color: #fff;
}

.winner-info {
  flex: 1;
  min-width: 0;
}

.winner-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.winner-prize {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #e6a23c;
  
  .el-icon {
    font-size: 14px;
  }
}

.winner-time {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}
</style>
