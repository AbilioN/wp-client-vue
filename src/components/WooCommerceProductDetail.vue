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

    <!-- Seção de Comentários -->
    <div class="reviews-section">
      <h3>Avaliações e Comentários</h3>
      
      <div v-if="!authStore.isLoggedIn" class="login-to-review">
        <p>Faça login para deixar uma avaliação</p>
        <router-link to="/login" class="login-link">
          Ir para Login
        </router-link>
      </div>
      
      <div v-else class="review-form">
        <h4>Deixe sua avaliação</h4>
        <form @submit.prevent="submitReview" class="review-form-content">
          <div class="rating-input">
            <label>Avaliação:</label>
            <div class="stars">
              <button 
                v-for="star in 5" 
                :key="star"
                type="button"
                @click="reviewRating = star"
                class="star-button"
                :class="{ active: star <= reviewRating }"
              >
                ⭐
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label for="review-title">Título:</label>
            <input
              id="review-title"
              v-model="reviewForm.title"
              type="text"
              placeholder="Título da sua avaliação"
              required
              maxlength="100"
            />
          </div>
          
          <div class="form-group">
            <label for="review-content">Comentário:</label>
            <textarea
              id="review-content"
              v-model="reviewForm.content"
              placeholder="Conte sua experiência com este produto..."
              required
              rows="4"
              maxlength="1000"
            ></textarea>
            <span class="char-count">{{ reviewForm.content.length }}/1000</span>
          </div>
          
          <button type="submit" class="submit-review-btn" :disabled="submittingReview">
            <span v-if="submittingReview" class="loading-spinner"></span>
            {{ submittingReview ? 'Enviando...' : 'Enviar Avaliação' }}
          </button>
        </form>
      </div>
      
      <div class="reviews-list">
        <h4>Avaliações ({{ reviews.length }})</h4>
        
        <div v-if="loadingReviews" class="loading-reviews">
          <div class="loading-spinner"></div>
          <p>Carregando avaliações...</p>
        </div>
        
        <div v-else-if="reviews.length === 0" class="no-reviews">
          <p>Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
        </div>
        
                 <div v-else class="reviews-container">
           <div v-for="review in reviews" :key="review.id" class="review-item">
             <div class="review-header">
               <div class="reviewer-info">
                 <div class="reviewer-avatar" v-if="review.reviewer_avatar_urls">
                   <img :src="review.reviewer_avatar_urls['48']" :alt="review.reviewer" />
                 </div>
                 <div class="reviewer-details">
                   <span class="reviewer-name">{{ review.reviewer }}</span>
                   <div class="review-rating">
                     <span v-for="star in 5" :key="star" class="star" :class="{ filled: star <= review.rating }">
                       ⭐
                     </span>
                     <span class="rating-text">({{ review.rating }}/5)</span>
                   </div>
                 </div>
               </div>
               <span class="review-date">{{ formatDate(review.date_created) }}</span>
             </div>
             
             <div class="review-content" v-html="review.review"></div>
             
             <div class="review-footer">
               <div v-if="review.status" class="review-status" :class="review.status">
                 {{ getStatusText(review.status) }}
               </div>
               <div v-if="review.verified" class="verified-badge">
                 ✓ Compra Verificada
               </div>
             </div>
           </div>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'

// Configurar axios para não usar cache
axios.defaults.headers.common['Cache-Control'] = 'no-cache'
axios.defaults.headers.common['Pragma'] = 'no-cache'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const product = ref(null)
const selectedImage = ref(null)
const loading = ref(false)
const error = ref(null)
const reviews = ref([])
const loadingReviews = ref(false)
const submittingReview = ref(false)
const reviewRating = ref(5)
const reviewForm = ref({
  title: '',
  content: ''
})

