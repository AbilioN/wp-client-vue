// Utilitários para PWA

// Registrar service worker
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      return registration
    } catch (error) {
      console.error('Erro ao registrar service worker:', error)
      return null
    }
  }
  return null
}

// Forçar atualização do service worker
export async function forceUpdateServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      // Limpar todos os caches
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
      
      // Desregistrar service worker atual
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.unregister()
      }
      
      // Registrar novo service worker
      const newRegistration = await navigator.serviceWorker.register('/sw.js')
      return newRegistration
    } catch (error) {
      console.error('Erro ao forçar atualização do service worker:', error)
      return null
    }
  }
  return null
}

// Verificar se a PWA está instalada
export function isPWAInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true
}

// Solicitar permissão para notificações
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    return false
  }

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

// Enviar notificação
export function sendNotification(title, options = {}) {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      ...options
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    return notification
  }
}

// Verificar conectividade
export function isOnline() {
  return navigator.onLine
}

// Listener para mudanças de conectividade
export function onConnectivityChange(callback) {
  window.addEventListener('online', () => callback(true))
  window.addEventListener('offline', () => callback(false))
}

// Sincronizar em background
export async function syncInBackground() {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    const registration = await navigator.serviceWorker.ready
    await registration.sync.register('background-sync')
  }
}

// Verificar se pode instalar
export function canInstallPWA() {
  return !!window.deferredPrompt
}

// Instalar PWA
export function installPWA() {
  const deferredPrompt = window.deferredPrompt
  if (deferredPrompt) {
    deferredPrompt.prompt()
    deferredPrompt.userChoice.then(() => {
      window.deferredPrompt = null
    })
  }
}

// Listener para evento de instalação
export function onBeforeInstallPrompt(callback) {
  // Verificar se já existe um listener
  if (window._beforeInstallPromptListener) {
    window.removeEventListener('beforeinstallprompt', window._beforeInstallPromptListener)
  }
  
  const listener = (e) => {
    e.preventDefault()
    window.deferredPrompt = e
    callback(e)
  }
  
  window._beforeInstallPromptListener = listener
  window.addEventListener('beforeinstallprompt', listener)
  
  // Também verificar se já existe um deferred prompt
  if (window.deferredPrompt) {
    callback(window.deferredPrompt)
  }
}

// Atualizar PWA
export function onUpdateAvailable(callback) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      callback()
    })
  }
}

// Verificar atualizações
export async function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration) {
      await registration.update()
    }
  }
}

// Cache de dados offline
export class OfflineCache {
  constructor() {
    this.dbName = 'wp-store-offline'
    this.version = 1
    this.db = null
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        
        // Store para produtos
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'id' })
          productStore.createIndex('name', 'name', { unique: false })
        }
        
        // Store para carrinho
        if (!db.objectStoreNames.contains('cart')) {
          db.createObjectStore('cart', { keyPath: 'id' })
        }
      }
    })
  }

  async saveProduct(product) {
    const transaction = this.db.transaction(['products'], 'readwrite')
    const store = transaction.objectStore('products')
    await store.put(product)
  }

  async getProduct(id) {
    const transaction = this.db.transaction(['products'], 'readonly')
    const store = transaction.objectStore('products')
    return await store.get(id)
  }

  async getAllProducts() {
    const transaction = this.db.transaction(['products'], 'readonly')
    const store = transaction.objectStore('products')
    return await store.getAll()
  }

  async saveCart(cartData) {
    const transaction = this.db.transaction(['cart'], 'readwrite')
    const store = transaction.objectStore('cart')
    await store.put({ id: 'current', data: cartData })
  }

  async getCart() {
    const transaction = this.db.transaction(['cart'], 'readonly')
    const store = transaction.objectStore('cart')
    const result = await store.get('current')
    return result ? result.data : null
  }
} 