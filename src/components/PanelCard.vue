<script setup>
// 大屏卡片容器：标题栏 + 内容插槽，统一样式与光效
defineProps({
  title: { type: String, default: '' },
  accent: { type: String, default: '#00d4ff' }
})
</script>

<template>
  <section class="panel-card" :style="{ '--accent': accent }">
    <div class="panel-title">
      <i></i>
      <span>{{ title }}</span>
      <slot name="extra"></slot>
    </div>
    <div class="panel-body">
      <slot></slot>
    </div>
  </section>
</template>
