<template>
  <FeaturePanelBase
    icon="🧩"
    title="模块管理"
    subtitle="管理员维护系统模块、分类与展示配置。"
    description="后续可在这里接入模块开关、字典项维护、排序配置与权限管理。"
    :items="items"
  />
</template>

<script setup>
import FeaturePanelBase from './FeaturePanelBase.vue'

const items = [
  { label: '启用模块', value: '8 个' },
  { label: '待调整配置', value: '2 项' },
  { label: '分类字典', value: '16 组' },
  { label: '最近修改', value: '今天' },
]
</script>
