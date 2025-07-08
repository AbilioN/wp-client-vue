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

      <!-- Formulários -->
      <div class="forms-column">
        <!-- Dados de Faturamento -->
        <div class="billing-section">
          <h3>Dados de Faturamento</h3>
          
          <div class="form-group">
            <label for="billing-first-name">Nome *</label>
            <input 
              type="text" 
              id="billing-first-name" 
              v-model="billingData.first_name" 
              required
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label for="billing-last-name">Sobrenome *</label>
            <input 
              type="text" 
              id="billing-last-name" 
              v-model="billingData.last_name" 
              required
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label for="billing-email">Email *</label>
            <input 
              type="email" 
              id="billing-email" 
              v-model="billingData.email" 
              required
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label for="billing-phone">Telefone *</label>
            <input 
              type="tel" 
              id="billing-phone" 
              v-model="billingData.phone" 
              required
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label for="billing-address">Endereço *</label>
            <input 
              type="text" 
              id="billing-address" 
              v-model="billingData.address_1" 
              required
              class="form-input"
            />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="billing-city">Cidade *</label>
              <input 
                type="text" 
                id="billing-city" 
                v-model="billingData.city" 
                required
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="billing-state">Estado/Província *</label>
              <input 
                type="text" 
                id="billing-state" 
                v-model="billingData.state" 
                required
                class="form-input"
              />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="billing-postcode">CEP *</label>
              <input 
                type="text" 
                id="billing-postcode" 
                v-model="billingData.postcode" 
                required
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="billing-country">País *</label>
              <select 
                id="billing-country" 
                v-model="billingData.country" 
                required
                class="form-input"
              >
                <option value="PT">Portugal</option>
                <option value="BR">Brasil</option>
                <option value="ES">Espanha</option>
                <option value="FR">França</option>
                <option value="DE">Alemanha</option>
                <option value="IT">Itália</option>
                <option value="GB">Reino Unido</option>
                <option value="US">Estados Unidos</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Dados de Entrega -->
        <div class="shipping-section">
          <h3>Dados de Entrega</h3>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="sameAsBilling"
                class="checkbox-input"
              />
              <span>Usar mesmo endereço de faturamento</span>
            </label>
          </div>
          
          <div v-if="!sameAsBilling">
            <div class="form-group">
              <label for="shipping-first-name">Nome *</label>
              <input 
                type="text" 
                id="shipping-first-name" 
                v-model="shippingData.first_name" 
                required
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="shipping-last-name">Sobrenome *</label>
              <input 
                type="text" 
                id="shipping-last-name" 
                v-model="shippingData.last_name" 
                required
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="shipping-address">Endereço *</label>
              <input 
                type="text" 
                id="shipping-address" 
                v-model="shippingData.address_1" 
                required
                class="form-input"
              />
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="shipping-city">Cidade *</label>
                <input 
                  type="text" 
                  id="shipping-city" 
                  v-model="shippingData.city" 
                  required
                  class="form-input"
                />
              </div>
              
              <div class="form-group">
                <label for="shipping-city">Estado/Província *</label>
                <input 
                  type="text" 
                  id="shipping-state" 
                  v-model="shippingData.state" 
                  required
                  class="form-input"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="shipping-postcode">CEP *</label>
                <input 
                  type="text" 
                  id="shipping-postcode" 
                  v-model="shippingData.postcode" 
                  required
                  class="form-input"
                />
              </div>
              
              <div class="form-group">
                <label for="shipping-country">País *</label>
                <select 
                  id="shipping-country" 
                  v-model="shippingData.country" 
                  required
                  class="form-input"
                >
                  <option value="PT">Portugal</option>
                  <option value="BR">Brasil</option>
                  <option value="ES">Espanha</option>
                  <option value="FR">França</option>
                  <option value="DE">Alemanha</option>
                  <option value="IT">Itália</option>
                  <option value="GB">Reino Unido</option>
                  <option value="US">Estados Unidos</option>
                </select>
              </div>
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
          
          <div v-if="paymentMethods.length === 0 && !loadingPaymentMethods" class="no-payment-methods">
            <p>Nenhum método de pagamento disponível no momento.</p>
            <p class="payment-note">Entre em contato com o administrador para ativar métodos de pagamento.</p>
          </div>
          
          <div v-else-if="paymentMethods.length > 0" class="payment-methods">
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

        <!-- Observações do Cliente -->
        <div class="notes-section">
          <h3>Observações do Pedido</h3>
          <div class="form-group">
            <label for="customer-notes">Observações (opcional)</label>
            <textarea 
              id="customer-notes" 
              v-model="customerNote" 
              class="form-textarea"
              placeholder="Adicione observações especiais para o seu pedido..."
              rows="4"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Botão de Finalizar -->
      <div class="checkout-actions">
        <button 
          @click="processCheckout" 
          class="checkout-button"
          :disabled="!canProcessCheckout || processingCheckout"
        >
          <span v-if="processingCheckout" class="loading-spinner"></span>
          {{ 
            processingCheckout ? 'Processando Pedido...' : 
            !canProcessCheckout ? 'Preencha todos os campos obrigatórios' : 
            'Finalizar Compra' 
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
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

// Dados de faturamento
const billingData = ref({
  first_name: '',
  last_name: '',
  address_1: '',
  city: '',
  state: '',
  postcode: '',
  country: 'PT',
  email: '',
  phone: ''
})

// Dados de entrega
const shippingData = ref({
  first_name: '',
  last_name: '',
  address_1: '',
  city: '',
  state: '',
  postcode: '',
  country: 'PT'
})

const sameAsBilling = ref(true)
const customerNote = ref('')

// Computed para verificar se pode processar o checkout
const canProcessCheckout = computed(() => {
  if (!selectedPaymentMethod.value) return false
  
  // Verificar dados de faturamento obrigatórios
  const requiredBillingFields = ['first_name', 'last_name', 'address_1', 'city', 'state', 'postcode', 'country', 'email', 'phone']
  const billingComplete = requiredBillingFields.every(field => billingData.value[field]?.trim())
  
  if (!billingComplete) return false
  
  // Se não usar mesmo endereço, verificar dados de entrega
  if (!sameAsBilling.value) {
    const requiredShippingFields = ['first_name', 'last_name', 'address_1', 'city', 'state', 'postcode', 'country']
    const shippingComplete = requiredShippingFields.every(field => shippingData.value[field]?.trim())
    if (!shippingComplete) return false
  }
  
  return true
})

// Sincronizar dados de entrega com faturamento quando sameAsBilling for true
watch(sameAsBilling, (newValue) => {
  if (newValue) {
    shippingData.value = {
      first_name: billingData.value.first_name,
      last_name: billingData.value.last_name,
      address_1: billingData.value.address_1,
      city: billingData.value.city,
      state: billingData.value.state,
      postcode: billingData.value.postcode,
      country: billingData.value.country
    }
  }
})

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
    
    // Usar URL completa para métodos de pagamento
    const paymentUrl = 'http://localhost:8080/index.php?rest_route=/wc/v3/payment_gateways'
    const response = await axios.get(paymentUrl, config)
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
  if (!canProcessCheckout.value) {
    alert('Por favor, preencha todos os campos obrigatórios')
    return
  }
  
  processingCheckout.value = true
  error.value = null
  
  try {
    // Obter o método de pagamento selecionado
    const selectedMethod = paymentMethods.value.find(method => method.id === selectedPaymentMethod.value)
    if (!selectedMethod) {
      throw new Error('Método de pagamento não encontrado')
    }
    
    // Preparar dados de entrega (usar dados de faturamento se sameAsBilling for true)
    const finalShippingData = sameAsBilling.value ? {
      first_name: billingData.value.first_name,
      last_name: billingData.value.last_name,
      address_1: billingData.value.address_1,
      city: billingData.value.city,
      state: billingData.value.state,
      postcode: billingData.value.postcode,
      country: billingData.value.country
    } : shippingData.value
    
    // Preparar line_items do carrinho
    const lineItems = cart.value.items.map(item => ({
      product_id: item.id,
      quantity: item.quantity
    }))
    
    // Preparar payload do pedido
    const orderData = {
      payment_method: selectedPaymentMethod.value,
      payment_method_title: selectedMethod.title,
      set_paid: false,
      billing: billingData.value,
      shipping: finalShippingData,
      line_items: lineItems,
      customer_note: customerNote.value || ''
    }
    
    console.log('Enviando pedido:', orderData)
    
    // Fazer requisição para criar o pedido
    const config = {
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    }
    
    const orderUrl = 'http://localhost:8080/index.php?rest_route=/wc/v3/orders'
    const response = await axios.post(orderUrl, orderData, config)
    
    console.log('Pedido criado com sucesso:', response.data)
    
    // Limpar carrinho após sucesso
    await clearCart()
    
    // Redirecionar para página de sucesso
    alert(`Pedido #${response.data.id} criado com sucesso!`)
    router.push('/')
    
  } catch (err) {
    console.error('Erro ao processar checkout:', err)
    error.value = 'Erro ao processar checkout: ' + (err.response?.data?.message || err.message)
  } finally {
    processingCheckout.value = false
  }
}

const clearCart = async () => {
  try {
    // Limpar carrinho via API
    await axios.delete(`${API_BASE_URL}/wc/store/v1/cart/items`)
    // Atualizar store
    authStore.updateCart({ items: [], totals: { total_items: 0, total_price: 0, total_shipping: 0, total_discount: 0 } })
  } catch (err) {
    console.error('Erro ao limpar carrinho:', err)
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
  gap: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.checkout-content > * {
  min-width: 0;
}

.forms-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.forms-column > * {
  margin-bottom: 0;
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

.billing-section, .shipping-section, .notes-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

.billing-section h3, .shipping-section h3, .notes-section h3 {
  color: #1f2937;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input, .form-textarea, .form-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  color: #374151;
  transition: all 0.2s ease;
}

.form-input:focus, .form-textarea:focus, .form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.form-row .form-group {
  flex: 1;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  padding-top: 12px;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%234b5563'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 1.5em;
  padding-right: 3.5em;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4b5563;
  cursor: pointer;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  accent-color: #667eea;
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

.notes-section {
  margin-top: 0;
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

  .form-row {
    flex-direction: column;
    gap: 16px;
  }

  .form-row .form-group {
    flex: none;
  }
}
</style> 