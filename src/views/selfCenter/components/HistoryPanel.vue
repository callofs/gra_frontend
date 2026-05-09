<template>
  <FeaturePanelBase
    icon="🕘"
    title="浏览历史"
    subtitle="查看最近访问过的内容记录。"
    description="后续可接入时间线、按模块筛选、批量清空历史记录等功能。"
    :items="items"
  />
</template>

<script setup>
import FeaturePanelBase from './FeaturePanelBase.vue'

const items = [
  { label: '最近访问帖子', value: '24 篇' },
  { label: '最近访问课程', value: '4 节' },
  { label: '最近访问资讯', value: '11 篇' },
  { label: '最后浏览时间', value: '今天 16:08' },
]
</script>
