<template>
  <div class="cart-container">
    <div class="cart-header">
      <h2>🛒 Seu Carrinho</h2>
      <div class="header-actions">
        <button @click="loadCart" class="refresh-button" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Carregando...' : 'Atualizar' }}
        </button>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="loading && !cart" class="loading-container">
      <div class="loading-spinner large"></div>
      <p>Carregando carrinho...</p>
    </div>

    <div v-else-if="!cart || cart.items.length === 0" class="empty-cart">
      <div class="empty-cart-icon">🛒</div>
      <h3>Carrinho Vazio</h3>
      <p>Adicione produtos ao seu carrinho para começar a comprar</p>
      <router-link to="/products" class="browse-products-button">
        Explorar Produtos
      </router-link>
    </div>

    <div v-else class="cart-content">
      <div class="cart-items">
        <div v-for="item in cart.items" :key="item.key" class="cart-item">
          <div class="item-image">
            <img 
              v-if="item.images && item.images.length > 0" 
              :src="item.images[0].src" 
              :alt="item.name"
            />
            <div v-else class="no-image">📦</div>
          </div>
          
          <div class="item-details">
            <h3 class="item-name">{{ item.name }}</h3>
            <p class="item-price">{{ formatPrice(item.prices.price) }}</p>
            <p v-if="item.prices.regular_price !== item.prices.price" class="original-price">
              {{ formatPrice(item.prices.regular_price) }}
            </p>
          </div>
          
          <div class="item-quantity">
            <button @click="updateQuantity(item, item.quantity - 1)" class="quantity-btn" :disabled="item.quantity <= 1">-</button>
            <span class="quantity">{{ item.quantity }}</span>
            <button @click="updateQuantity(item, item.quantity + 1)" class="quantity-btn">+</button>
          </div>
          
          <div class="item-total">
            <span class="total-price">{{ formatPrice(item.prices.price * item.quantity) }}</span>
          </div>
          
          <button @click="removeItem(item)" class="remove-btn">
            🗑️
          </button>
        </div>
      </div>

      <div class="cart-summary">
        <h3>Resumo do Pedido</h3>
        
        <div class="summary-item">
          <span>Subtotal:</span>
          <span>{{ formatPrice(cart.totals.total_items) }}</span>
        </div>
        
        <div v-if="cart.totals.total_shipping" class="summary-item">
          <span>Frete:</span>
          <span>{{ formatPrice(cart.totals.total_shipping) }}</span>
        </div>
        
        <div v-if="cart.totals.total_discount !== '0'" class="summary-item discount">
          <span>Desconto:</span>
          <span>-{{ formatPrice(cart.totals.total_discount) }}</span>
        </div>
        
        <div class="summary-item total">
          <span>Total:</span>
          <span>{{ formatPrice(cart.totals.total_price) }}</span>
        </div>

        <div class="cart-info">
          <p><strong>Itens:</strong> {{ cart.items_count }}</p>
          <p v-if="cart.items_weight > 0"><strong>Peso:</strong> {{ cart.items_weight }}kg</p>
        </div>
        
        <button @click="checkout" class="checkout-button" :disabled="cart.items_count === 0">
          Finalizar Compra
        </button>
        
        <button @click="clearCart" class="clear-cart-button">
          Limpar Carrinho
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

import { API_BASE_URL, WP_BASE_URL } from '../config/api'

const router = useRouter()
const authStore = useAuthStore()
const cart = ref(null)
const loading = ref(false)
const error = ref(null)

const loadCart = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await axios.get(`${API_BASE_URL}/wc/store/v1/cart`)
    cart.value = response.data
    
    // Atualizar o store com os dados do carrinho
    authStore.updateCart(response.data, response.headers)
  } catch (err) {
    error.value = 'Erro ao carregar carrinho: ' + (err.response && err.response.data && err.response.data.message || err.message)
    console.error('Erro ao carregar carrinho:', err)
  } finally {
    loading.value = false
  }
}

const formatPrice = (price) => {
  if (!price) return '€ 0,00'
  const numericPrice = parseFloat(price)
  return `€ ${numericPrice.toFixed(2).replace('.', ',')}`
}

const updateQuantity = async (item, newQuantity) => {
  if (newQuantity < 1) return
  
  loading.value = true
  error.value = null
  
  try {
    const response = await authStore.requestWithNonce('POST', `${API_BASE_URL}/wc/store/v1/cart/update-item`, {
      key: item.key,
      quantity: newQuantity
    })
    
    // Usar a resposta da operação em vez de recarregar
    cart.value = response.data
    
    // Atualizar o store com os dados do carrinho
    authStore.updateCart(response.data, response.headers)
  } catch (err) {
    error.value = 'Erro ao atualizar quantidade: ' + (err.response && err.response.data && err.response.data.message || err.message)
    console.error('Erro ao atualizar quantidade:', err)
  } finally {
    loading.value = false
  }
}

