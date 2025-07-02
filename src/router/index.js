import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginForm from '../components/LoginForm.vue'
import UserProfile from '../components/UserProfile.vue'
import WordPressPosts from '../components/WordPressPosts.vue'
import WordPressPostDetail from '../components/WordPressPostDetail.vue'
import WooCommerceProducts from '../components/WooCommerceProducts.vue'
import HomePage from '../components/HomePage.vue'
import ProductManagement from '../components/ProductManagement.vue'
import AuthenticatedRequest from '../components/AuthenticatedRequest.vue'
import TokenTest from '../components/TokenTest.vue'
import CartTest from '../components/CartTest.vue'
import InterceptorTest from '../components/InterceptorTest.vue'
import AuthDebug from '../components/AuthDebug.vue'
import CartLoginTest from '../components/CartLoginTest.vue'
import NonceTest from '../components/NonceTest.vue'

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
    path: '/auth-examples',
    name: 'AuthenticatedRequest',
    component: AuthenticatedRequest,
    meta: { requiresAuth: true }
  },
  {
    path: '/token-test',
    name: 'TokenTest',
    component: TokenTest,
    meta: { requiresAuth: true }
  },
  {
    path: '/cart-test',
    name: 'CartTest',
    component: CartTest,
    meta: { requiresAuth: true }
  },
  {
    path: '/interceptor-test',
    name: 'InterceptorTest',
    component: InterceptorTest,
    meta: { requiresAuth: true }
  },
  {
    path: '/auth-debug',
    name: 'AuthDebug',
    component: AuthDebug,
    meta: { requiresAuth: true }
  },
  {
    path: '/cart-login-test',
    name: 'CartLoginTest',
    component: CartLoginTest,
    meta: { requiresAuth: true }
  },
  {
    path: '/nonce-test',
    name: 'NonceTest',
    component: NonceTest,
    meta: { requiresAuth: true }
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