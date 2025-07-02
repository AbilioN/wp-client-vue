<template>
  <div class="cart-login-test">
    <h2>🧪 Teste de Carrinho após Login</h2>
    
    <div class="test-section">
      <h3>Status Atual</h3>
      <div class="status-grid">
        <div class="status-item">
          <strong>Token:</strong> {{ authStore.token ? 'Presente' : 'Ausente' }}
        </div>
        <div class="status-item">
          <strong>Autenticado:</strong> {{ authStore.isLoggedIn ? 'Sim' : 'Não' }}
        </div>
        <div class="status-item">
          <strong>Carrinho no Store:</strong> {{ authStore.cart ? 'Presente' : 'Ausente' }}
        </div>
        <div class="status-item">
          <strong>Itens no Carrinho:</strong> {{ authStore.cartItemsCount }}
        </div>
        <div class="status-item">
          <strong>Carrinho no localStorage:</strong> {{ localStorage.getItem('wp_cart') ? 'Presente' : 'Ausente' }}
        </div>
      </div>
    </div>

    <div class="test-section">
      <h3>Ações de Teste</h3>
      <div class="action-buttons">
        <button @click="checkCartAfterLogin" class="test-button">
          🔄 Verificar Carrinho após Login
        </button>
        <button @click="forceCheckCart" class="test-button">
          🔧 Forçar Verificação do Carrinho
        </button>
        <button @click="clearCartData" class="test-button secondary">
          🧹 Limpar Dados do Carrinho
        </button>
        <button @click="showCartData" class="test-button">
          📋 Mostrar Dados do Carrinho
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

    <div v-if="cartData" class="test-section">
      <h3>Dados do Carrinho</h3>
      <pre class="cart-data">{{ JSON.stringify(cartData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const authStore = useAuthStore()
const logs = ref([])
const cartData = ref(null)

const addLog = (message, type = 'info') => {
  const time = new Date().toLocaleTimeString()
  logs.value.unshift({ time, message, type })
  
  // Limitar logs a 50 entradas
  if (logs.value.length > 50) {
    logs.value = logs.value.slice(0, 50)
  }
}

const checkCartAfterLogin = async () => {
  addLog('🔄 Iniciando verificação do carrinho após login...', 'info')
  
  try {
    const result = await authStore.checkCartAfterLogin()
    
    if (result) {
      addLog(`✅ Carrinho carregado com sucesso: ${result.items_count} itens`, 'success')
      cartData.value = result
    } else {
      addLog('❌ Falha ao carregar carrinho', 'error')
    }
  } catch (error) {
    addLog(`❌ Erro: ${error.message}`, 'error')
  }
}

const forceCheckCart = async () => {
  addLog('🔧 Forçando verificação do carrinho...', 'info')
  
  try {
    const response = await axios.get('http://localhost:8080/index.php?rest_route=/wc/store/v1/cart')
    addLog(`✅ Requisição direta bem-sucedida: ${response.data.items_count} itens`, 'success')
    
    // Atualizar o store
    authStore.updateCart(response.data)
    cartData.value = response.data
  } catch (error) {
    addLog(`❌ Erro na requisição direta: ${error.response?.data?.message || error.message}`, 'error')
  }
}

const clearCartData = () => {
  addLog('🧹 Limpando dados do carrinho...', 'info')
  authStore.clearCart()
  cartData.value = null
  addLog('✅ Dados do carrinho limpos', 'success')
}

const showCartData = () => {
  addLog('📋 Mostrando dados do carrinho...', 'info')
  
  if (authStore.cart) {
    cartData.value = authStore.cart
    addLog('✅ Dados do carrinho exibidos', 'success')
  } else {
    addLog('⚠️ Nenhum dado de carrinho disponível', 'warning')
  }
}

const clearLogs = () => {
  logs.value = []
}
</script>

<style scoped>
.cart-login-test {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.cart-login-test h2 {
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

.cart-data {
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