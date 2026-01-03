<!--
    年会统计页面 - 摇一摇排行榜组件
-->

<template>
  <div class="shake-ranking">
    <div v-if="data.length === 0" class="empty-state">
      <el-empty description="暂无排行数据" :image-size="60" />
    </div>
    <div v-else class="ranking-list">
      <div 
        v-for="(item, index) in data" 
        :key="item.rank" 
        class="ranking-item"
        :class="{ 'top-three': index < 3 }"
      >
        <div class="ranking-medal" :class="`medal-${index + 1}`">
          <template v-if="index < 3">
            <el-icon :size="20"><Trophy /></el-icon>
          </template>
          <template v-else>
            {{ item.rank }}
          </template>
        </div>
        <div class="ranking-info">
          <div class="ranking-name">{{ item.userName }}</div>
        </div>
        <div class="ranking-score">
          <span class="score-value">{{ item.score }}</span>
          <span class="score-label">次</span>
        </div>
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
.shake-ranking {
  max-height: 200px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #ddd;
    border-radius: 2px;
  }
}

.empty-state {
  padding: 10px 0;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background-color: #f9fafb;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f3f4f6;
  }
  
  &.top-three {
    background: linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%);
  }
}

.ranking-medal {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  background-color: #e5e7eb;
  color: #6b7280;
  
  &.medal-1 {
    background: linear-gradient(135deg, #ffd700 0%, #ffb800 100%);
    color: #fff;
  }
  
  &.medal-2 {
    background: linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%);
    color: #fff;
  }
  
  &.medal-3 {
    background: linear-gradient(135deg, #cd7f32 0%, #b87333 100%);
    color: #fff;
  }
}

.ranking-info {
  flex: 1;
  min-width: 0;
}

.ranking-name {
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ranking-score {
  text-align: right;
}

.score-value {
  font-size: 18px;
  font-weight: bold;
  color: #e6a23c;
}

.score-label {
  font-size: 12px;
  color: #909399;
  margin-left: 2px;
}
</style>
