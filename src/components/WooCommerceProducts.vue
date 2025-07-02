<template>
  <div class="products-container">
    <div class="products-header">
      <h2>Nossos Produtos</h2>
      <div class="header-actions">
        <div class="search-box">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Buscar produtos..."
            @input="filterProducts"
          />
          <span class="search-icon">🔍</span>
        </div>
        <button @click="loadProducts" class="refresh-button" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Carregando...' : 'Atualizar' }}
        </button>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="loading && products.length === 0" class="loading-container">
      <div class="loading-spinner large"></div>
      <p>Carregando produtos...</p>
    </div>

    <div v-else-if="filteredProducts.length === 0" class="empty-state">
      <p>{{ searchTerm ? 'Nenhum produto encontrado para sua busca' : 'Nenhum produto disponível' }}</p>
    </div>

    <div v-else class="products-grid">
      <div v-for="product in filteredProducts" :key="product.id" class="product-card">
        <div class="product-image">
          <img 
            v-if="product.images && product.images.length > 0" 
            :src="product.images[0].src" 
            :alt="product.name"
            @error="handleImageError"
          />
          <div v-else class="no-image">
            <span>📦</span>
          </div>
        </div>
        
        <div class="product-info">
          <h3 class="product-name">{{ product.name }}</h3>
          
          <div class="product-price">
            <span v-if="product.on_sale" class="original-price">
              € {{ formatPrice(product.regular_price) }}
            </span>
            <span class="current-price">
              € {{ formatPrice(product.price) }}
            </span>
            <span v-if="product.on_sale" class="sale-badge">Oferta!</span>
          </div>
          
          <div class="product-description" v-html="product.short_description || product.description"></div>
          
          <div class="product-meta">
            <span class="product-sku" v-if="product.sku">SKU: {{ product.sku }}</span>
            <span class="product-category" v-if="product.categories && product.categories.length > 0">
              {{ product.categories[0].name }}
            </span>
            <span class="product-status" :class="product.status">{{ product.status }}</span>
          </div>
          
          <div class="product-actions">
            <a :href="product.permalink" target="_blank" class="view-button">
              Ver no Site
            </a>
            <button 
              v-if="authStore.isLoggedIn" 
              @click="addToCart(product)" 
              class="add-to-cart-button"
              :disabled="!product.purchasable"
            >
              🛒 Adicionar
            </button>
            <router-link v-else to="/login" class="login-to-buy">
              🔐 Login para Comprar
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div v-if="products.length > 0" class="products-footer">
      <p>Mostrando {{ filteredProducts.length }} de {{ products.length }} produtos</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/index.php?rest_route='

const authStore = useAuthStore()
const products = ref([])
const filteredProducts = ref([])
const searchTerm = ref('')
const loading = ref(false)
const error = ref(null)

const loadProducts = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Usar a API do WooCommerce com autenticação Bearer token
    const response = await axios.get(`${API_BASE_URL}/wc/v3/products`)
    products.value = response.data
    filteredProducts.value = response.data
  } catch (err) {
    error.value = 'Erro ao carregar produtos: ' + (err.response && err.response.data && err.response.data.message || err.message)
    console.error('Erro ao carregar produtos:', err)
  } finally {
    loading.value = false
  }
}

const filterProducts = () => {
  if (!searchTerm.value.trim()) {
    filteredProducts.value = products.value
    return
  }
  
  const term = searchTerm.value.toLowerCase()
  filteredProducts.value = products.value.filter(product => 
    product.name.toLowerCase().includes(term) ||
    product.description.toLowerCase().includes(term) ||
    product.short_description.toLowerCase().includes(term) ||
    (product.sku && product.sku.toLowerCase().includes(term))
  )
}

const formatPrice = (price) => {
  if (!price) return '0,00'
  return parseFloat(price).toFixed(2).replace('.', ',')
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
  if (event.target.nextElementSibling) {
    event.target.nextElementSibling.style.display = 'flex'
  }
}

const addToCart = async (product) => {
  if (!product.purchasable) {
    alert('Este produto não está disponível para compra')
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    await axios.post(`${API_BASE_URL}/wc/store/v1/cart/add-item`, {
      id: product.id,
      quantity: 1
    })
    
    alert(`Produto "${product.name}" adicionado ao carrinho!`)
  } catch (err) {
    error.value = 'Erro ao adicionar ao carrinho: ' + (err.response && err.response.data && err.response.data.message || err.message)
    console.error('Erro ao adicionar ao carrinho:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.products-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 20px;
}

.products-header h2 {
  color: #333;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box input {
  padding: 12px 40px 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  width: 250px;
  transition: border-color 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #667eea;
}

.search-icon {
  position: absolute;
  right: 12px;
  color: #666;
  font-size: 16px;
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

.loading-spinner {
  width: 20px;
  height: 20px;
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

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid #f0f0f0;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.product-image {
  height: 200px;
  overflow: hidden;
  position: relative;
  background: #f8fafc;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 3rem;
  color: #cbd5e0;
}

.product-info {
  padding: 20px;
}

.product-name {
  color: #333;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.original-price {
  color: #666;
  text-decoration: line-through;
  font-size: 14px;
}

.current-price {
  color: #667eea;
  font-size: 20px;
  font-weight: 700;
}

.sale-badge {
  background: #e53e3e;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.product-description {
  color: #555;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
  max-height: 60px;
  overflow: hidden;
}

.product-description :deep(p) {
  margin: 0;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 12px;
}

.product-sku {
  color: #666;
  font-family: 'Courier New', monospace;
}

.product-category {
  color: #667eea;
  font-weight: 500;
  font-size: 12px;
}

.product-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.product-status.publish {
  background: #c6f6d5;
  color: #22543d;
}

.product-actions {
  display: flex;
  gap: 8px;
}

.view-button,
.add-to-cart-button,
.login-to-buy {
  flex: 1;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  text-align: center;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.view-button {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.view-button:hover {
  background: #edf2f7;
}

.add-to-cart-button {
  background: #667eea;
  color: white;
}

.add-to-cart-button:hover:not(:disabled) {
  background: #5a67d8;
}

.add-to-cart-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-to-buy {
  background: #e53e3e;
  color: white;
}

.login-to-buy:hover {
  background: #c53030;
}

.products-footer {
  text-align: center;
  color: #666;
  font-size: 14px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
  .products-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    flex-direction: column;
  }
  
  .search-box input {
    width: 100%;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style> 