const CACHE_NAME = 'wp-store-v2'
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

console.log('Service Worker: Iniciando v2...')

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache aberto:', CACHE_NAME)
        return cache.addAll(urlsToCache)
      })
      .then(() => {
        console.log('Service Worker: Instalação concluída')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker: Erro na instalação:', error)
      })
  )
})

// Ativar service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Removendo cache antigo:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
    .then(() => {
      console.log('Service Worker: Ativação concluída')
      return self.clients.claim()
    })
    .catch((error) => {
      console.error('Service Worker: Erro na ativação:', error)
    })
  )
})

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  
  // Não cachear requisições para a API
  if (url.pathname.includes('/wp-api/') || url.hostname === 'localhost:8080') {
    console.log('Service Worker: Ignorando requisição da API:', url.pathname)
    return
  }

  console.log('Service Worker: Interceptando requisição:', url.pathname)

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retornar do cache se disponível
        if (response) {
          console.log('Service Worker: Retornando do cache:', url.pathname)
          return response
        }

        // Fazer requisição para a rede
        return fetch(event.request)
          .then((response) => {
            // Verificar se a resposta é válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              console.log('Service Worker: Resposta inválida, não cacheando:', url.pathname)
              return response
            }

            // Clonar a resposta
            const responseToCache = response.clone()

            // Adicionar ao cache
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
                console.log('Service Worker: Adicionado ao cache:', url.pathname)
              })

            return response
          })
          .catch((error) => {
            console.error('Service Worker: Erro na requisição:', url.pathname, error)
            // Fallback para páginas HTML
            if (event.request.destination === 'document') {
              console.log('Service Worker: Fallback para index.html')
              return caches.match('/index.html')
            }
          })
      })
  )
})

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Sincronização em background:', event.tag)
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

// Notificações push
self.addEventListener('push', (event) => {
  console.log('Service Worker: Notificação push recebida')
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação da loja!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver produtos',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/icon-72x72.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('WordPress Store', options)
  )
})

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Clique em notificação:', event.action)
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/products')
    )
  } else if (event.action === 'close') {
    // Apenas fechar a notificação
  } else {
    // Clique padrão - abrir a aplicação
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Função para sincronização em background
async function doBackgroundSync() {
  try {
    // Aqui você pode adicionar lógica para sincronizar dados
    // Por exemplo, sincronizar carrinho offline
    console.log('Service Worker: Sincronização em background executada')
  } catch (error) {
    console.error('Service Worker: Erro na sincronização em background:', error)
  }
} 