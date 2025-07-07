<template>
  <div class="checkout-container">
    <div class="checkout-header">
      <h2>🛒 Finalizar Compra</h2>
      <button @click="goBack" class="back-button">
        ← Voltar ao Carrinho
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner large"></div>
      <p>Carregando métodos de pagamento...</p>
    </div>

    <div v-else class="checkout-content">
      <!-- Resumo do Carrinho -->
      <div class="cart-summary">
        <h3>Resumo do Pedido</h3>
        
        <div class="cart-items">
          <div v-if="!cart.items || cart.items.length === 0" class="empty-cart">
            <p>Nenhum item no carrinho</p>
          </div>
          <div v-else v-for="item in cart.items" :key="item.key" class="cart-item">
            <div class="item-image">
              <img 
                v-if="item.images && item.images.length > 0" 
                :src="item.images[0].src" 
                :alt="item.name"
              />
              <div v-else class="no-image">📦</div>
            </div>
            
            <div class="item-details">
              <h4 class="item-name">{{ item.name }}</h4>
              <p class="item-price">{{ formatPrice(item.prices.price) }}</p>
              <p class="item-quantity">Quantidade: {{ item.quantity }}</p>
            </div>
            
            <div class="item-total">
              <span class="total-price">{{ formatPrice(item.prices.price * item.quantity) }}</span>
            </div>
          </div>
        </div>

        <div class="order-summary">
          <div class="summary-item">
            <span>Subtotal:</span>
            <span>{{ formatPrice(cart.totals?.total_items || 0) }}</span>
          </div>
          
          <div v-if="cart.totals?.total_shipping" class="summary-item">
            <span>Frete:</span>
            <span>{{ formatPrice(cart.totals.total_shipping) }}</span>
          </div>
          
          <div v-if="cart.totals?.total_discount && cart.totals.total_discount !== '0'" class="summary-item discount">
            <span>Desconto:</span>
            <span>-{{ formatPrice(cart.totals.total_discount) }}</span>
          </div>
          
          <div class="summary-item total">
            <span>Total:</span>
            <span>{{ formatPrice(cart.totals?.total_price || 0) }}</span>
          </div>
        </div>
      </div>

      <!-- Seleção de Método de Pagamento -->
      <div class="payment-section">
        <h3>Método de Pagamento</h3>
        
        <div v-if="loadingPaymentMethods" class="loading-payment">
          <div class="loading-spinner"></div>
          <p>Carregando métodos de pagamento...</p>
        </div>
        
        <div v-else-if="enabledPaymentMethods.length === 0" class="no-payment-methods">
          <p>Nenhum método de pagamento habilitado no momento.</p>
          <p class="payment-note">Entre em contato com o administrador para ativar métodos de pagamento.</p>
        </div>
        
        <div v-else class="payment-methods">
          <div 
            v-for="method in paymentMethods" 
            :key="method.id" 
            class="payment-method"
            :class="{ 
              selected: selectedPaymentMethod === method.id,
              disabled: !method.enabled 
            }"
            @click="method.enabled ? selectPaymentMethod(method.id) : null"
          >
            <div class="payment-method-header">
              <input 
                type="radio" 
                :id="method.id" 
                :value="method.id" 
                v-model="selectedPaymentMethod"
                class="payment-radio"
              />
              <label :for="method.id" class="payment-label">
                <h4>
                  {{ method.title }}
                  <span v-if="!method.enabled" class="disabled-badge">Desabilitado</span>
                </h4>
                <p class="payment-description">{{ method.description }}</p>
              </label>
            </div>
            
            <div v-if="method.settings && method.settings.instructions && method.settings.instructions.value" 
                 class="payment-instructions">
              <p><strong>Instruções:</strong></p>
              <p v-html="method.settings.instructions.value"></p>
            </div>
          </div>
        </div>
      </div>

      <!-- Botão de Finalizar -->
      <div class="checkout-actions">
        <button 
          @click="processCheckout" 
          class="checkout-button"
          :disabled="!selectedPaymentMethod || processingCheckout || enabledPaymentMethods.length === 0"
        >
          <span v-if="processingCheckout" class="loading-spinner"></span>
          {{ 
            processingCheckout ? 'Processando...' : 
            enabledPaymentMethods.length === 0 ? 'Sem métodos de pagamento' : 
            'Finalizar Compra' 
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'

const router = useRouter()
const authStore = useAuthStore()

const cart = ref({ items: [], totals: { total_items: 0, total_price: 0, total_shipping: 0, total_discount: 0 } })
const paymentMethods = ref([])
const selectedPaymentMethod = ref('')
const loading = ref(false)
const loadingPaymentMethods = ref(false)
const processingCheckout = ref(false)
const error = ref(null)

const loadCart = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await axios.get(`${API_BASE_URL}/wc/store/v1/cart`)
    
    // Garantir que o carrinho tenha a estrutura correta
    cart.value = {
      items: response.data?.items || [],
      totals: response.data?.totals || { 
        total_items: 0, 
        total_price: 0, 
        total_shipping: 0, 
        total_discount: 0 
      }
    }
    
    // Atualizar o store com os dados do carrinho
    authStore.updateCart(response.data, response.headers)
  } catch (err) {
    console.error('Erro ao carregar carrinho:', err)
    // Manter o carrinho com valores padrão em caso de erro
    cart.value = {
      items: [],
      totals: { 
        total_items: 0, 
        total_price: 0, 
        total_shipping: 0, 
        total_discount: 0 
      }
    }
    error.value = 'Erro ao carregar carrinho: ' + (err.response?.data?.message || err.message)
  } finally {
    loading.value = false
  }
}

