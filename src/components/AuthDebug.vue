<template>
  <div class="auth-debug-container">
    <div class="auth-debug-header">
      <h2>🔍 Debug de Autenticação</h2>
      <p>Verifique o status da autenticação e interceptors</p>
    </div>

    <div class="debug-sections">
      <!-- Status da Autenticação -->
      <div class="debug-section">
        <h3>📊 Status da Autenticação</h3>
        <div class="status-grid">
          <div class="status-item">
            <strong>Token:</strong> 
            <span :class="authStore.token ? 'success' : 'error'">
              {{ authStore.token ? 'Presente' : 'Ausente' }}
            </span>
          </div>
          <div class="status-item">
            <strong>Logado:</strong> 
            <span :class="authStore.isLoggedIn ? 'success' : 'error'">
              {{ authStore.isLoggedIn ? 'Sim' : 'Não' }}
            </span>
          </div>
          <div class="status-item">
            <strong>Email:</strong> {{ authStore.userEmail || 'N/A' }}
          </div>
          <div class="status-item">
            <strong>Nome:</strong> {{ authStore.userDisplayName || 'N/A' }}
          </div>
        </div>
        
        <div v-if="authStore.token" class="token-info">
          <h4>Token JWT:</h4>
          <div class="token-preview">
            {{ authStore.token.substring(0, 20) }}...
          </div>
        </div>
      </div>

      <!-- Headers do Axios -->
      <div class="debug-section">
        <h3>🔧 Headers do Axios</h3>
        <div class="headers-info">
          <h4>Headers Globais:</h4>
          <pre>{{ JSON.stringify(axiosHeaders, null, 2) }}</pre>
        </div>
        
        <div class="test-actions">
          <button @click="testRequest" class="test-button" :disabled="testing">
            {{ testing ? 'Testando...' : 'Testar Requisição' }}
          </button>
          <button @click="clearHeaders" class="test-button danger">
            Limpar Headers
          </button>
        </div>
        
        <div v-if="testResult" class="test-result">
          <h4>Resultado do Teste:</h4>
          <pre>{{ JSON.stringify(testResult, null, 2) }}</pre>
        </div>
      </div>

      <!-- Teste de Endpoints -->
      <div class="debug-section">
        <h3>🧪 Teste de Endpoints</h3>
        <div class="endpoint-tests">
          <div class="test-item">
            <button @click="testCartEndpoint" class="test-button" :disabled="testing">
              Testar Carrinho
            </button>
            <span class="endpoint-url">/wc/store/v1/cart</span>
          </div>
          
          <div class="test-item">
            <button @click="testProductsEndpoint" class="test-button" :disabled="testing">
              Testar Produtos
            </button>
            <span class="endpoint-url">/wc/v3/products</span>
          </div>
          
          <div class="test-item">
            <button @click="testUserEndpoint" class="test-button" :disabled="testing">
              Testar Usuário
            </button>
            <span class="endpoint-url">/wp/v2/users/me</span>
          </div>
        </div>
        
        <div v-if="endpointResults.length > 0" class="endpoint-results">
          <h4>Resultados dos Endpoints:</h4>
          <div v-for="result in endpointResults" :key="result.endpoint" class="endpoint-result">
            <h5>{{ result.endpoint }}</h5>
            <div :class="result.success ? 'success' : 'error'">
              {{ result.success ? '✅ Sucesso' : '❌ Erro' }}
            </div>
            <pre>{{ JSON.stringify(result.data, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- Logs de Interceptor -->
      <div class="debug-section">
        <h3>📝 Logs de Interceptor</h3>
        <div class="logs-container">
          <div v-for="log in interceptorLogs" :key="log.id" class="log-item" :class="log.type">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
        
        <div class="log-actions">
          <button @click="clearLogs" class="test-button">
            Limpar Logs
          </button>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/index.php?rest_route='

const authStore = useAuthStore()
const testing = ref(false)
const error = ref(null)
const testResult = ref(null)
const endpointResults = ref([])
const interceptorLogs = ref([])

// Computed para headers do axios
const axiosHeaders = computed(() => {
  return axios.defaults.headers.common
})

// Adicionar log
const addLog = (message, type = 'info') => {
  interceptorLogs.value.unshift({
    id: Date.now(),
    time: new Date().toLocaleTimeString(),
    message,
    type
  })
  
  // Manter apenas os últimos 20 logs
  if (interceptorLogs.value.length > 20) {
    interceptorLogs.value = interceptorLogs.value.slice(0, 20)
  }
}

// Testar requisição simples
const testRequest = async () => {
  testing.value = true
  error.value = null
  testResult.value = null
  
  try {
    addLog('Iniciando teste de requisição...', 'info')
    
    const response = await axios.get(`${API_BASE_URL}/wp/v2/posts?per_page=1`)
    
    testResult.value = {
      success: true,
      status: response.status,
      headers: response.headers,
      data: response.data
    }
    
    addLog('Requisição bem-sucedida', 'success')
  } catch (err) {
    testResult.value = {
      success: false,
      status: err.response?.status,
      error: err.response?.data || err.message
    }
    
    addLog(`Erro na requisição: ${err.response?.status} - ${err.response?.data?.message || err.message}`, 'error')
  } finally {
    testing.value = false
  }
}

// Limpar headers
const clearHeaders = () => {
  delete axios.defaults.headers.common['Authorization']
  addLog('Headers de autorização removidos', 'warning')
}

// Testar endpoint do carrinho
const testCartEndpoint = async () => {
  await testEndpoint('/wc/store/v1/cart', 'Carrinho')
}

// Testar endpoint de produtos
const testProductsEndpoint = async () => {
  await testEndpoint('/wc/v3/products?per_page=1', 'Produtos')
}

// Testar endpoint de usuário
const testUserEndpoint = async () => {
  await testEndpoint('/wp/v2/users/me', 'Usuário')
}

// Testar endpoint genérico
const testEndpoint = async (endpoint, name) => {
  testing.value = true
  error.value = null
  
  try {
    addLog(`Testando endpoint: ${endpoint}`, 'info')
    
    const response = await axios.get(`${API_BASE_URL}${endpoint}`)
    
    const result = {
      endpoint: name,
      success: true,
      status: response.status,
      data: response.data
    }
    
    endpointResults.value.unshift(result)
    addLog(`Endpoint ${name} testado com sucesso`, 'success')
  } catch (err) {
    const result = {
      endpoint: name,
      success: false,
      status: err.response?.status,
      data: err.response?.data || err.message
    }
    
    endpointResults.value.unshift(result)
    addLog(`Erro no endpoint ${name}: ${err.response?.status}`, 'error')
  } finally {
    testing.value = false
  }
}

// Limpar logs
const clearLogs = () => {
  interceptorLogs.value = []
}

// Monitorar interceptors
onMounted(() => {
  // Interceptor de requisição
  const originalRequest = axios.interceptors.request.handlers[0]?.fulfilled
  if (originalRequest) {
    axios.interceptors.request.handlers[0].fulfilled = (config) => {
      addLog(`Requisição: ${config.method?.toUpperCase()} ${config.url}`, 'info')
      if (config.headers.Authorization) {
        addLog('Header Authorization presente', 'success')
      } else {
        addLog('Header Authorization ausente', 'warning')
      }
      return originalRequest(config)
    }
  }
  
  // Interceptor de resposta
  const originalResponse = axios.interceptors.response.handlers[0]?.fulfilled
  if (originalResponse) {
    axios.interceptors.response.handlers[0].fulfilled = (response) => {
      addLog(`Resposta: ${response.status} ${response.config.url}`, 'success')
      return originalResponse(response)
    }
  }
  
  addLog('Debug de autenticação inicializado', 'info')
})
</script>

<style scoped>
.auth-debug-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.auth-debug-header {
  text-align: center;
  margin-bottom: 40px;
}

.auth-debug-header h2 {
  color: #333;
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.auth-debug-header p {
  color: #666;
  margin: 0;
}

.debug-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.debug-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

.debug-section h3 {
  color: #333;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.status-item {
  background: #f8fafc;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.status-item strong {
  color: #333;
  display: block;
  margin-bottom: 4px;
}

.status-item .success {
  color: #059669;
  font-weight: 600;
}

.status-item .error {
  color: #dc2626;
  font-weight: 600;
}

.token-info {
  margin-top: 20px;
}

.token-preview {
  background: #2d3748;
  color: #e2e8f0;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
}

.headers-info {
  margin-bottom: 20px;
}

.headers-info pre {
  background: #f8fafc;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  overflow-x: auto;
}

.test-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
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
}

.test-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.test-button.danger {
  background: #e53e3e;
}

.test-button.danger:hover {
  background: #c53030;
}

.test-result {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.test-result pre {
  background: #2d3748;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  overflow-x: auto;
  margin: 0;
}

.endpoint-tests {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.test-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.endpoint-url {
  font-family: monospace;
  font-size: 12px;
  color: #666;
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 4px;
}

.endpoint-results {
  margin-top: 20px;
}

.endpoint-result {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;
}

.endpoint-result h5 {
  color: #333;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.endpoint-result .success {
  color: #059669;
  font-weight: 600;
}

.endpoint-result .error {
  color: #dc2626;
  font-weight: 600;
}

.endpoint-result pre {
  background: #2d3748;
  color: #e2e8f0;
  padding: 8px;
  border-radius: 4px;
  font-size: 11px;
  overflow-x: auto;
  margin: 8px 0 0 0;
}

.logs-container {
  max-height: 300px;
  overflow-y: auto;
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 16px;
}

.log-item {
  display: flex;
  gap: 12px;
  padding: 4px 0;
  font-size: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.log-item:last-child {
  border-bottom: none;
}

.log-item.success {
  color: #059669;
}

.log-item.error {
  color: #dc2626;
}

.log-item.warning {
  color: #d97706;
}

.log-time {
  font-weight: 600;
  min-width: 80px;
}

.log-message {
  flex: 1;
}

.log-actions {
  display: flex;
  gap: 12px;
}

.error-message {
  background-color: #fee;
  color: #c53030;
  padding: 16px;
  border-radius: 8px;
  margin-top: 24px;
  border: 1px solid #feb2b2;
}

@media (max-width: 768px) {
  .debug-sections {
    grid-template-columns: 1fr;
  }
  
  .status-grid {
    grid-template-columns: 1fr;
  }
  
  .test-actions {
    flex-direction: column;
  }
  
  .test-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style> 