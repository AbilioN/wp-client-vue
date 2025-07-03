<template>
  <div v-if="showInstallPrompt" class="pwa-install-banner">
    <div class="banner-content">
      <div class="banner-icon">📱</div>
      <div class="banner-text">
        <h3>Instalar WordPress Store</h3>
        <p>Adicione ao seu dispositivo para acesso rápido e offline</p>
      </div>
      <div class="banner-actions">
        <button @click="installPWA" class="install-btn">
          Instalar
        </button>
        <button @click="dismissInstall" class="dismiss-btn">
          Agora não
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showInstallPrompt = ref(false)

onMounted(() => {
  console.log('PWAInstall: Componente montado')
  
  // Verificar se já foi dispensado
  const dismissed = localStorage.getItem('pwa-install-dismissed')
  if (dismissed) {
    const dismissedTime = parseInt(dismissed)
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000
    
    // Se foi dispensado há mais de 1 dia, mostrar novamente
    if (now - dismissedTime > oneDay) {
      localStorage.removeItem('pwa-install-dismissed')
    } else {
      console.log('PWAInstall: Banner dispensado recentemente')
      return
    }
  }
  
  // Listener para evento de instalação
  const handleBeforeInstallPrompt = (e) => {
    console.log('PWAInstall: Evento beforeinstallprompt capturado!')
    e.preventDefault()
    window.deferredPrompt = e
    showInstallPrompt.value = true
  }
  
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  
  // Verificar se já existe um deferred prompt
  if (window.deferredPrompt) {
    console.log('PWAInstall: Deferred prompt já existe')
    showInstallPrompt.value = true
  }
  
  // Cleanup
  return () => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }
})

const installPWA = () => {
  console.log('PWAInstall: Tentando instalar PWA...')
  if (window.deferredPrompt) {
    window.deferredPrompt.prompt()
    window.deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('PWAInstall: ✅ PWA instalada com sucesso!')
      } else {
        console.log('PWAInstall: ❌ Instalação cancelada')
      }
      window.deferredPrompt = null
      showInstallPrompt.value = false
    })
  } else {
    console.log('PWAInstall: Nenhum deferred prompt disponível')
  }
}

const dismissInstall = () => {
  console.log('PWAInstall: Banner dispensado')
  showInstallPrompt.value = false
  localStorage.setItem('pwa-install-dismissed', Date.now().toString())
}
</script>

<style scoped>
.pwa-install-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e2e8f0;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 16px;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.banner-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.banner-text {
  flex: 1;
}

.banner-text h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.banner-text p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.banner-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.install-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.install-btn:hover {
  background: #5a67d8;
}

.dismiss-btn {
  background: transparent;
  color: #666;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dismiss-btn:hover {
  background: #f8fafc;
  color: #333;
}

@media (max-width: 768px) {
  .banner-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .banner-actions {
    width: 100%;
    justify-content: center;
  }
}
</style> 