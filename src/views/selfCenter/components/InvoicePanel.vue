<template>
  <FeaturePanelBase
    icon="🧾"
    title="发票管理"
    subtitle="统一管理开票记录与发票抬头信息。"
    description="后续可接入发票申请、抬头维护、下载电子发票等能力。"
    :items="items"
  />
</template>

<script setup>
import FeaturePanelBase from './FeaturePanelBase.vue'

const items = [
  { label: '发票记录', value: '7 张' },
  { label: '待开票', value: '1 笔' },
  { label: '企业抬头', value: '2 个' },
  { label: '最近开票', value: '上周' },
]
</script>
