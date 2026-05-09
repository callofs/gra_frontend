<template>
  <FeaturePanelBase
    icon="🔔"
    title="消息通知"
    subtitle="查看系统提醒、互动消息与服务通知。"
    description="后续可以在这里接入站内信、评论回复、系统通知等真实消息列表。"
    :items="items"
  />
</template>

<script setup>
import FeaturePanelBase from './FeaturePanelBase.vue'

const items = [
  { label: '未读消息', value: '3 条' },
  { label: '系统通知', value: '12 条' },
  { label: '互动提醒', value: '8 条' },
  { label: '最近更新', value: '今天 14:20' },
]
</script>
