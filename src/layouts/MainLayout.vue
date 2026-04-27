<template>
  <div class="app-shell">
    <HeaderBar />

    <main class="content" :class="{ home: isHome }">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import HeaderBar from '@/components/headerBar.vue'

const route = useRoute()

const isHome = computed(() => route.name === 'home')
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f6f7fb;
}

.content {
  width: min(1100px, calc(100% - 28px));
  margin: 18px auto;
}

.content.home {
  width: 100%;
  margin: 0;
}
</style>
