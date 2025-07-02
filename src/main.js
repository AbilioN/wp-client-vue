import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { useAuthStore } from './stores/auth'
import { registerServiceWorker } from './utils/pwa'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Inicializar autenticação
const authStore = useAuthStore()
authStore.initializeAuth()

// Registrar service worker
registerServiceWorker().then(registration => {
  if (registration) {
    console.log('Service Worker registrado com sucesso:', registration)
  } else {
    console.log('Service Worker não pôde ser registrado')
  }
})

app.mount('#app')
