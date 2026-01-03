<!--
    年会统计页面 - 奖品发放统计图表
-->

<template>
  <Chart :height="height" :option="chartOption" />
</template>

<script setup>
import { computed } from 'vue'
import Chart from '@/components/charts/index.vue'
import useChartOption from '@/hooks/charts'

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

const colors = ['#F56C6C', '#E6A23C', '#67C23A', '#409EFF', '#909399']

const { chartOption } = useChartOption(() => {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#eee',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      },
      formatter(params) {
        const [total, used] = params
        const percent = total.value > 0 ? Math.round((used.value / total.value) * 100) : 0
        return `
          <div style="padding: 8px;">
            <div style="font-weight: bold; margin-bottom: 8px;">${total.name}</div>
            <div style="margin-bottom: 4px;">总数量：<strong>${total.value}</strong></div>
            <div style="margin-bottom: 4px;">已发放：<strong>${used.value}</strong></div>
            <div>发放率：<strong>${percent}%</strong></div>
          </div>
        `
      }
    },
    legend: {
      data: ['总数量', '已发放'],
      bottom: 0
    },
    grid: {
      left: '15',
      right: '15',
      top: '20',
      bottom: '40',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.data.map(item => item.name),
      axisLabel: {
        color: '#86909c',
        interval: 0
      },
      axisLine: {
        lineStyle: {
          color: '#E5E8EF'
        }
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#86909c'
      },
      axisLine: {
        show: false
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#E5E8EF'
        }
      }
    },
    series: [
      {
        name: '总数量',
        type: 'bar',
        barWidth: '35%',
        barGap: '-100%',
        itemStyle: {
          color: '#E5E8EF',
          borderRadius: [4, 4, 0, 0]
        },
        data: props.data.map(item => item.total),
        z: 1
      },
      {
        name: '已发放',
        type: 'bar',
        barWidth: '35%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0]
        },
        data: props.data.map((item, index) => ({
          value: item.used,
          itemStyle: {
            color: colors[index % colors.length]
          }
        })),
        z: 2
      }
    ]
  }
})
</script>

<style scoped lang="scss"></style>
