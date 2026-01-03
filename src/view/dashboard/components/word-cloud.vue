<!--
    年会统计页面 - 弹幕热词组件
-->

<template>
  <div class="word-cloud" :style="{ height }">
    <div v-if="data.length === 0" class="empty-state">
      <el-empty description="暂无弹幕数据" :image-size="60" />
    </div>
    <div v-else class="word-list">
      <span
        v-for="(item, index) in data"
        :key="index"
        class="word-item"
        :style="getWordStyle(item, index)"
      >
        {{ item.name }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  height: {
    type: String,
    default: '200px'
  },
  data: {
    type: Array,
    default: () => []
  }
})

const colors = [
  '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399',
  '#00CED1', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'
]

const maxValue = computed(() => {
  return Math.max(...props.data.map(item => item.value), 1)
})

const getWordStyle = (item, index) => {
  const ratio = item.value / maxValue.value
  const fontSize = Math.max(12, Math.min(28, 12 + ratio * 16))
  const opacity = Math.max(0.6, ratio)
  
  return {
    fontSize: `${fontSize}px`,
    color: colors[index % colors.length],
    opacity,
    fontWeight: ratio > 0.7 ? 'bold' : 'normal'
  }
}
</script>

<style scoped lang="scss">
.word-cloud {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  width: 100%;
}

.word-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 10px;
}

.word-item {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.02);
  cursor: default;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    background-color: rgba(0, 0, 0, 0.05);
  }
}
</style>
