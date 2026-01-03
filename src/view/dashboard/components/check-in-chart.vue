<!--
    年会统计页面 - 签到趋势图表
-->

<template>
  <Chart :height="height" :option="chartOption" />
</template>

<script setup>
import { computed } from 'vue'
import Chart from '@/components/charts/index.vue'
import useChartOption from '@/hooks/charts'
import { graphic } from 'echarts'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/pinia'

const appStore = useAppStore()
const { config } = storeToRefs(appStore)

const props = defineProps({
  height: {
    type: String,
    default: '280px'
  },
  data: {
    type: Array,
    default: () => []
  }
})

const dotColor = computed(() => {
  return appStore.isDark ? '#333' : '#E5E8EF'
})

const xAxisData = computed(() => props.data.map(item => item.time))
const seriesData = computed(() => props.data.map(item => item.count))

const { chartOption } = useChartOption(() => {
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#eee',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      },
      formatter(params) {
        const [item] = params
        return `
          <div style="padding: 8px;">
            <div style="font-weight: bold; margin-bottom: 4px;">${item.axisValue}</div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 10px; height: 10px; background: ${config.value.primaryColor}; border-radius: 50%;"></span>
              <span>签到人数：<strong>${item.value}</strong></span>
            </div>
          </div>
        `
      }
    },
    grid: {
      left: '50',
      right: '20',
      top: '30',
      bottom: '40'
    },
    xAxis: {
      type: 'category',
      data: xAxisData.value,
      boundaryGap: false,
      axisLabel: {
        color: '#86909c'
      },
      axisLine: {
        lineStyle: {
          color: dotColor.value
        }
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      name: '人数',
      nameTextStyle: {
        color: '#86909c'
      },
      axisLabel: {
        color: '#86909c'
      },
      axisLine: {
        show: false
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: dotColor.value
        }
      }
    },
    series: [
      {
        name: '签到人数',
        data: seriesData.value,
        type: 'line',
        smooth: true,
        symbolSize: 8,
        symbol: 'circle',
        itemStyle: {
          color: config.value.primaryColor
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            borderWidth: 3,
            borderColor: '#fff',
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            shadowBlur: 10
          }
        },
        lineStyle: {
          width: 3,
          color: new graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: `${config.value.primaryColor}80` },
            { offset: 0.5, color: `${config.value.primaryColor}B3` },
            { offset: 1, color: `${config.value.primaryColor}` }
          ])
        },
        areaStyle: {
          opacity: 0.8,
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${config.value.primaryColor}40` },
            { offset: 1, color: `${config.value.primaryColor}05` }
          ])
        }
      }
    ]
  }
})
</script>

<style scoped lang="scss"></style>