const removeItem = async (item) => {
  if (!confirm('Tem certeza que deseja remover este item?')) return
  
  loading.value = true
  error.value = null
  
  try {
    const response = await authStore.requestWithNonce('POST', `${API_BASE_URL}/wc/store/v1/cart/remove-item`, {
      key: item.key
    })
    
    // Usar a resposta da operação em vez de recarregar
    cart.value = response.data
    
    // Atualizar o store com os dados do carrinho
    authStore.updateCart(response.data, response.headers)
  } catch (err) {
    error.value = 'Erro ao remover item: ' + (err.response && err.response.data && err.response.data.message || err.message)
    console.error('Erro ao remover item:', err)
  } finally {
    loading.value = false
  }
}

const clearCart = async () => {
  if (!confirm('Tem certeza que deseja limpar o carrinho?')) return
  
  loading.value = true
  error.value = null
  
  try {
    const response = await authStore.requestWithNonce('POST', `${API_BASE_URL}/wc/store/v1/cart/remove-items`)
    
    // Usar a resposta da operação em vez de recarregar
    cart.value = response.data
    
    // Atualizar o store com os dados do carrinho
    authStore.updateCart(response.data, response.headers)
  } catch (err) {
    error.value = 'Erro ao limpar carrinho: ' + (err.response && err.response.data && err.response.data.message || err.message)
    console.error('Erro ao limpar carrinho:', err)
  } finally {
    loading.value = false
  }
}

const checkout = () => {
  // Redirecionar para o checkout interno
  router.push('/checkout')
}

onMounted(() => {
  loadCart()
})
</script>

<style scoped>
.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.cart-header h2 {
  color: #333;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 16px;
}

.refresh-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.refresh-button:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-1px);
}

.refresh-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner.large {
  width: 40px;
  height: 40px;
  border-width: 3px;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background-color: #fee;
  color: #c53030;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  border: 1px solid #feb2b2;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #666;
}

.empty-cart {
  text-align: center;
  padding: 80px 20px;
}

.empty-cart-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-cart h3 {
  color: #333;
  font-size: 24px;
  margin: 0 0 12px 0;
}

.empty-cart p {
  color: #666;
  margin: 0 0 32px 0;
}

.browse-products-button {
  display: inline-block;
  background: #667eea;
  color: white;
  padding: 16px 32px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
}

.browse-products-button:hover {
  background: #5a67d8;
  transform: translateY(-2px);
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 40px;
}

.cart-items {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cart-item {
  display: grid;
  grid-template-columns: 80px 1fr auto auto auto;
  gap: 20px;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  font-size: 2rem;
  color: #cbd5e0;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  color: #333;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.item-price {
  color: #667eea;
  font-weight: 600;
  margin: 0;
}

.original-price {
  color: #6b7280;
  text-decoration: line-through;
  font-size: 12px;
  margin: 0;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.quantity-btn:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.quantity {
  min-width: 40px;
  text-align: center;
  font-weight: 600;
  color: #333;
}

.item-total {
  text-align: right;
}

.total-price {
  color: #333;
  font-weight: 700;
  font-size: 16px;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.remove-btn:hover {
  background: #fee;
}

.cart-summary {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 100px;
}

.cart-summary h3 {
  color: #333;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 24px 0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item.total {
  font-weight: 700;
  font-size: 18px;
  color: #333;
  border-top: 2px solid #e2e8f0;
  margin-top: 12px;
  padding-top: 16px;
}

.summary-item.discount {
  color: #e53e3e;
  font-weight: 500;
}

.cart-info {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.cart-info p {
  margin: 8px 0;
  font-size: 14px;
  color: #666;
}

.checkout-button {
  width: 100%;
  background: #667eea;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 24px;
  transition: all 0.2s ease;
}

.checkout-button:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-1px);
}

.checkout-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.clear-cart-button {
  width: 100%;
  background: #e53e3e;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 12px;
  transition: all 0.2s ease;
}

.clear-cart-button:hover {
  background: #c53030;
}

@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .cart-item {
    grid-template-columns: 60px 1fr;
    gap: 16px;
  }
  
  .item-quantity,
  .item-total,
  .remove-btn {
    grid-column: 2;
    justify-self: start;
  }
  
  .item-total {
    justify-self: end;
  }
  
  .remove-btn {
    justify-self: end;
    grid-row: 1;
  }
}
</style> 