<template>
  <FeaturePanelBase
    icon="⭐"
    title="我的收藏"
    subtitle="集中查看你收藏的帖子、课程与资料。"
    description="后续可接入真实收藏列表、分类筛选、取消收藏等功能。"
    :items="items"
  />
</template>

<script setup>
import FeaturePanelBase from './FeaturePanelBase.vue'

const items = [
  { label: '收藏帖子', value: '18 篇' },
  { label: '收藏课程', value: '6 节' },
  { label: '收藏话题', value: '12 个' },
  { label: '最近收藏', value: '今天' },
]
</script>
