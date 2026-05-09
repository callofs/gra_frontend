<template>
  <FeaturePanelBase
    icon="❓"
    title="帮助中心"
    subtitle="查找常见问题、使用说明与服务支持。"
    description="后续可接入 FAQ 列表、搜索、客服入口与问题分类导航。"
    :items="items"
  />
</template>

<script setup>
import FeaturePanelBase from './FeaturePanelBase.vue'

const items = [
  { label: '热门问题', value: '32 条' },
  { label: '新手指南', value: '6 篇' },
  { label: '操作教程', value: '14 篇' },
  { label: '在线客服', value: '工作日可用' },
]
</script>
