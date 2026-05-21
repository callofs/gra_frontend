<template>
  <div class="comment-node" :style="{ marginLeft: `${depth * 18}px` }">
    <div class="comment-main">
      <div class="avatar">
        <span v-if="isAnonymous">匿</span>
        <img v-else-if="avatarUrl" :src="avatarUrl" alt="avatar" />
        <span v-else>{{ String(authorName || '').slice(0, 1) }}</span>
      </div>

      <div class="comment-content">
        <div class="comment-top">
          <div class="author">{{ authorName }}</div>
          <div class="time" v-if="commentTime">{{ commentTime }}</div>
        </div>

        <div class="text">{{ commentText }}</div>

        <div class="actions">
          <el-button text size="small" :loading="likeLoading" @click="toggleLike">
            {{ liked ? '已赞' : '点赞' }} {{ likeCount }}
          </el-button>
          <el-button text size="small" @click="toggleReply">回复</el-button>
          <el-button
            v-if="!repliesLoaded"
            text
            size="small"
            :loading="repliesLoading"
            @click="loadReplies"
          >
            展开回复
          </el-button>
          <el-button v-else text size="small" @click="toggleRepliesVisible">
            {{ repliesVisible ? '收起回复' : '展开回复' }}
          </el-button>
        </div>

        <div v-if="replyVisible" class="reply-box">
          <el-input
            v-model="replyText"
            type="textarea"
            :rows="3"
            placeholder="写下你的回复..."
            maxlength="500"
            show-word-limit
          />
          <div class="reply-actions">
            <el-button size="small" @click="toggleReply">取消</el-button>
            <el-button size="small" type="primary" :loading="replySubmitting" @click="submitReply">发送</el-button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="repliesVisible && replies.length" class="replies">
      <ForumCommentNode
        v-for="r in replies"
        :key="r.id"
        :post-id="postId"
        :comment="r"
        :depth="depth + 1"
        @refresh="$emit('refresh')"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getReplies, makeComment } from '@/api/forumComment.js'
import { getLikeStatus, like, unlike } from '@/api/like.js'

defineOptions({ name: 'ForumCommentNode' })

const props = defineProps({
  postId: {
    type: [String, Number],
    required: true,
  },
  comment: {
    type: Object,
    required: true,
  },
  depth: {
    type: Number,
    default: 0,
  },
})

defineEmits(['refresh'])

const replyVisible = ref(false)
const replyText = ref('')
const replySubmitting = ref(false)
const liked = ref(false)
const likeLoading = ref(false)

const replies = ref([])
const repliesLoading = ref(false)
const repliesLoaded = ref(false)
const repliesVisible = ref(false)

const isAnonymous = computed(() => props.comment?.isAnonymous === 1 || props.comment?.isAnonymous === true)

const authorName = computed(() => {
  if (!props.comment) return ''
  return isAnonymous.value ? '匿名用户' : props.comment.authorNickname || props.comment.nickname || `用户${props.comment.userId ?? ''}`
})

const avatarUrl = computed(() => {
  const avatar = props.comment?.authorAvatar || props.comment?.avatar
  if (!avatar || typeof avatar !== 'string') return ''

  const trimmed = avatar.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('data:image/')) return trimmed
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) return trimmed
  return `data:image/png;base64,${trimmed}`
})

const commentText = computed(() => props.comment?.content || props.comment?.text || '')

const commentTime = computed(() => {
  const raw = props.comment?.createTime || props.comment?.time
  if (!raw) return ''
  return String(raw).replace('T', ' ').slice(0, 16)
})

const likeCount = computed(() => {
  return Number(props.comment?.likeCount || 0)
})

async function fetchLikeStatus() {
  if (!props.comment?.id) {
    liked.value = false
    return
  }

  try {
    liked.value = Boolean(await getLikeStatus(2, props.comment.id))
  } catch (error) {
    liked.value = false
  }
}

async function toggleLike() {
  if (!props.comment?.id || likeLoading.value) return

  likeLoading.value = true
  try {
    if (liked.value) {
      await unlike({ likeType: 2, relatedId: props.comment.id })
      liked.value = false
      props.comment.likeCount = Math.max(0, Number(props.comment?.likeCount || 0) - 1)
      ElMessage.success('已取消点赞')
    } else {
      await like({ likeType: 2, relatedId: props.comment.id })
      liked.value = true
      props.comment.likeCount = Number(props.comment?.likeCount || 0) + 1
      ElMessage.success('点赞成功')
    }
  } catch (error) {
    ElMessage.error(error?.message || (liked.value ? '取消点赞失败' : '点赞失败'))
  } finally {
    likeLoading.value = false
  }
}

function toggleReply() {
  replyVisible.value = !replyVisible.value
  if (!replyVisible.value) replyText.value = ''
}

async function submitReply() {
  const text = String(replyText.value || '').trim()
  if (!text) {
    ElMessage.warning('请输入回复内容')
    return
  }

  if (replySubmitting.value) return

  replySubmitting.value = true
  try {
    await makeComment({
      postId: props.postId,
      content: text,
      parentCommentId: props.comment.id,
      isAnonymous: 0,
    })

    ElMessage.success('回复成功')
    replyText.value = ''
    replyVisible.value = false

    // 回复成功后刷新该节点的回复列表
    repliesLoaded.value = false
    await loadReplies(true)
  } catch (error) {
    ElMessage.error(error?.message || '回复失败')
  } finally {
    replySubmitting.value = false
  }
}

async function loadReplies(force = false) {
  if (repliesLoading.value) return
  if (repliesLoaded.value && !force) {
    repliesVisible.value = true
    return
  }

  repliesLoading.value = true
  try {
    const res = await getReplies(props.comment.id)
    const list = Array.isArray(res) ? res : Array.isArray(res?.records) ? res.records : Array.isArray(res?.data) ? res.data : []
    replies.value = list
    repliesLoaded.value = true
    repliesVisible.value = true
  } catch (error) {
    ElMessage.error(error?.message || '获取回复失败')
  } finally {
    repliesLoading.value = false
  }
}

function toggleRepliesVisible() {
  repliesVisible.value = !repliesVisible.value
}

watch(
  () => props.comment?.id,
  () => {
    fetchLikeStatus()
  },
  { immediate: true }
)

onMounted(fetchLikeStatus)
</script>

<style scoped>
.comment-node {
  padding: 10px 0;
}

.comment-main {
  display: flex;
  gap: 10px;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(59, 130, 246, 0.12);
  color: rgba(59, 130, 246, 1);
  display: grid;
  place-items: center;
  font-weight: 900;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.comment-content {
  flex: 1;
}

.comment-top {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.author {
  font-weight: 700;
  color: #0f172a;
}

.time {
  font-size: 12px;
  color: #64748b;
}

.text {
  margin-top: 6px;
  line-height: 1.7;
  color: #334155;
  white-space: pre-wrap;
}

.actions {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.reply-box {
  margin-top: 10px;
}

.reply-actions {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.replies {
  margin-top: 6px;
}
</style>
