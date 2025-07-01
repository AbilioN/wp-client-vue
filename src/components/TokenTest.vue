<template>
  <div class="token-test-container">
    <div class="token-test-card">
      <h3>Teste de Validação de Token</h3>
      
      <div class="auth-status">
        <div class="status-item">
          <label>Token no Store:</label>
          <span :class="authStore.token ? 'status-success' : 'status-error'">
            {{ authStore.token ? 'Presente' : 'Ausente' }}
          </span>
        </div>
        
        <div class="status-item">
          <label>Token no localStorage:</label>
          <span :class="localStorageToken ? 'status-success' : 'status-error'">
            {{ localStorageToken ? 'Presente' : 'Ausente' }}
          </span>
        </div>
        
        <div class="status-item">
          <label>Header Authorization:</label>
          <span :class="hasAuthHeader ? 'status-success' : 'status-error'">
            {{ hasAuthHeader ? 'Configurado' : 'Não configurado' }}
          </span>
        </div>
        
        <div class="status-item">
          <label>Status de Autenticação:</label>
          <span :class="authStore.isAuthenticated ? 'status-success' : 'status-error'">
            {{ authStore.isAuthenticated ? 'Autenticado' : 'Não autenticado' }}
          </span>
        </div>
      </div>

      <div class="token-preview">
        <h4>Preview do Token</h4>
        <pre>{{ tokenPreview }}</pre>
      </div>

      <div class="test-actions">
        <button @click="testValidation" :disabled="loading" class="test-button">
          {{ loading ? 'Testando...' : 'Testar Validação' }}
        </button>
        
        <button @click="testUserInfo" :disabled="loading" class="test-button">
          {{ loading ? 'Testando...' : 'Testar /users/me' }}
        </button>
        
        <button @click="refreshToken" :disabled="loading" class="test-button">
          {{ loading ? 'Renovando...' : 'Renovar Token' }}
        </button>
        
        <button @click="clearToken" class="test-button danger">
          Limpar Token
        </button>
      </div>

      <div v-if="testResult" class="test-result">
        <h4>Resultado do Teste</h4>
        <pre>{{ JSON.stringify(testResult, null, 2) }}</pre>
      </div>

      <div v-if="error" class="error-result">
        <h4>Erro</h4>
        <pre>{{ error }}</pre>
      </div>

      <div class="debug-info">
        <h4>Informações de Debug</h4>
        <div class="debug-item">
          <label>Axios Default Headers:</label>
          <pre>{{ JSON.stringify(axios.defaults.headers.common, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const authStore = useAuthStore()
const loading = ref(false)
const testResult = ref(null)
const error = ref(null)

const localStorageToken = computed(() => {
  return localStorage.getItem('wp_token')
})

const hasAuthHeader = computed(() => {
  return axios.defaults.headers.common['Authorization'] !== undefined
})

const tokenPreview = computed(() => {
  const token = authStore.token || localStorageToken.value
  if (!token) return 'Nenhum token encontrado'
  return `${token.substring(0, 30)}...${token.substring(token.length - 10)}`
})

const API_BASE_URL = 'http://localhost:8080/index.php?rest_route='

const testValidation = async () => {
  loading.value = true
  error.value = null
  testResult.value = null

  try {
    console.log('Iniciando teste de validação...')
    console.log('Token no store:', authStore.token)
    console.log('Token no localStorage:', localStorageToken.value)
    console.log('Headers do axios:', axios.defaults.headers.common)
    
    const response = await axios.post(`${API_BASE_URL}/jwt-auth/v1/token/validate`)
    
    testResult.value = {
      type: 'validation',
      success: true,
      data: response.data,
      headers: response.config.headers
    }
    
    console.log('Validação bem-sucedida:', response.data)
  } catch (err) {
    error.value = {
      type: 'validation',
      message: err.response?.data?.message || err.message,
      status: err.response?.status,
      data: err.response?.data,
      headers: err.config?.headers
    }
    
    console.error('Erro na validação:', err.response?.data || err.message)
  } finally {
    loading.value = false
  }
}

const testUserInfo = async () => {
  loading.value = true
  error.value = null
  testResult.value = null

  try {
    console.log('Testando /users/me...')
    
    const response = await axios.get(`${API_BASE_URL}/wp/v2/users/me`)
    
    testResult.value = {
      type: 'user_info',
      success: true,
      data: response.data,
      headers: response.config.headers
    }
    
    console.log('Dados do usuário:', response.data)
  } catch (err) {
    error.value = {
      type: 'user_info',
      message: err.response?.data?.message || err.message,
      status: err.response?.status,
      data: err.response?.data,
      headers: err.config?.headers
    }
    
    console.error('Erro ao buscar dados do usuário:', err.response?.data || err.message)
  } finally {
    loading.value = false
  }
}

const refreshToken = async () => {
  loading.value = true
  error.value = null
  testResult.value = null

  try {
    console.log('Renovando token...')
    
    const success = await authStore.refreshToken()
    
    if (success) {
      testResult.value = {
        type: 'refresh',
        success: true,
        message: 'Token renovado com sucesso',
        newToken: authStore.token
      }
    } else {
      error.value = {
        type: 'refresh',
        message: 'Falha ao renovar token'
      }
    }
  } catch (err) {
    error.value = {
      type: 'refresh',
      message: err.response?.data?.message || err.message,
      status: err.response?.status,
      data: err.response?.data
    }
  } finally {
    loading.value = false
  }
}

const clearToken = () => {
  authStore.logout()
  testResult.value = {
    type: 'clear',
    success: true,
    message: 'Token removido com sucesso'
  }
  error.value = null
}

onMounted(() => {
  console.log('TokenTest montado')
  console.log('Estado inicial:', {
    token: authStore.token,
    localStorageToken: localStorageToken.value,
    headers: axios.defaults.headers.common
  })
})
</script>

<style scoped>
.token-test-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.token-test-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

.token-test-card h3 {
  color: #333;
  margin: 0 0 24px 0;
  font-size: 24px;
  font-weight: 600;
}

.auth-status {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
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
  margin-bottom: 24px;
}

.token-preview h4 {
  color: #333;
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
}

.token-preview pre {
  background: #1f2937;
  color: #f9fafb;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  overflow-x: auto;
  margin: 0;
}

.test-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.test-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.test-button:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-1px);
}

.test-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.test-button.danger {
  background: #e53e3e;
}

.test-button.danger:hover:not(:disabled) {
  background: #c53030;
}

.test-result,
.error-result {
  border-top: 1px solid #e2e8f0;
  padding-top: 24px;
  margin-bottom: 24px;
}

.test-result h4,
.error-result h4 {
  color: #333;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
}

.test-result pre,
.error-result pre {
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

.error-result pre {
  background: #fee;
  border-color: #feb2b2;
  color: #c53030;
}

.debug-info {
  border-top: 1px solid #e2e8f0;
  padding-top: 24px;
}

.debug-info h4 {
  color: #333;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
}

.debug-item {
  margin-bottom: 16px;
}

.debug-item label {
  color: #666;
  font-weight: 500;
  font-size: 14px;
  display: block;
  margin-bottom: 8px;
}

.debug-item pre {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 12px;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  overflow-x: auto;
  margin: 0;
}

@media (max-width: 768px) {
  .token-test-container {
    padding: 20px 10px;
  }
  
  .token-test-card {
    padding: 20px;
  }
  
  .status-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .test-actions {
    flex-direction: column;
  }
}
</style> 