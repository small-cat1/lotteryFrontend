<!--
    年会统计页面 - 最新弹幕列表组件
-->

<template>
  <div class="danmaku-list">
    <div v-if="data.length === 0" class="empty-state">
      <el-empty description="暂无弹幕" :image-size="60" />
    </div>
    <div v-else class="list-container">
      <div 
        v-for="item in data" 
        :key="item.id" 
        class="danmaku-item"
      >
        <div class="danmaku-user">
          <span class="user-name">{{ item.userName }}</span>
        </div>
        <div class="danmaku-content" :style="{ color: item.color }">
          {{ item.content }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped lang="scss">
.danmaku-list {
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

.list-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.danmaku-item {
  padding: 10px 12px;
  background-color: #f9fafb;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f3f4f6;
  }
}

.danmaku-user {
  margin-bottom: 4px;
}

.user-name {
  font-size: 12px;
  color: #909399;
}

.danmaku-content {
  font-size: 14px;
  line-height: 1.5;
  word-break: break-all;
}
</style>
