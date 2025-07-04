import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginForm from '../components/LoginForm.vue'
import UserProfile from '../components/UserProfile.vue'
import WordPressPosts from '../components/WordPressPosts.vue'
import WordPressPostDetail from '../components/WordPressPostDetail.vue'
import WooCommerceProducts from '../components/WooCommerceProducts.vue'
import WooCommerceProductDetail from '../components/WooCommerceProductDetail.vue'
import HomePage from '../components/HomePage.vue'
import ProductManagement from '../components/ProductManagement.vue'
import PWAStatus from '../components/PWAStatus.vue'
import DebugApp from '../components/DebugApp.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/posts',
    name: 'Posts',
    component: WordPressPosts
  },
  {
    path: '/posts/:id',
    name: 'PostDetail',
    component: WordPressPostDetail
  },
  {
    path: '/products',
    name: 'Products',
    component: WooCommerceProducts
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: WooCommerceProductDetail
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginForm,
    meta: { requiresGuest: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: UserProfile,
    meta: { requiresAuth: true }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('../components/ShoppingCart.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/products',
    name: 'ProductManagement',
    component: ProductManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/pwa-status',
    name: 'PWAStatus',
    component: PWAStatus
  },
  {
    path: '/debug',
    name: 'Debug',
    component: DebugApp
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guarda de navegação
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Se a rota requer autenticação
  if (to.meta.requiresAuth) {
    // Verificar se há token
    if (!authStore.token) {
      next('/login')
      return
    }
    
    // Validar token
    const isValid = await authStore.validateToken()
    if (!isValid) {
      next('/login')
      return
    }
    
    // Buscar informações do usuário se não tiver
    if (!authStore.user) {
      await authStore.getUserInfo()
    }
    
    next()
    return
  }
  
  // Se a rota requer que seja guest (não logado)
  if (to.meta.requiresGuest) {
    if (authStore.token) {
      // Validar token
      const isValid = await authStore.validateToken()
      if (isValid) {
        next('/profile')
        return
      }
    }
    
    next()
    return
  }
  
  next()
})

export default router 