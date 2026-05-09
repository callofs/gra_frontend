<template>
  <FeaturePanelBase
    icon="⬇"
    title="我的下载"
    subtitle="管理你下载过的资料与文件。"
    description="后续可接入下载记录、重新下载、文件过期状态等功能。"
    :items="items"
  />
</template>

<script setup>
import FeaturePanelBase from './FeaturePanelBase.vue'

const items = [
  { label: '资料文件', value: '9 个' },
  { label: '课程附件', value: '5 个' },
  { label: '本月下载', value: '3 次' },
  { label: '最近下载', value: '昨天' },
]
</script>
