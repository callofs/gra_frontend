<template>
  <div class="author" :data-user-id="userId">
    <button class="avatar avatar-button" type="button" :disabled="anonymous || !userId" @click="goUserDetail">
      <span v-if="anonymous">匿</span>
      <img v-else-if="avatar" :src="avatar" alt="avatar" />
      <span v-else>{{ avatarText }}</span>
    </button>
    <div class="author-meta">
      <div class="author-name">{{ displayName }}</div>
      <div v-if="subtitle" class="author-sub">{{ subtitle }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  userId: {
    type: [String, Number],
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  nickname: {
    type: String,
    default: '',
  },
  anonymous: {
    type: Boolean,
    default: false,
  },
  subtitle: {
    type: String,
    default: '',
  },
})

const displayName = computed(() => {
  if (props.anonymous) return '匿名用户'
  return props.nickname || '未知用户'
})

const avatarText = computed(() => {
  return String(displayName.value || '').slice(0, 1)
})

function goUserDetail() {
  if (props.anonymous || !props.userId) return

  router.push({
    name: 'user-detail',
    params: {
      userId: props.userId,
    },
    query: {
      nickname: props.nickname || '',
      avatar: props.avatar || '',
    },
  })
}
</script>

<style scoped>
.author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(59, 130, 246, 0.12);
  color: rgba(59, 130, 246, 1);
  display: grid;
  place-items: center;
  font-weight: 900;
  flex-shrink: 0;
}

.avatar-button {
  border: none;
  padding: 0;
  cursor: pointer;
}

.avatar-button:disabled {
  cursor: default;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.author-name {
  font-weight: 900;
  color: rgba(30, 41, 59, 1);
}

.author-sub {
  margin-top: 2px;
  font-size: 12px;
  color: rgba(100, 116, 139, 1);
}
</style>
