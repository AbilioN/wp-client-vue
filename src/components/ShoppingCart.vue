<template>
  <div class="cart-container">
    <div class="cart-header">
      <h2>🛒 Seu Carrinho</h2>
      <p v-if="cartItems.length === 0">Seu carrinho está vazio</p>
    </div>

    <div v-if="cartItems.length === 0" class="empty-cart">
      <div class="empty-cart-icon">🛒</div>
      <h3>Carrinho Vazio</h3>
      <p>Adicione produtos ao seu carrinho para começar a comprar</p>
      <router-link to="/products" class="browse-products-button">
        Explorar Produtos
      </router-link>
    </div>

    <div v-else class="cart-content">
      <div class="cart-items">
        <div v-for="item in cartItems" :key="item.id" class="cart-item">
          <div class="item-image">
            <img 
              v-if="item.image" 
              :src="item.image" 
              :alt="item.name"
            />
            <div v-else class="no-image">📦</div>
          </div>
          
          <div class="item-details">
            <h3 class="item-name">{{ item.name }}</h3>
            <p class="item-price">R$ {{ formatPrice(item.price) }}</p>
          </div>
          
          <div class="item-quantity">
            <button @click="decreaseQuantity(item)" class="quantity-btn">-</button>
            <span class="quantity">{{ item.quantity }}</span>
            <button @click="increaseQuantity(item)" class="quantity-btn">+</button>
          </div>
          
          <div class="item-total">
            <span class="total-price">R$ {{ formatPrice(item.price * item.quantity) }}</span>
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
          <span>R$ {{ formatPrice(subtotal) }}</span>
        </div>
        
        <div class="summary-item">
          <span>Frete:</span>
          <span>R$ {{ formatPrice(shipping) }}</span>
        </div>
        
        <div class="summary-item total">
          <span>Total:</span>
          <span>R$ {{ formatPrice(total) }}</span>
        </div>
        
        <button @click="checkout" class="checkout-button">
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
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

// Mock do carrinho - em uma aplicação real, isso viria de um store
const cartItems = ref([
  {
    id: 1,
    name: 'Produto Exemplo',
    price: 29.99,
    quantity: 1,
    image: null
  }
])

const shipping = ref(10.00)

const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const total = computed(() => {
  return subtotal.value + shipping.value
})

const formatPrice = (price) => {
  return parseFloat(price).toFixed(2).replace('.', ',')
}

const increaseQuantity = (item) => {
  item.quantity++
}

const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    item.quantity--
  }
}

const removeItem = (item) => {
  const index = cartItems.value.indexOf(item)
  if (index > -1) {
    cartItems.value.splice(index, 1)
  }
}

const clearCart = () => {
  if (confirm('Tem certeza que deseja limpar o carrinho?')) {
    cartItems.value = []
  }
}

const checkout = () => {
  alert('Funcionalidade de checkout será implementada aqui!')
}
</script>

<style scoped>
.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.cart-header {
  text-align: center;
  margin-bottom: 40px;
}

.cart-header h2 {
  color: #333;
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.cart-header p {
  color: #666;
  margin: 0;
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

.checkout-button:hover {
  background: #5a67d8;
  transform: translateY(-1px);
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