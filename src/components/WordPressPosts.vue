<template>
  <div class="posts-container">
    <div class="posts-header">
      <h2>Posts do WordPress</h2>
      <button @click="loadPosts" class="refresh-button" :disabled="loading">
        <span v-if="loading" class="loading-spinner"></span>
        {{ loading ? 'Carregando...' : 'Atualizar' }}
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="loading && posts.length === 0" class="loading-container">
      <div class="loading-spinner large"></div>
      <p>Carregando posts...</p>
    </div>

    <div v-else-if="posts.length === 0" class="empty-state">
      <p>Nenhum post encontrado</p>
    </div>

    <div v-else class="posts-grid">
      <div v-for="post in posts" :key="post.id" class="post-card">
        <div class="post-header">
          <h3 class="post-title">
            <router-link :to="`/posts/${post.id}`" class="post-title-link" v-html="post.title.rendered"></router-link>
          </h3>
          <span class="post-date">{{ formatDate(post.date) }}</span>
        </div>
        
        <div class="post-excerpt" v-html="post.excerpt.rendered"></div>
        
        <div class="post-meta">
          <span class="post-author">Por: {{ post.author_name || 'Autor' }}</span>
          <span class="post-status" :class="post.status">{{ post.status }}</span>
        </div>
        
        <a :href="post.link" target="_blank" class="post-link">
          Ver no WordPress →
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/index.php?rest_route='

const posts = ref([])
const loading = ref(false)
const error = ref(null)

const loadPosts = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await axios.get(`${API_BASE_URL}/wp/v2/posts`)
    posts.value = response.data.map(post => ({
      ...post,
      author_name: post._embedded && post._embedded.author && post._embedded.author[0] && post._embedded.author[0].name || 'Autor'
    }))
  } catch (err) {
    error.value = 'Erro ao carregar posts: ' + (err.response && err.response.data && err.response.data.message || err.message)
    console.error('Erro ao carregar posts:', err)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  loadPosts()
})
</script>

<style scoped>
.posts-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.posts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.posts-header h2 {
  color: #333;
  font-size: 28px;
  font-weight: 600;
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

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.post-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid #f0f0f0;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.post-header {
  margin-bottom: 16px;
}

.post-title {
  color: #333;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.post-title-link {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
}

.post-title-link:hover {
  color: #667eea;
}

.post-date {
  color: #666;
  font-size: 12px;
  font-weight: 500;
}

.post-excerpt {
  color: #555;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
}

.post-excerpt :deep(p) {
  margin: 0;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 12px;
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

.post-link {
  display: inline-block;
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.post-link:hover {
  color: #5a67d8;
}

@media (max-width: 768px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }
  
  .posts-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}
</style> 