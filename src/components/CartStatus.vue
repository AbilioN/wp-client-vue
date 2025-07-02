<template>
  <div class="cart-status">
    <router-link to="/cart" class="cart-link">
      <div class="cart-icon">
        🛒
        <span v-if="cartItemsCount > 0" class="cart-badge">{{ cartItemsCount }}</span>
      </div>
      <span class="cart-text">Carrinho</span>
    </router-link>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const cartItemsCount = computed(() => authStore.getCartItemsCount)
</script>

<style scoped>
.cart-status {
  display: flex;
  align-items: center;
}

.cart-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #333;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
}

.cart-link:hover {
  background-color: #f8fafc;
  color: #667eea;
}

.cart-icon {
  position: relative;
  font-size: 20px;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #e53e3e;
  color: white;
  font-size: 12px;
  font-weight: bold;
  min-width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
}

.cart-text {
  font-size: 14px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .cart-text {
    display: none;
  }
  
  .cart-link {
    padding: 8px;
  }
}
</style> 