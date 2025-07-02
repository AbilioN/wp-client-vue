<template>
  <div class="pwa-status">
    <h3>Status da PWA</h3>
    
    <div class="status-grid">
      <div class="status-item">
        <h4>Service Worker</h4>
        <p>Status: {{ swStatus }}</p>
        <p>Registrado: {{ swRegistered ? 'Sim' : 'Não' }}</p>
        <button @click="checkServiceWorker" :disabled="checking">
          {{ checking ? 'Verificando...' : 'Verificar SW' }}
        </button>
        <button @click="forceUpdateSW" :disabled="checking" style="margin-left: 10px;">
          {{ checking ? 'Atualizando...' : 'Forçar Atualização' }}
        </button>
      </div>

      <div class="status-item">
        <h4>Manifest</h4>
        <p>Detectado: {{ manifestDetected ? 'Sim' : 'Não' }}</p>
        <p>Nome: {{ manifestName }}</p>
        <button @click="checkManifest" :disabled="checking">
          {{ checking ? 'Verificando...' : 'Verificar Manifest' }}
        </button>
      </div>

      <div class="status-item">
        <h4>Instalação</h4>
        <p>Pode instalar: {{ canInstall ? 'Sim' : 'Não' }}</p>
        <p>Já instalado: {{ isInstalled ? 'Sim' : 'Não' }}</p>
        <button @click="installPWA" v-if="canInstall && !isInstalled">
          Instalar PWA
        </button>
      </div>

      <div class="status-item">
        <h4>Notificações</h4>
        <p>Permissão: {{ notificationPermission }}</p>
        <button @click="requestNotificationPermission" v-if="notificationPermission === 'default'">
          Solicitar Permissão
        </button>
      </div>
    </div>

    <div class="logs" v-if="logs.length > 0">
      <h4>Logs</h4>
      <div class="log-container">
        <div v-for="(log, index) in logs" :key="index" class="log-item">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
      <button @click="clearLogs">Limpar Logs</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { 
  registerServiceWorker, 
  forceUpdateServiceWorker,
  isPWAInstalled, 
  canInstallPWA, 
  installPWA,
  requestNotificationPermission as requestPermission
} from '../utils/pwa'

const swStatus = ref('Desconhecido')
const swRegistered = ref(false)
const manifestDetected = ref(false)
const manifestName = ref('N/A')
const canInstall = ref(false)
const isInstalled = ref(false)
const notificationPermission = ref('default')
const checking = ref(false)
const logs = ref([])

const addLog = (message) => {
  logs.value.unshift({
    time: new Date().toLocaleTimeString(),
    message
  })
  if (logs.value.length > 20) {
    logs.value = logs.value.slice(0, 20)
  }
}

const checkServiceWorker = async () => {
  checking.value = true
  addLog('Verificando Service Worker...')
  
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        swRegistered.value = true
        swStatus.value = registration.active ? 'Ativo' : 'Instalando'
        addLog(`Service Worker encontrado: ${swStatus.value}`)
      } else {
        swRegistered.value = false
        swStatus.value = 'Não registrado'
        addLog('Service Worker não encontrado, tentando registrar...')
        
        const newRegistration = await registerServiceWorker()
        if (newRegistration) {
          swRegistered.value = true
          swStatus.value = 'Registrado'
          addLog('Service Worker registrado com sucesso')
        } else {
          addLog('Falha ao registrar Service Worker')
        }
      }
    } else {
      swStatus.value = 'Não suportado'
      addLog('Service Worker não suportado pelo navegador')
    }
  } catch (error) {
    addLog(`Erro ao verificar Service Worker: ${error.message}`)
  } finally {
    checking.value = false
  }
}

const checkManifest = async () => {
  checking.value = true
  addLog('Verificando Manifest...')
  
  try {
    const response = await fetch('/manifest.json')
    if (response.ok) {
      const manifest = await response.json()
      manifestDetected.value = true
      manifestName.value = manifest.name || 'N/A'
      addLog(`Manifest detectado: ${manifestName.value}`)
    } else {
      manifestDetected.value = false
      addLog('Manifest não encontrado')
    }
  } catch (error) {
    manifestDetected.value = false
    addLog(`Erro ao verificar Manifest: ${error.message}`)
  } finally {
    checking.value = false
  }
}

const installPWAApp = () => {
  addLog('Tentando instalar PWA...')
  installPWA()
}

const forceUpdateSW = async () => {
  checking.value = true
  addLog('Forçando atualização do Service Worker...')
  
  try {
    const registration = await forceUpdateServiceWorker()
    if (registration) {
      swRegistered.value = true
      swStatus.value = 'Atualizado'
      addLog('Service Worker atualizado com sucesso')
    } else {
      addLog('Falha ao atualizar Service Worker')
    }
  } catch (error) {
    addLog(`Erro ao forçar atualização: ${error.message}`)
  } finally {
    checking.value = false
  }
}

const requestNotificationPermission = async () => {
  addLog('Solicitando permissão para notificações...')
  const granted = await requestPermission()
  notificationPermission.value = granted ? 'granted' : 'denied'
  addLog(`Permissão para notificações: ${notificationPermission.value}`)
}

const clearLogs = () => {
  logs.value = []
}

onMounted(async () => {
  addLog('Componente PWA Status inicializado')
  
  // Verificar status inicial
  isInstalled.value = isPWAInstalled()
  canInstall.value = canInstallPWA()
  notificationPermission.value = Notification.permission
  
  await checkServiceWorker()
  await checkManifest()
  
  // Listener para mudanças no beforeinstallprompt
  window.addEventListener('beforeinstallprompt', () => {
    canInstall.value = true
    addLog('Evento beforeinstallprompt disparado')
  })
  
  // Listener para mudanças no service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      addLog('Service Worker controller mudou')
      checkServiceWorker()
    })
  }
})
</script>

<style scoped>
.pwa-status {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 20px 0;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.status-item {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.status-item h4 {
  margin: 0 0 10px 0;
  color: #495057;
}

.status-item p {
  margin: 5px 0;
  font-size: 14px;
}

.status-item button {
  margin-top: 10px;
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.status-item button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.status-item button:hover:not(:disabled) {
  background: #0056b3;
}

.logs {
  margin-top: 20px;
}

.log-container {
  max-height: 200px;
  overflow-y: auto;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 10px;
  margin: 10px 0;
}

.log-item {
  display: flex;
  margin: 2px 0;
  font-family: monospace;
  font-size: 12px;
}

.log-time {
  color: #6c757d;
  margin-right: 10px;
  min-width: 80px;
}

.log-message {
  color: #495057;
}
</style> 