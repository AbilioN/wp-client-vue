<template>
  <div class="auth-request-container">
    <div class="auth-request-card">
      <h3>Exemplo de Requisição Autenticada</h3>
      
      <div class="auth-status">
        <div class="status-item">
          <label>Status de Autenticação:</label>
          <span :class="authStore.isLoggedIn ? 'status-success' : 'status-error'">
            {{ authStore.isLoggedIn ? 'Autenticado' : 'Não autenticado' }}
          </span>
        </div>
        
        <div class="status-item">
          <label>Token:</label>
          <span class="token-preview">{{ tokenPreview }}</span>
        </div>
        
        <div class="status-item">
          <label>Usuário:</label>
          <span>{{ authStore.userDisplayName || 'N/A' }}</span>
        </div>
      </div>

      <div class="request-examples">
        <h4>Exemplos de Requisições</h4>
        
        <div class="example-item">
          <h5>1. Buscar Posts Autenticados</h5>
          <p>Esta requisição usa o token automaticamente configurado no axios:</p>
          <pre><code>axios.get('http://localhost:8080/index.php?rest_route=/wp/v2/posts')</code></pre>
          <button @click="fetchPosts" :disabled="loading" class="example-button">
            {{ loading ? 'Carregando...' : 'Testar Requisição' }}
          </button>
        </div>

        <div class="example-item">
          <h5>2. Buscar Usuário Atual</h5>
          <p>Requisição para obter informações do usuário logado:</p>
          <pre><code>axios.get('http://localhost:8080/index.php?rest_route=/wp/v2/users/me')</code></pre>
          <button @click="fetchUserInfo" :disabled="loading" class="example-button">
            {{ loading ? 'Carregando...' : 'Buscar Dados do Usuário' }}
          </button>
        </div>

        <div class="example-item">
          <h5>3. Criar Post (Exemplo)</h5>
          <p>Exemplo de como criar um post usando o token:</p>
          <pre><code>axios.post('http://localhost:8080/index.php?rest_route=/wp/v2/posts', {
  title: 'Novo Post',
  content: 'Conteúdo do post',
  status: 'draft'
})</code></pre>
          <button @click="createPost" :disabled="loading" class="example-button">
            {{ loading ? 'Criando...' : 'Criar Post de Exemplo' }}
          </button>
        </div>
      </div>

      <div v-if="response" class="response-section">
        <h4>Resposta da Última Requisição</h4>
        <pre class="response-data">{{ JSON.stringify(response, null, 2) }}</pre>
      </div>

      <div v-if="error" class="error-section">
        <h4>Erro na Requisição</h4>
        <pre class="error-data">{{ error }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const authStore = useAuthStore()
const loading = ref(false)
const response = ref(null)
const error = ref(null)

const tokenPreview = computed(() => {
  const token = authStore.token
  if (!token) return 'Nenhum token'
  return `${token.substring(0, 20)}...${token.substring(token.length - 10)}`
})

const API_BASE_URL = 'http://localhost:8080/index.php?rest_route='

const makeRequest = async (requestFn) => {
  if (!authStore.isLoggedIn) {
    error.value = 'Você precisa estar logado para fazer requisições autenticadas'
    return
  }

  loading.value = true
  error.value = null
  response.value = null

  try {
    const result = await requestFn()
    response.value = result
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Erro na requisição'
    console.error('Erro na requisição:', err)
  } finally {
    loading.value = false
  }
}

const fetchPosts = async () => {
  await makeRequest(async () => {
    const response = await axios.get(`${API_BASE_URL}/wp/v2/posts`)
    return {
      type: 'posts',
      count: response.data.length,
      posts: response.data.slice(0, 3) // Mostrar apenas os 3 primeiros
    }
  })
}

const fetchUserInfo = async () => {
  await makeRequest(async () => {
    const response = await axios.get(`${API_BASE_URL}/wp/v2/users/me`)
    return {
      type: 'user_info',
      user: response.data
    }
  })
}

const createPost = async () => {
  await makeRequest(async () => {
    const postData = {
      title: 'Post de Exemplo via API',
      content: 'Este é um post criado através da API autenticada.',
      status: 'draft',
      excerpt: 'Exemplo de criação de post via API'
    }
    
    const response = await axios.post(`${API_BASE_URL}/wp/v2/posts`, postData)
    return {
      type: 'post_created',
      post: response.data
    }
  })
}
</script>

<style scoped>
.auth-request-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.auth-request-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

.auth-request-card h3 {
  color: #333;
  margin: 0 0 24px 0;
  font-size: 24px;
  font-weight: 600;
}

.auth-status {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 32px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.status-item:last-child {
  margin-bottom: 0;
}

.status-item label {
  color: #666;
  font-weight: 500;
  font-size: 14px;
}

.status-item span {
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.status-success {
  color: #38a169 !important;
}

.status-error {
  color: #e53e3e !important;
}

.token-preview {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  background: #e2e8f0;
  padding: 4px 8px;
  border-radius: 4px;
}

.request-examples {
  margin-bottom: 32px;
}

.request-examples h4 {
  color: #333;
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
}

.example-item {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.example-item h5 {
  color: #333;
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
}

.example-item p {
  color: #666;
  margin: 0 0 12px 0;
  font-size: 14px;
}

.example-item pre {
  background: #1f2937;
  color: #f9fafb;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  overflow-x: auto;
  margin: 0 0 12px 0;
}

.example-item code {
  font-family: 'Courier New', monospace;
}

.example-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.example-button:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-1px);
}

.example-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.response-section,
.error-section {
  border-top: 1px solid #e2e8f0;
  padding-top: 24px;
}

.response-section h4,
.error-section h4 {
  color: #333;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
}

.response-data,
.error-data {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 16px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.error-data {
  background: #fee;
  border-color: #feb2b2;
  color: #c53030;
}

@media (max-width: 768px) {
  .auth-request-container {
    padding: 20px 10px;
  }
  
  .auth-request-card {
    padding: 20px;
  }
  
  .status-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style> 