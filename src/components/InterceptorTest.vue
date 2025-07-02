<template>
  <div class="interceptor-test-container">
    <div class="test-header">
      <h2>🔍 Teste de Interceptors</h2>
      <p>Teste específico para verificar se os interceptors estão funcionando</p>
    </div>

    <div class="test-sections">
      <!-- Status dos Interceptors -->
      <div class="test-section">
        <h3>📊 Status dos Interceptors</h3>
        <div class="status-grid">
          <div class="status-item">
            <strong>Request Interceptors:</strong> {{ requestInterceptorsCount }}
          </div>
          <div class="status-item">
            <strong>Response Interceptors:</strong> {{ responseInterceptorsCount }}
          </div>
          <div class="status-item">
            <strong>Token no Store:</strong> {{ authStore.token ? '✅ Presente' : '❌ Ausente' }}
          </div>
          <div class="status-item">
            <strong>Token no localStorage:</strong> {{ localStorageToken ? '✅ Presente' : '❌ Ausente' }}
          </div>
        </div>
      </div>

      <!-- Teste de Requisição Simples -->
      <div class="test-section">
        <h3>🧪 Teste de Requisição</h3>
        <div class="test-actions">
          <button @click="testSimpleRequest" class="test-button" :disabled="loading">
            {{ loading ? 'Testando...' : 'Fazer Requisição Teste' }}
          </button>
          <button @click="clearLogs" class="test-button secondary">
            Limpar Logs
          </button>
        </div>
        
        <div v-if="testResult" class="test-result">
          <h4>Resultado do Teste:</h4>
          <div class="result-details">
            <p><strong>Status:</strong> {{ testResult.status }}</p>
            <p><strong>Headers Enviados:</strong></p>
            <pre>{{ JSON.stringify(testResult.headers, null, 2) }}</pre>
            <p><strong>Resposta:</strong></p>
            <pre>{{ JSON.stringify(testResult.data, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- Logs em Tempo Real -->
      <div class="test-section">
        <h3>📝 Logs em Tempo Real</h3>
        <div class="logs-container">
          <div v-for="(log, index) in logs" :key="index" class="log-entry" :class="log.type">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
          <div v-if="logs.length === 0" class="no-logs">
            Nenhum log disponível
          </div>
        </div>
      </div>

      <!-- Configuração Manual -->
      <div class="test-section">
        <h3>⚙️ Configuração Manual</h3>
        <div class="config-actions">
          <button @click="setupInterceptors" class="test-button">
            Configurar Interceptors
          </button>
          <button @click="setGlobalHeader" class="test-button">
            Forçar Configuração do Token
          </button>
          <button @click="clearGlobalHeader" class="test-button secondary">
            Limpar Header Global
          </button>
        </div>
        
        <div class="current-config">
          <h4>Configuração Atual:</h4>
          <p><strong>Header Global:</strong> {{ globalHeader || 'Não definido' }}</p>
          <p><strong>Token Atual:</strong> {{ currentToken || 'Não definido' }}</p>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const authStore = useAuthStore()
const loading = ref(false)
const error = ref(null)
const testResult = ref(null)
const logs = ref([])
const requestInterceptorsCount = ref(0)
const responseInterceptorsCount = ref(0)
const globalHeader = ref('')
const currentToken = ref('')

const localStorageToken = computed(() => {
  return localStorage.getItem('wp_token')
})

const addLog = (message, type = 'info') => {
  const time = new Date().toLocaleTimeString()
  logs.value.unshift({ time, message, type })
  
  // Manter apenas os últimos 50 logs
  if (logs.value.length > 50) {
    logs.value = logs.value.slice(0, 50)
  }
}

const clearLogs = () => {
  logs.value = []
}

const updateInterceptorCounts = () => {
  // Contar interceptors ativos
  requestInterceptorsCount.value = axios.interceptors.request.handlers.length
  responseInterceptorsCount.value = axios.interceptors.response.handlers.length
}

const updateConfig = () => {
  globalHeader.value = axios.defaults.headers.common['Authorization'] || 'Não definido'
  currentToken.value = authStore.token || 'Não definido'
}

const testSimpleRequest = async () => {
  loading.value = true
  error.value = null
  testResult.value = null
  
  addLog('🚀 Iniciando requisição de teste...', 'info')
  
  try {
    // Fazer uma requisição simples para testar os interceptors
    const response = await axios.get('http://localhost:8080/index.php?rest_route=/wc/store/v1/cart')
    
    testResult.value = {
      status: response.status,
      headers: response.config.headers,
      data: response.data
    }
    
    addLog(`✅ Requisição bem-sucedida: ${response.status}`, 'success')
  } catch (err) {
    error.value = 'Erro na requisição: ' + (err.response?.data?.message || err.message)
    
    testResult.value = {
      status: err.response?.status || 'Erro',
      headers: err.config?.headers || {},
      data: err.response?.data || err.message
    }
    
    addLog(`❌ Erro na requisição: ${err.response?.status || 'Erro'}`, 'error')
  } finally {
    loading.value = false
  }
}

const setupInterceptors = () => {
  addLog('🔧 Configurando interceptors...', 'info')
  authStore.setupAxiosInterceptors()
  updateInterceptorCounts()
  addLog('✅ Interceptors configurados', 'success')
}

const setGlobalHeader = () => {
  const success = authStore.forceTokenSetup()
  if (success) {
    addLog('✅ Token forçado em todas as configurações', 'success')
  } else {
    addLog('❌ Nenhum token disponível para configurar', 'error')
  }
  updateConfig()
}

const clearGlobalHeader = () => {
  delete axios.defaults.headers.common['Authorization']
  addLog('🧹 Header global removido', 'info')
  updateConfig()
}

onMounted(() => {
  addLog('🚀 Componente montado', 'info')
  updateInterceptorCounts()
  updateConfig()
  
  // Monitorar mudanças no token
  setInterval(() => {
    updateConfig()
  }, 1000)
})
</script>

<style scoped>
.interceptor-test-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.test-header {
  text-align: center;
  margin-bottom: 40px;
}

.test-header h2 {
  color: #333;
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.test-header p {
  color: #666;
  margin: 0;
}

.test-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.test-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

.test-section h3 {
  color: #333;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.status-item {
  background: #f8fafc;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.status-item strong {
  color: #333;
}

.test-actions, .config-actions {
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.test-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
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

.test-button.secondary {
  background: #6b7280;
}

.test-button.secondary:hover:not(:disabled) {
  background: #4b5563;
}

.test-result {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.test-result h4 {
  color: #333;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.result-details pre {
  background: #2d3748;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  overflow-x: auto;
  margin: 8px 0;
}

.logs-container {
  background: #1a202c;
  color: #e2e8f0;
  padding: 16px;
  border-radius: 8px;
  height: 300px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.log-entry {
  margin-bottom: 8px;
  padding: 4px 0;
  border-bottom: 1px solid #2d3748;
}

.log-entry.info {
  color: #63b3ed;
}

.log-entry.success {
  color: #68d391;
}

.log-entry.error {
  color: #fc8181;
}

.log-time {
  color: #718096;
  margin-right: 8px;
}

.no-logs {
  color: #718096;
  text-align: center;
  padding: 20px;
}

.current-config {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.current-config h4 {
  color: #333;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.current-config p {
  margin: 8px 0;
  font-size: 14px;
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
  .test-sections {
    grid-template-columns: 1fr;
  }
  
  .status-grid {
    grid-template-columns: 1fr;
  }
  
  .test-actions, .config-actions {
    flex-direction: column;
  }
}
</style> 