const loadPaymentMethods = async () => {
  loadingPaymentMethods.value = true
  
  try {
    const config = {}
    if (authStore.token) {
      config.headers = {
        'Authorization': `Bearer ${authStore.token}`
      }
    }
    
    const response = await axios.get(`${API_BASE_URL}/wc/v3/payment_gateways`, config)
    paymentMethods.value = response.data || []
  } catch (err) {
    console.error('Erro ao carregar métodos de pagamento:', err)
    error.value = 'Erro ao carregar métodos de pagamento'
  } finally {
    loadingPaymentMethods.value = false
  }
}

const enabledPaymentMethods = computed(() => {
  return paymentMethods.value.filter(method => method.enabled)
})

const selectPaymentMethod = (methodId) => {
  selectedPaymentMethod.value = methodId
}

const processCheckout = async () => {
  if (!selectedPaymentMethod.value) {
    alert('Por favor, selecione um método de pagamento')
    return
  }
  
  processingCheckout.value = true
  
  try {
    // TODO: Implementar processamento do checkout
    // Por enquanto, apenas simular o processo
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    alert('Pedido processado com sucesso!')
    // Redirecionar para página de sucesso ou limpar carrinho
    router.push('/')
  } catch (err) {
    error.value = 'Erro ao processar checkout: ' + (err.response && err.response.data && err.response.data.message || err.message)
    console.error('Erro ao processar checkout:', err)
  } finally {
    processingCheckout.value = false
  }
}

const formatPrice = (price) => {
  if (!price) return '€ 0,00'
  const numericPrice = parseFloat(price)
  return `€ ${numericPrice.toFixed(2).replace('.', ',')}`
}

const goBack = () => {
  router.push('/cart')
}

onMounted(() => {
  loadCart()
  loadPaymentMethods()
})
</script>

<style scoped>
.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.checkout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.checkout-header h2 {
  color: #333;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
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

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.cart-summary {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

.cart-summary h3 {
  color: #1f2937;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
}

.cart-items {
  margin-bottom: 24px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  background: #f8fafc;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 1.5rem;
  color: #cbd5e0;
}

.item-details {
  flex: 1;
}

.item-name {
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.item-price {
  color: #667eea;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.item-quantity {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

.item-total {
  font-weight: 600;
  color: #1f2937;
}

.order-summary {
  border-top: 1px solid #e5e7eb;
  padding-top: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
}

.summary-item.total {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  border-top: 1px solid #e5e7eb;
  padding-top: 12px;
  margin-top: 8px;
}

.summary-item.discount {
  color: #059669;
}

.payment-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

.payment-section h3 {
  color: #1f2937;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
}

.loading-payment {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  color: #6b7280;
}

.loading-payment .loading-spinner {
  margin-bottom: 16px;
}

.no-payment-methods {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.payment-note {
  font-size: 14px;
  color: #9ca3af;
  margin-top: 8px;
}

.empty-cart {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.payment-method {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-method:hover {
  border-color: #667eea;
  background: #f8fafc;
}

.payment-method.selected {
  border-color: #667eea;
  background: #f0f4ff;
}

.payment-method.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f8fafc;
}

.payment-method.disabled:hover {
  border-color: #e5e7eb;
  background: #f8fafc;
}

.disabled-badge {
  background: #ef4444;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  margin-left: 8px;
}

.payment-method-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.payment-radio {
  margin: 0;
  margin-top: 4px;
}

.payment-label {
  flex: 1;
  cursor: pointer;
}

.payment-label h4 {
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.payment-description {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.payment-instructions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
  font-size: 14px;
  color: #374151;
}

.payment-instructions p {
  margin: 4px 0;
}

.checkout-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.checkout-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
  justify-content: center;
}

.checkout-button:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.checkout-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .checkout-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .checkout-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .cart-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .item-image {
    width: 80px;
    height: 80px;
  }
  
  .payment-method-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style> 