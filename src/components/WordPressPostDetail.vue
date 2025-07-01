<template>
  <div class="post-detail-container">
    <div class="post-detail-header">
      <button @click="goBack" class="back-button">
        ← Voltar aos Posts
      </button>
      <button @click="loadPost" class="refresh-button" :disabled="loading">
        <span v-if="loading" class="loading-spinner"></span>
        {{ loading ? 'Carregando...' : 'Atualizar' }}
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="loading && !post" class="loading-container">
      <div class="loading-spinner large"></div>
      <p>Carregando post...</p>
    </div>

    <div v-else-if="!post" class="empty-state">
      <p>Post não encontrado</p>
    </div>

    <div v-else class="post-detail-content">
      <article class="post-article">
        <header class="post-header">
          <h1 class="post-title" v-html="post.title.rendered"></h1>
          <div class="post-meta">
            <span class="post-date">{{ formatDate(post.date) }}</span>
            <span class="post-author">Por: {{ post.author_name || 'Autor' }}</span>
            <span class="post-status" :class="post.status">{{ post.status }}</span>
          </div>
        </header>
        
        <div class="post-content" v-html="post.content.rendered"></div>
        
        <footer class="post-footer">
          <a :href="post.link" target="_blank" class="external-link">
            Ver no WordPress →
          </a>
        </footer>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/index.php?rest_route='

const route = useRoute()
const router = useRouter()

const post = ref(null)
const loading = ref(false)
const error = ref(null)

const loadPost = async () => {
  const postId = route.params.id
  
  if (!postId) {
    error.value = 'ID do post não fornecido'
    return
  }

  loading.value = true
  error.value = null
  
  try {
    const response = await axios.get(`${API_BASE_URL}/wp/v2/posts/${postId}`)
    post.value = {
      ...response.data,
      author_name: response.data._embedded && 
                   response.data._embedded.author && 
                   response.data._embedded.author[0] && 
                   response.data._embedded.author[0].name || 'Autor'
    }
  } catch (err) {
    if (err.response && err.response.status === 404) {
      error.value = 'Post não encontrado'
    } else {
      error.value = 'Erro ao carregar post: ' + (err.response && err.response.data && err.response.data.message || err.message)
    }
    console.error('Erro ao carregar post:', err)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const goBack = () => {
  router.push('/posts')
}

onMounted(() => {
  loadPost()
})
</script>

<style scoped>
.post-detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.post-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.back-button {
  background: #6b7280;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
}

.back-button:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

.refresh-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.refresh-button:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-1px);
}

.refresh-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  background-color: #fee;
  color: #c53030;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  border: 1px solid #feb2b2;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #666;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner.large {
  width: 40px;
  height: 40px;
  border-width: 3px;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.post-detail-content {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

.post-article {
  max-width: 100%;
}

.post-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.post-title {
  color: #1f2937;
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 16px 0;
  line-height: 1.3;
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  font-size: 14px;
}

.post-date {
  color: #6b7280;
  font-weight: 500;
}

.post-author {
  color: #667eea;
  font-weight: 500;
}

.post-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.post-status.publish {
  background: #c6f6d5;
  color: #22543d;
}

.post-status.draft {
  background: #fed7d7;
  color: #742a2a;
}

.post-status.private {
  background: #e2e8f0;
  color: #2d3748;
}

.post-content {
  color: #374151;
  font-size: 16px;
  line-height: 1.7;
  margin-bottom: 32px;
}

.post-content :deep(h1),
.post-content :deep(h2),
.post-content :deep(h3),
.post-content :deep(h4),
.post-content :deep(h5),
.post-content :deep(h6) {
  color: #1f2937;
  margin-top: 32px;
  margin-bottom: 16px;
  font-weight: 600;
}

.post-content :deep(h1) { font-size: 28px; }
.post-content :deep(h2) { font-size: 24px; }
.post-content :deep(h3) { font-size: 20px; }
.post-content :deep(h4) { font-size: 18px; }
.post-content :deep(h5) { font-size: 16px; }
.post-content :deep(h6) { font-size: 14px; }

.post-content :deep(p) {
  margin-bottom: 16px;
}

.post-content :deep(ul),
.post-content :deep(ol) {
  margin-bottom: 16px;
  padding-left: 24px;
}

.post-content :deep(li) {
  margin-bottom: 8px;
}

.post-content :deep(blockquote) {
  border-left: 4px solid #667eea;
  padding-left: 16px;
  margin: 24px 0;
  font-style: italic;
  color: #6b7280;
}

.post-content :deep(code) {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
}

.post-content :deep(pre) {
  background: #1f2937;
  color: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 24px 0;
}

.post-content :deep(pre code) {
  background: none;
  padding: 0;
  color: inherit;
}

.post-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 16px 0;
}

.post-footer {
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}

.external-link {
  display: inline-block;
  color: #667eea;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  padding: 12px 24px;
  border: 2px solid #667eea;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.external-link:hover {
  background: #667eea;
  color: white;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .post-detail-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .post-title {
    font-size: 24px;
  }
  
  .post-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .post-detail-content {
    padding: 20px;
  }
}
</style> 