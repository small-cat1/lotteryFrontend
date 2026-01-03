<!--
    年会统计页面 - Card 组件
-->

<template>
  <div
    class="bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-400 rounded-lg shadow"
    :class="[customClass || '', withoutPadding ? 'p-0' : 'p-4']"
  >
    <div v-if="title" class="flex justify-between items-center mb-3">
      <div class="text-base font-bold flex items-center">
        <el-icon v-if="icon" class="mr-2"><component :is="icon" /></el-icon>
        {{ title }}
      </div>
      <div v-if="showAction" class="text-sm text-blue-500 cursor-pointer">
        <slot name="action">查看更多</slot>
      </div>
    </div>
    <div>
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  showAction: {
    type: Boolean,
    default: false
  },
  customClass: {
    type: String,
    default: ''
  },
  withoutPadding: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped lang="scss"></style>
