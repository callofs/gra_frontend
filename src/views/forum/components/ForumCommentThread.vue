<template>
  <div class="comment-thread">
    <div class="thread-title">评论</div>

    <div class="new-comment">
      <el-input
        v-model="newText"
        type="textarea"
        :rows="3"
        placeholder="写下你的评论..."
        maxlength="500"
        show-word-limit
      />
      <div class="new-actions">
        <el-button type="primary" :loading="submitting" @click="submitComment">发表评论</el-button>
      </div>
    </div>

    <div v-if="loading" class="state">加载中...</div>
    <div v-else-if="comments.length === 0" class="state">暂无评论</div>

    <div v-else class="comment-list">
      <ForumCommentNode
        v-for="c in comments"
        :key="c.id"
        :post-id="postId"
        :comment="c"
        :depth="0"
        @refresh="fetchComments"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getComment, makeComment } from '@/api/forumComment.js'
import ForumCommentNode from '@/views/forum/components/ForumCommentNode.vue'

const props = defineProps({
  postId: {
    type: [String, Number],
    required: true,
  },
})

const loading = ref(false)
const submitting = ref(false)
const comments = ref([])

const newText = ref('')

async function fetchComments() {
  if (!props.postId) return

  loading.value = true
  try {
    const res = await getComment(props.postId)
    const list =
      Array.isArray(res) ? res : Array.isArray(res?.records) ? res.records : Array.isArray(res?.data) ? res.data : []
    comments.value = list
  } catch (error) {
    ElMessage.error(error?.message || '获取评论失败')
    comments.value = []
  } finally {
    loading.value = false
  }
}

async function submitComment() {
  const text = String(newText.value || '').trim()
  if (!text) {
    ElMessage.warning('请输入评论内容')
    return
  }

  if (submitting.value) return

  submitting.value = true
  try {
    await makeComment({
      postId: props.postId,
      content: text,
      isAnonymous: 0,
    })
    ElMessage.success('评论成功')
    newText.value = ''
    await fetchComments()
  } catch (error) {
    ElMessage.error(error?.message || '评论失败')
  } finally {
    submitting.value = false
  }
}

watch(
  () => props.postId,
  () => {
    fetchComments()
  }
)

onMounted(fetchComments)
</script>

<style scoped>
.comment-thread {
  margin-top: 18px;
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 1);
  border-radius: 14px;
  padding: 16px;
}

.thread-title {
  font-weight: 900;
  color: rgba(30, 41, 59, 1);
}

.new-comment {
  margin-top: 12px;
}

.new-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.state {
  margin-top: 12px;
  color: rgba(100, 116, 139, 1);
}

.comment-list {
  margin-top: 10px;
}
</style>
