<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <router-link to="/" class="brand-link">
            <span>🛍️</span>
            <span>WordPress Store</span>
          </router-link>
        </div>
        <div class="nav-menu">
          <router-link to="/products" class="nav-link">Produtos</router-link>
          <router-link to="/posts" class="nav-link">Posts</router-link>
          <CartStatus v-if="authStore.isLoggedIn" />
          <div v-if="authStore.isLoggedIn" class="user-menu">
            <router-link to="/profile" class="nav-link">Perfil</router-link>
            <router-link to="/admin/products" class="nav-link">Gerenciar Produtos</router-link>
            <router-link to="/cart-test" class="nav-link">🧪 Teste Carrinho</router-link>
            <router-link to="/cart-login-test" class="nav-link">🛒 Teste Login Carrinho</router-link>
            <router-link to="/nonce-test" class="nav-link">🔑 Teste Nonce</router-link>
            <router-link to="/interceptor-test" class="nav-link">🔧 Teste Interceptors</router-link>
            <router-link to="/auth-debug" class="nav-link">🔍 Debug Auth</router-link>
            <button @click="handleLogout" class="nav-button">
              <span>🚪</span>
              Sair
            </button>
          </div>
          <router-link v-else to="/login" class="nav-button login-btn">
            <span>🔐</span>
            Entrar
          </router-link>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import CartStatus from './components/CartStatus.vue'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

// Verificar autenticação ao carregar a aplicação
onMounted(async () => {
  if (authStore.token) {
    const isValid = await authStore.validateToken()
    if (isValid && !authStore.user) {
      await authStore.getUserInfo()
    }
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f8fafc;
}

#app {
  min-height: 100vh;
}

.navbar {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.nav-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 18px;
  color: #333;
  text-decoration: none;
  transition: color 0.2s ease;
}

.brand-link:hover {
  color: #667eea;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-link {
  text-decoration: none;
  color: #667eea;
  font-weight: 500;
  transition: color 0.2s ease;
  padding: 8px 12px;
  border-radius: 6px;
}

.nav-link:hover {
  color: #5a67d8;
  background: #f7fafc;
}

.cart-link {
  background: #667eea;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
}

.cart-link:hover {
  background: #5a67d8;
  color: white;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-button {
  background: #e53e3e;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
}

.nav-button:hover {
  background: #c53030;
}

.login-btn {
  background: #667eea;
}

.login-btn:hover {
  background: #5a67d8;
}

.main-content {
  flex: 1;
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 16px;
  }
  
  .nav-menu {
    gap: 12px;
  }
  
  .nav-link {
    padding: 6px 8px;
    font-size: 14px;
  }
  
  .user-menu {
    gap: 8px;
  }
  
  .nav-button {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>
