<template>
  <div class="debug-app">
    <h1>Debug da Aplicação</h1>
    <div class="debug-info">
      <h3>Status da Aplicação</h3>
      <p>App carregado: {{ appLoaded ? 'Sim' : 'Não' }}</p>
      <p>Vue Router: {{ routerReady ? 'Sim' : 'Não' }}</p>
      <p>Pinia Store: {{ storeReady ? 'Sim' : 'Não' }}</p>
      <p>Service Worker: {{ swReady ? 'Sim' : 'Não' }}</p>
      <p>Manifest: {{ manifestReady ? 'Sim' : 'Não' }}</p>
    </div>
    
    <div class="debug-actions">
      <button @click="checkAll">Verificar Tudo</button>
      <button @click="clearStorage">Limpar Storage</button>
      <button @click="reloadApp">Recarregar App</button>
    </div>
    
    <div class="debug-logs">
      <h3>Logs</h3>
      <div v-for="(log, index) in logs" :key="index" class="log-item">
        {{ log }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const appLoaded = ref(false)
const routerReady = ref(false)
const storeReady = ref(false)
const swReady = ref(false)
const manifestReady = ref(false)
const logs = ref([])

const addLog = (message) => {
  logs.value.unshift(`${new Date().toLocaleTimeString()}: ${message}`)
  if (logs.value.length > 20) {
    logs.value = logs.value.slice(0, 20)
  }
}

const checkAll = async () => {
  addLog('Iniciando verificação completa...')
  
  // Verificar app
  appLoaded.value = true
  addLog('App carregado')
  
  // Verificar router
  try {
    routerReady.value = !!router
    addLog(`Router: ${routerReady.value ? 'OK' : 'ERRO'}`)
  } catch (error) {
    addLog(`Erro no router: ${error.message}`)
  }
  
  // Verificar store
  try {
    storeReady.value = !!authStore
    addLog(`Store: ${storeReady.value ? 'OK' : 'ERRO'}`)
  } catch (error) {
    addLog(`Erro na store: ${error.message}`)
  }
  
  // Verificar service worker
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      swReady.value = !!registration
      addLog(`Service Worker: ${swReady.value ? 'OK' : 'Não registrado'}`)
    } else {
      addLog('Service Worker não suportado')
    }
  } catch (error) {
    addLog(`Erro no Service Worker: ${error.message}`)
  }
  
  // Verificar manifest
  try {
    const response = await fetch('/manifest.json')
    manifestReady.value = response.ok
    addLog(`Manifest: ${manifestReady.value ? 'OK' : 'Não encontrado'}`)
  } catch (error) {
    addLog(`Erro no Manifest: ${error.message}`)
  }
}

const clearStorage = () => {
  localStorage.clear()
  sessionStorage.clear()
  addLog('Storage limpo')
  window.location.reload()
}

const reloadApp = () => {
  addLog('Recarregando aplicação...')
  window.location.reload()
}

onMounted(() => {
  addLog('Componente Debug inicializado')
  checkAll()
})
</script>

<style scoped>
.debug-app {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.debug-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.debug-info h3 {
  margin: 0 0 15px 0;
  color: #495057;
}

.debug-info p {
  margin: 8px 0;
  font-family: monospace;
}

.debug-actions {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.debug-actions button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.debug-actions button:hover {
  background: #0056b3;
}

.debug-logs {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.debug-logs h3 {
  margin: 0 0 15px 0;
  color: #495057;
}

.log-item {
  font-family: monospace;
  font-size: 12px;
  margin: 2px 0;
  padding: 2px 0;
  border-bottom: 1px solid #e9ecef;
}
</style> 