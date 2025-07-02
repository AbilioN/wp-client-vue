<template>
  <div class="nonce-test">
    <h2>🔑 Teste de Nonce</h2>
    
    <div class="test-section">
      <h3>Status do Nonce</h3>
      <div class="status-grid">
        <div class="status-item">
          <strong>Nonce no Store:</strong> {{ authStore.nonce ? 'Presente' : 'Ausente' }}
        </div>
        <div class="status-item">
          <strong>Nonce no localStorage:</strong> {{ localStorage.getItem('wp_nonce') ? 'Presente' : 'Ausente' }}
        </div>
        <div class="status-item">
          <strong>Valor do Nonce:</strong> {{ authStore.nonce ? authStore.nonce.substring(0, 20) + '...' : 'N/A' }}
        </div>
      </div>
    </div>

    <div class="test-section">
      <h3>Testes de Requisição</h3>
      <div class="action-buttons">
        <button @click="testCartRequest" class="test-button">
          🛒 Testar Requisição do Carrinho
        </button>
        <button @click="testAddProduct" class="test-button">
          ➕ Testar Adicionar Produto
        </button>
        <button @click="testWithNonce" class="test-button">
          🔑 Testar Requisição com Nonce
        </button>
        <button @click="clearNonce" class="test-button secondary">
          🧹 Limpar Nonce
        </button>
      </div>
    </div>

    <div class="test-section">
      <h3>Logs</h3>
      <div class="logs-container">
        <div v-for="(log, index) in logs" :key="index" :class="['log-entry', log.type]">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
      <button @click="clearLogs" class="clear-logs-btn">Limpar Logs</button>
    </div>

    <div v-if="lastResponse" class="test-section">
      <h3>Última Resposta</h3>
      <pre class="response-data">{{ JSON.stringify(lastResponse, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const authStore = useAuthStore()
const logs = ref([])
const lastResponse = ref(null)

import { API_BASE_URL } from '../config/api'

const addLog = (message, type = 'info') => {
  const time = new Date().toLocaleTimeString()
  logs.value.unshift({ time, message, type })
  
  if (logs.value.length > 50) {
    logs.value = logs.value.slice(0, 50)
  }
}

const testCartRequest = async () => {
  addLog('🛒 Testando requisição do carrinho...', 'info')
  
  try {
    const response = await axios.get(`${API_BASE_URL}/wc/store/v1/cart`)
    addLog(`✅ Carrinho carregado: ${response.data.items_count} itens`, 'success')
    
    // Verificar se há nonce nos headers
    const nonce = response.headers['nonce'] || response.headers['Nonce']
    if (nonce) {
      addLog(`🔑 Nonce encontrado nos headers: ${nonce.substring(0, 20)}...`, 'success')
      authStore.saveNonce(nonce)
    } else {
      addLog('⚠️ Nenhum nonce encontrado nos headers', 'warning')
    }
    
    lastResponse.value = {
      status: response.status,
      headers: response.headers,
      data: response.data
    }
  } catch (error) {
    addLog(`❌ Erro: ${error.response?.data?.message || error.message}`, 'error')
  }
}

const testAddProduct = async () => {
  addLog('➕ Testando adicionar produto...', 'info')
  
  try {
    const response = await authStore.requestWithNonce('POST', `${API_BASE_URL}/wc/store/v1/cart/add-item`, {
      id: 16, // ID de um produto existente
      quantity: 1
    })
    
    addLog(`✅ Produto adicionado: ${response.data.items_count} itens no carrinho`, 'success')
    lastResponse.value = {
      status: response.status,
      headers: response.headers,
      data: response.data
    }
  } catch (error) {
    addLog(`❌ Erro ao adicionar produto: ${error.response?.data?.message || error.message}`, 'error')
  }
}

const testWithNonce = async () => {
  addLog('🔑 Testando requisição com nonce...', 'info')
  
  const nonce = authStore.nonce || localStorage.getItem('wp_nonce')
  if (!nonce) {
    addLog('❌ Nenhum nonce disponível para teste', 'error')
    return
  }
  
  addLog(`🔑 Usando nonce: ${nonce.substring(0, 20)}...`, 'info')
  
  try {
    const response = await authStore.requestWithNonce('GET', `${API_BASE_URL}/wc/store/v1/cart`)
    addLog(`✅ Requisição com nonce bem-sucedida: ${response.data.items_count} itens`, 'success')
    
    lastResponse.value = {
      status: response.status,
      headers: response.headers,
      data: response.data
    }
  } catch (error) {
    addLog(`❌ Erro na requisição com nonce: ${error.response?.data?.message || error.message}`, 'error')
  }
}

const clearNonce = () => {
  addLog('🧹 Limpando nonce...', 'info')
  authStore.clearNonce()
  addLog('✅ Nonce limpo', 'success')
}

const clearLogs = () => {
  logs.value = []
}
</script>

<style scoped>
.nonce-test {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.nonce-test h2 {
  color: #333;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 32px;
  text-align: center;
}

.test-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.test-section h3 {
  color: #333;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.status-item {
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.status-item strong {
  color: #333;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
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

.test-button:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

.test-button.secondary {
  background: #e53e3e;
}

.test-button.secondary:hover {
  background: #c53030;
}

.logs-container {
  background: #1a202c;
  color: #e2e8f0;
  padding: 16px;
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  margin-bottom: 16px;
}

.log-entry {
  margin-bottom: 4px;
  padding: 4px 0;
}

.log-entry.success {
  color: #68d391;
}

.log-entry.error {
  color: #fc8181;
}

.log-entry.warning {
  color: #f6e05e;
}

.log-entry.info {
  color: #63b3ed;
}

.log-time {
  color: #718096;
  margin-right: 8px;
}

.clear-logs-btn {
  background: #718096;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.clear-logs-btn:hover {
  background: #4a5568;
}

.response-data {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  max-height: 400px;
  overflow-y: auto;
}
</style> 