const loadProduct = async () => {
  const productId = route.params.id
  
  if (!productId) {
    error.value = 'ID do produto não fornecido'
    return
  }

  loading.value = true
  error.value = null
  
  try {
    // Tentar primeiro sem autenticação
    let response = await axios.get(`${API_BASE_URL}/wc/v3/products/${productId}`)
    product.value = response.data
    
    // Definir imagem selecionada
    if (product.value.images && product.value.images.length > 0) {
      selectedImage.value = product.value.images[0]
    }
  } catch (err) {
    // Se falhar, tentar com autenticação
    if (err.response && err.response.status === 401 && authStore.token) {
      try {
        const config = {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        }
        response = await axios.get(`${API_BASE_URL}/wc/v3/products/${productId}`, config)
        product.value = response.data
        
        // Definir imagem selecionada
        if (product.value.images && product.value.images.length > 0) {
          selectedImage.value = product.value.images[0]
        }
      } catch (authErr) {
        error.value = 'Acesso não autorizado. Faça login para visualizar este produto.'
        console.error('Erro ao carregar produto com autenticação:', authErr)
      }
    } else if (err.response && err.response.status === 404) {
      error.value = 'Produto não encontrado'
    } else {
      error.value = 'Erro ao carregar produto: ' + (err.response && err.response.data && err.response.data.message || err.message)
      console.error('Erro ao carregar produto:', err)
    }
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

const getStatusText = (status) => {
  const statusMap = {
    'approved': 'Aprovada',
    'pending': 'Pendente',
    'spam': 'Spam',
    'trash': 'Lixeira'
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

const loadReviews = async () => {
  const productId = route.params.id
  
  if (!productId) return
  
  // Só carregar reviews se o usuário estiver logado e tiver token
  if (!authStore.isLoggedIn || !authStore.token) {
    reviews.value = []
    return
  }
  
  loadingReviews.value = true
  
  try {
    const config = {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    }
    
    const url = `${API_BASE_URL}/wc/v3/products/reviews&product=${productId}`
    
    const response = await axios.get(url, config)
    reviews.value = response.data || []
  } catch (err) {
    console.error('Erro ao carregar avaliações:', err)
    if (err.response && err.response.status === 401) {
      console.log('Token inválido para reviews')
    }
    reviews.value = []
  } finally {
    loadingReviews.value = false
  }
}

const submitReview = async () => {
  if (!reviewForm.value.title.trim() || !reviewForm.value.content.trim()) {
    alert('Por favor, preencha todos os campos')
    return
  }
  
  submittingReview.value = true
  
  try {
    // Configurar headers com Bearer Token
    const config = {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    }
    
    const response = await axios.post(`${API_BASE_URL}/wc/v3/products/reviews`, {
      product_id: parseInt(route.params.id),
      reviewer: authStore.userDisplayName || authStore.userEmail,
      reviewer_email: authStore.userEmail,
      rating: reviewRating.value,
      review: reviewForm.value.content,
      review_title: reviewForm.value.title
    }, config)
    
    // Limpar formulário
    reviewForm.value = {
      title: '',
      content: ''
    }
    reviewRating.value = 5
    
    // Recarregar reviews
    await loadReviews()
    
    alert('Avaliação enviada com sucesso!')
  } catch (err) {
    error.value = 'Erro ao enviar avaliação: ' + (err.response && err.response.data && err.response.data.message || err.message)
    console.error('Erro ao enviar avaliação:', err)
  } finally {
    submittingReview.value = false
  }
}

const goBack = () => {
  router.push('/products')
}

onMounted(() => {
  loadProduct()
  loadReviews()
})

// Recarregar reviews quando o status de autenticação mudar
watch(() => authStore.isLoggedIn, (isLoggedIn) => {
  if (isLoggedIn) {
    loadReviews()
  } else {
    reviews.value = []
  }
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

/* Estilos para a seção de comentários */
.reviews-section {
  margin-top: 40px;
  padding-top: 32px;
  border-top: 1px solid #e5e7eb;
}

.reviews-section h3 {
  color: #1f2937;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 24px 0;
}

.login-to-review {
  text-align: center;
  padding: 32px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.login-to-review p {
  color: #6b7280;
  margin: 0 0 16px 0;
}

.review-form {
  background: #f8fafc;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 32px;
  border: 1px solid #e2e8f0;
}

.review-form h4 {
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
}

.review-form-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.rating-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-input label {
  color: #374151;
  font-weight: 500;
  font-size: 14px;
}

.stars {
  display: flex;
  gap: 4px;
}

.star-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0.3;
}

.star-button.active {
  opacity: 1;
}

.star-button:hover {
  transform: scale(1.1);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}

.form-group label {
  color: #374151;
  font-weight: 500;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.char-count {
  position: absolute;
  bottom: -20px;
  right: 0;
  font-size: 12px;
  color: #6b7280;
}

.submit-review-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  align-self: flex-start;
}

.submit-review-btn:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-1px);
}

.submit-review-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.reviews-list h4 {
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
}

.loading-reviews {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  color: #6b7280;
}

.loading-reviews .loading-spinner {
  margin-bottom: 16px;
}

.no-reviews {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.reviews-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reviewer-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.reviewer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reviewer-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reviewer-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.star {
  font-size: 14px;
  opacity: 0.3;
}

.star.filled {
  opacity: 1;
}

.rating-text {
  font-size: 12px;
  color: #6b7280;
  margin-left: 4px;
}

.review-date {
  color: #6b7280;
  font-size: 12px;
}

.review-title {
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.review-content {
  color: #374151;
  line-height: 1.6;
  margin-bottom: 12px;
}

.review-content :deep(p) {
  margin: 0;
}

.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.review-status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.review-status.approved {
  background: #c6f6d5;
  color: #22543d;
}

.review-status.pending {
  background: #fef5e7;
  color: #744210;
}

.review-status.spam {
  background: #fed7d7;
  color: #742a2a;
}

.review-status.trash {
  background: #e2e8f0;
  color: #4a5568;
}

.verified-badge {
  background: #c6f6d5;
  color: #22543d;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
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
  
  .review-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .reviewer-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .reviewer-avatar {
    width: 40px;
    height: 40px;
  }
  
  .review-footer {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .review-form {
    padding: 16px;
  }
  
  .stars {
    justify-content: center;
  }
  
  .submit-review-btn {
    width: 100%;
  }
}
</style> 