<script setup>
// 顶部标题栏：系统名称 + 告警灯 + 时间范围切换插槽 + 时钟
import { ref, onMounted, onBeforeUnmount } from 'vue'
import dayjs from 'dayjs'

defineProps({
  alarm: { type: Boolean, default: false },
  focus: { type: String, default: '' },
  updateTime: { type: String, default: '' }
})

const now = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'))
const weekName = ref(['日', '一', '二', '三', '四', '五', '六'][dayjs().day()])

let timer = null
onMounted(() => {
  timer = setInterval(() => {
    now.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
  }, 1000)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <header class="screen-header">
    <div class="header-left">
      <span class="alarm-dot" :class="{ on: alarm }" title="健康或事件告警"></span>
      <span class="header-title">社区养老服务与健康监测可视化系统</span>
    </div>

    <div class="header-center">
      <slot name="tabs"></slot>
    </div>

    <div class="header-right">
      <span v-if="focus" class="focus-tag">聚焦：{{ focus }}</span>
      <span v-if="updateTime" class="update-time">数据更新 {{ updateTime }}</span>
      <span class="header-time">星期{{ weekName }} {{ now }}</span>
    </div>
  </header>
</template>
