<template>
  <div class="product-detail-container">
    <div class="product-detail-header">
      <button @click="goBack" class="back-button">
        ← Voltar aos Produtos
      </button>
      <button @click="loadProduct" class="refresh-button" :disabled="loading">
        <span v-if="loading" class="loading-spinner"></span>
        {{ loading ? 'Carregando...' : 'Atualizar' }}
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="loading && !product" class="loading-container">
      <div class="loading-spinner large"></div>
      <p>Carregando produto...</p>
    </div>

    <div v-else-if="!product && !authStore.isLoggedIn" class="empty-state">
      <p>Faça login para visualizar os detalhes do produto</p>
      <router-link to="/login" class="login-link">
        Ir para Login
      </router-link>
    </div>
    
    <div v-else-if="!product" class="empty-state">
      <p>Produto não encontrado</p>
    </div>

    <div v-else class="product-detail-content">
      <div class="product-layout">
        <!-- Galeria de Imagens -->
        <div class="product-gallery">
          <div v-if="product.images && product.images.length > 0" class="main-image">
            <img :src="selectedImage.src" :alt="product.name" />
          </div>
          <div v-else class="no-image">
            <span>📦</span>
            <p>Sem imagem</p>
          </div>
          
          <div v-if="product.images && product.images.length > 1" class="image-thumbnails">
            <button 
              v-for="image in product.images" 
              :key="image.id"
              @click="selectedImage = image"
              class="thumbnail"
              :class="{ active: selectedImage.id === image.id }"
            >
              <img :src="image.src" :alt="image.name || product.name" />
            </button>
          </div>
        </div>

        <!-- Informações do Produto -->
        <div class="product-info">
          <h1 class="product-title">{{ product.name }}</h1>
          
          <div class="product-price-section">
            <div class="price-display">
              <span v-if="product.on_sale" class="original-price">
                € {{ formatPrice(product.regular_price) }}
              </span>
              <span class="current-price">
                € {{ formatPrice(product.price) }}
              </span>
              <span v-if="product.on_sale" class="sale-badge">Oferta!</span>
            </div>
            
            <div class="price-html" v-html="product.price_html"></div>
          </div>

          <div class="product-description" v-html="product.description"></div>
          
          <div class="product-short-description" v-if="product.short_description" v-html="product.short_description"></div>

          <div class="product-details">
            <div class="detail-item">
              <label>SKU:</label>
              <span>{{ product.sku || 'N/A' }}</span>
            </div>
            
            <div class="detail-item">
              <label>Categoria:</label>
              <span v-if="product.categories && product.categories.length > 0">
                {{ product.categories.map(cat => cat.name).join(', ') }}
              </span>
              <span v-else>N/A</span>
            </div>
            
            <div class="detail-item">
              <label>Status:</label>
              <span class="status-badge" :class="product.status">{{ product.status }}</span>
            </div>
            
            <div class="detail-item">
              <label>Estoque:</label>
              <span class="stock-status" :class="product.stock_status">
                {{ getStockStatusText(product.stock_status) }}
              </span>
            </div>
            
            <div class="detail-item" v-if="product.manage_stock">
              <label>Quantidade em Estoque:</label>
              <span>{{ product.stock_quantity || 0 }}</span>
            </div>
            
            <div class="detail-item">
              <label>Tipo:</label>
              <span>{{ product.type }}</span>
            </div>
            
            <div class="detail-item" v-if="product.weight">
              <label>Peso:</label>
              <span>{{ product.weight }} kg</span>
            </div>
            
            <div class="detail-item" v-if="product.dimensions">
              <label>Dimensões:</label>
              <span>
                {{ product.dimensions.length || 0 }} × 
                {{ product.dimensions.width || 0 }} × 
                {{ product.dimensions.height || 0 }} cm
              </span>
            </div>
          </div>

          <div class="product-actions">
            <a :href="product.permalink" target="_blank" class="view-external">
              Ver no Site →
            </a>
            
            <button 
              v-if="authStore.isLoggedIn && product.purchasable" 
              @click="addToCart(product)" 
              class="add-to-cart"
              :disabled="product.stock_status !== 'instock'"
            >
              🛒 Adicionar ao Carrinho
            </button>
            
            <router-link v-else-if="!authStore.isLoggedIn" to="/login" class="login-to-buy">
              🔐 Login para Comprar
            </router-link>
            
            <span v-else-if="!product.purchasable" class="not-purchasable">
              Produto não disponível para compra
            </span>
          </div>
        </div>
      </div>

      <!-- Informações Adicionais -->
      <div class="additional-info">
        <div class="info-section">
          <h3>Informações Técnicas</h3>
          <div class="tech-details">
            <div class="tech-item">
              <label>Data de Criação:</label>
              <span>{{ formatDate(product.date_created) }}</span>
            </div>
            <div class="tech-item">
              <label>Última Modificação:</label>
              <span>{{ formatDate(product.date_modified) }}</span>
            </div>
            <div class="tech-item">
              <label>Total de Vendas:</label>
              <span>{{ product.total_sales }}</span>
            </div>
            <div class="tech-item">
              <label>Avaliação Média:</label>
              <span>{{ product.average_rating }} ({{ product.rating_count }} avaliações)</span>
            </div>
          </div>
        </div>

        <div class="info-section" v-if="product.attributes && product.attributes.length > 0">
          <h3>Atributos</h3>
          <div class="attributes-list">
            <div v-for="attr in product.attributes" :key="attr.id" class="attribute-item">
              <strong>{{ attr.name }}:</strong>
              <span>{{ attr.options.join(', ') }}</span>
            </div>
          </div>
        </div>

        <div class="info-section" v-if="product.tags && product.tags.length > 0">
          <h3>Tags</h3>
          <div class="tags-list">
            <span v-for="tag in product.tags" :key="tag.id" class="tag">
              {{ tag.name }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const product = ref(null)
const selectedImage = ref(null)
const loading = ref(false)
const error = ref(null)

const loadProduct = async () => {
  const productId = route.params.id
  
  if (!productId) {
    error.value = 'ID do produto não fornecido'
    return
  }

  loading.value = true
  error.value = null
  
  try {
    // Configurar headers com Bearer Token se disponível
    const config = {}
    if (authStore.token) {
      config.headers = {
        'Authorization': `Bearer ${authStore.token}`
      }
    }
    
    const response = await axios.get(`${API_BASE_URL}/wc/v3/products/${productId}`, config)
    product.value = response.data
    
    // Definir imagem selecionada
    if (product.value.images && product.value.images.length > 0) {
      selectedImage.value = product.value.images[0]
    }
  } catch (err) {
    if (err.response && err.response.status === 404) {
      error.value = 'Produto não encontrado'
    } else if (err.response && err.response.status === 401) {
      error.value = 'Acesso não autorizado. Faça login para visualizar este produto.'
    } else {
      error.value = 'Erro ao carregar produto: ' + (err.response && err.response.data && err.response.data.message || err.message)
    }
    console.error('Erro ao carregar produto:', err)
  } finally {
    loading.value = false
  }
}

const formatPrice = (price) => {
  if (!price) return '0,00'
  return parseFloat(price).toFixed(2).replace('.', ',')
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStockStatusText = (status) => {
  const statusMap = {
    'instock': 'Em Estoque',
    'outofstock': 'Fora de Estoque',
    'onbackorder': 'Sob Encomenda'
  }
  return statusMap[status] || status
}

const addToCart = async (product) => {
  if (!product.purchasable) {
    alert('Este produto não está disponível para compra')
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    const response = await authStore.requestWithNonce('POST', `${API_BASE_URL}/wc/store/v1/cart/add-item`, {
      id: product.id,
      quantity: 1
    })
    
    // Atualizar o store com os dados do carrinho
    authStore.updateCart(response.data, response.headers)
    
    alert(`Produto "${product.name}" adicionado ao carrinho!`)
  } catch (err) {
    error.value = 'Erro ao adicionar ao carrinho: ' + (err.response && err.response.data && err.response.data.message || err.message)
    console.error('Erro ao adicionar ao carrinho:', err)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/products')
}

onMounted(() => {
  loadProduct()
})
</script>

<style scoped>
.product-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.product-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.back-button {
  background: #6b7280;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: #4b5563;
  transform: translateY(-1px);
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

.product-detail-content {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

.product-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.product-gallery {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.main-image {
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: #f8fafc;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 12px;
  color: #cbd5e0;
  font-size: 3rem;
}

.no-image p {
  margin: 8px 0 0 0;
  font-size: 14px;
  color: #666;
}

.image-thumbnails {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.thumbnail {
  width: 60px;
  height: 60px;
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  background: none;
  padding: 0;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail.active {
  border-color: #667eea;
}

.thumbnail:hover {
  border-color: #5a67d8;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.product-title {
  color: #1f2937;
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
}

.product-price-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.price-display {
  display: flex;
  align-items: center;
  gap: 12px;
}

.original-price {
  color: #6b7280;
  text-decoration: line-through;
  font-size: 18px;
}

.current-price {
  color: #667eea;
  font-size: 28px;
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

.price-html {
  color: #6b7280;
  font-size: 14px;
}

.product-description,
.product-short-description {
  color: #374151;
  font-size: 16px;
  line-height: 1.7;
}

.product-description :deep(p),
.product-short-description :deep(p) {
  margin: 0 0 16px 0;
}

.product-description :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 16px 0;
}

.product-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item label {
  color: #6b7280;
  font-weight: 500;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item span {
  color: #374151;
  font-size: 14px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  display: inline-block;
  width: fit-content;
}

.status-badge.publish {
  background: #c6f6d5;
  color: #22543d;
}

.stock-status {
  font-weight: 500;
}

.stock-status.instock {
  color: #38a169;
}

.stock-status.outofstock {
  color: #e53e3e;
}

.stock-status.onbackorder {
  color: #d69e2e;
}

.product-actions {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}

.view-external,
.add-to-cart,
.login-to-buy,
.not-purchasable {
  flex: 1;
  padding: 16px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  text-align: center;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.view-external {
  background: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.view-external:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.add-to-cart {
  background: #667eea;
  color: white;
}

.add-to-cart:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-1px);
}

.add-to-cart:disabled {
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

.not-purchasable {
  background: #f7fafc;
  color: #6b7280;
  cursor: not-allowed;
}

.login-link {
  display: inline-block;
  background: #667eea;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  margin-top: 16px;
  transition: all 0.2s ease;
}

.login-link:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

.additional-info {
  border-top: 1px solid #e5e7eb;
  padding-top: 32px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
}

.info-section h3 {
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.tech-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tech-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.tech-item:last-child {
  border-bottom: none;
}

.tech-item label {
  color: #6b7280;
  font-weight: 500;
  font-size: 14px;
}

.tech-item span {
  color: #374151;
  font-size: 14px;
}

.attributes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attribute-item {
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
  font-size: 14px;
}

.attribute-item strong {
  color: #374151;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: #e2e8f0;
  color: #4a5568;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .product-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .product-detail-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .product-title {
    font-size: 24px;
  }
  
  .product-details {
    grid-template-columns: 1fr;
  }
  
  .product-actions {
    flex-direction: column;
  }
  
  .additional-info {
    grid-template-columns: 1fr;
  }
}
</style> 