<template>
  <div class="flex items-center mx-4 gap-4">
    <el-tooltip class="" effect="dark" content="搜索" placement="bottom">
      <span
        class="w-8 h-8 p-2 rounded-full flex items-center justify-center shadow border border-gray-200 dark:border-gray-600 cursor-pointer border-solid"
      >
        <el-icon @click="handleCommand">
          <Search />
        </el-icon>
      </span>
    </el-tooltip>

    <el-tooltip class="" effect="dark" content="刷新" placement="bottom">
      <span
        class="w-8 h-8 p-2 rounded-full flex items-center justify-center shadow border border-gray-200 dark:border-gray-600 cursor-pointer border-solid"
      >
        <el-icon
          :class="showRefreshAnmite ? 'animate-spin' : ''"
          @click="toggleRefresh"
        >
          <Refresh />
        </el-icon>
      </span>
    </el-tooltip>

    <command-menu ref="command" />
  </div>
</template>

<script setup>
  import CommandMenu from '@/components/commandMenu/index.vue'
  import { useAppStore } from '@/pinia'
  import { emitter } from '@/utils/bus.js'
  import { ref } from 'vue'

  const appStore = useAppStore()
  const showRefreshAnmite = ref(false)
  const toggleRefresh = () => {
    showRefreshAnmite.value = true
    emitter.emit('reload')
    setTimeout(() => {
      showRefreshAnmite.value = false
    }, 1000)
  }

  const first = ref('')
  const command = ref()

  const handleCommand = () => {
    command.value.open()
  }
  const initPage = () => {
    // 判断当前用户的操作系统
    if (window.localStorage.getItem('osType') === 'WIN') {
      first.value = 'Ctrl'
    } else {
      first.value = '⌘'
    }
    // 当用户同时按下ctrl和k键的时候
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'k') {
        // 阻止浏览器默认事件
        e.preventDefault()
        handleCommand()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
  }

  initPage()
</script>

<style scoped lang="scss"></style>
