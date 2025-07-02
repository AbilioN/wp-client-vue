<template>
  <div class="cart-test-container">
    <div class="cart-test-header">
      <h2>🧪 Teste do Carrinho WooCommerce</h2>
      <p>Teste as funcionalidades do carrinho usando a Store API</p>
    </div>

    <div class="test-sections">
      <!-- Seção 1: Status do Carrinho -->
      <div class="test-section">
        <h3>📊 Status do Carrinho</h3>
        <div class="test-actions">
          <button @click="getCartStatus" class="test-button" :disabled="loading">
            {{ loading ? 'Carregando...' : 'Ver Status' }}
          </button>
        </div>
        
        <div v-if="cartStatus" class="test-result">
          <h4>Dados do Carrinho:</h4>
          <div class="status-grid">
            <div class="status-item">
              <strong>Itens:</strong> {{ cartStatus.items_count }}
            </div>
            <div class="status-item">
              <strong>Peso:</strong> {{ cartStatus.items_weight }}kg
            </div>
            <div class="status-item">
              <strong>Total:</strong> {{ cartStatus.totals.total_price }}
            </div>
            <div class="status-item">
              <strong>Moeda:</strong> {{ cartStatus.totals.currency_code }}
            </div>
          </div>
          
          <div v-if="cartStatus.items.length > 0" class="cart-items">
            <h4>Itens no Carrinho:</h4>
            <div v-for="item in cartStatus.items" :key="item.key" class="cart-item">
              <span>{{ item.name }} (Qtd: {{ item.quantity }})</span>
              <span>{{ item.prices.price }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Seção 2: Adicionar Produto -->
      <div class="test-section">
        <h3>➕ Adicionar Produto</h3>
        <div class="test-form">
          <div class="form-group">
            <label>ID do Produto:</label>
            <input v-model="addProductForm.id" type="number" placeholder="Ex: 123" />
          </div>
          <div class="form-group">
            <label>Quantidade:</label>
            <input v-model="addProductForm.quantity" type="number" min="1" value="1" />
          </div>
          <button @click="addProductToCart" class="test-button" :disabled="loading">
            {{ loading ? 'Adicionando...' : 'Adicionar ao Carrinho' }}
          </button>
        </div>
        
        <div v-if="addResult" class="test-result">
          <h4>Resultado:</h4>
          <pre>{{ JSON.stringify(addResult, null, 2) }}</pre>
        </div>
      </div>

      <!-- Seção 3: Atualizar Quantidade -->
      <div class="test-section">
        <h3>✏️ Atualizar Quantidade</h3>
        <div class="test-form">
          <div class="form-group">
            <label>Key do Item:</label>
            <input v-model="updateForm.key" type="text" placeholder="Ex: abc123" />
          </div>
          <div class="form-group">
            <label>Nova Quantidade:</label>
            <input v-model="updateForm.quantity" type="number" min="1" />
          </div>
          <button @click="updateItemQuantity" class="test-button" :disabled="loading">
            {{ loading ? 'Atualizando...' : 'Atualizar' }}
          </button>
        </div>
        
        <div v-if="updateResult" class="test-result">
          <h4>Resultado:</h4>
          <pre>{{ JSON.stringify(updateResult, null, 2) }}</pre>
        </div>
      </div>

      <!-- Seção 4: Remover Item -->
      <div class="test-section">
        <h3>🗑️ Remover Item</h3>
        <div class="test-form">
          <div class="form-group">
            <label>Key do Item:</label>
            <input v-model="removeForm.key" type="text" placeholder="Ex: abc123" />
          </div>
          <button @click="removeItemFromCart" class="test-button" :disabled="loading">
            {{ loading ? 'Removendo...' : 'Remover Item' }}
          </button>
        </div>
        
        <div v-if="removeResult" class="test-result">
          <h4>Resultado:</h4>
          <pre>{{ JSON.stringify(removeResult, null, 2) }}</pre>
        </div>
      </div>

      <!-- Seção 5: Limpar Carrinho -->
      <div class="test-section">
        <h3>🧹 Limpar Carrinho</h3>
        <div class="test-actions">
          <button @click="clearCart" class="test-button danger" :disabled="loading">
            {{ loading ? 'Limpando...' : 'Limpar Tudo' }}
          </button>
        </div>
        
        <div v-if="clearResult" class="test-result">
          <h4>Resultado:</h4>
          <pre>{{ JSON.stringify(clearResult, null, 2) }}</pre>
        </div>
      </div>

      <!-- Seção 6: Aplicar Cupom -->
      <div class="test-section">
        <h3>🎫 Aplicar Cupom</h3>
        <div class="test-form">
          <div class="form-group">
            <label>Código do Cupom:</label>
            <input v-model="couponForm.code" type="text" placeholder="Ex: DESCONTO10" />
          </div>
          <button @click="applyCoupon" class="test-button" :disabled="loading">
            {{ loading ? 'Aplicando...' : 'Aplicar Cupom' }}
          </button>
        </div>
        
        <div v-if="couponResult" class="test-result">
          <h4>Resultado:</h4>
          <pre>{{ JSON.stringify(couponResult, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/index.php?rest_route='

const loading = ref(false)
const error = ref(null)

// Estados dos formulários
const addProductForm = ref({ id: '', quantity: 1 })
const updateForm = ref({ key: '', quantity: 1 })
const removeForm = ref({ key: '' })
const couponForm = ref({ code: '' })

// Resultados
const cartStatus = ref(null)
const addResult = ref(null)
const updateResult = ref(null)
const removeResult = ref(null)
const clearResult = ref(null)
const couponResult = ref(null)

const getCartStatus = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await axios.get(`${API_BASE_URL}/wc/store/v1/cart`)
    cartStatus.value = response.data
  } catch (err) {
    error.value = 'Erro ao obter status do carrinho: ' + (err.response && err.response.data && err.response.data.message || err.message)
    console.error('Erro ao obter status do carrinho:', err)
  } finally {
    loading.value = false
  }
}

const addProductToCart = async () => {
  if (!addProductForm.value.id) {
    error.value = 'Por favor, informe o ID do produto'
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    const response = await axios.post(`${API_BASE_URL}/wc/store/v1/cart/add-item`, {
      id: parseInt(addProductForm.value.id),
      quantity: parseInt(addProductForm.value.quantity)
    })
    addResult.value = response.data
    
    // Atualizar status do carrinho
    await getCartStatus()
  } catch (err) {
    error.value = 'Erro ao adicionar produto: ' + (err.response && err.response.data && err.response.data.message || err.message)
    console.error('Erro ao adicionar produto:', err)
  } finally {
    loading.value = false
  }
}

const updateItemQuantity = async () => {
  if (!updateForm.value.key || !updateForm.value.quantity) {
    error.value = 'Por favor, informe a key do item e a nova quantidade'
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    const response = await axios.post(`${API_BASE_URL}/wc/store/v1/cart/update-item`, {
      key: updateForm.value.key,
      quantity: parseInt(updateForm.value.quantity)
    })
    updateResult.value = response.data
    
    // Atualizar status do carrinho
    await getCartStatus()
  } catch (err) {
    error.value = 'Erro ao atualizar quantidade: ' + (err.response && err.response.data && err.response.data.message || err.message)
    console.error('Erro ao atualizar quantidade:', err)
  } finally {
    loading.value = false
  }
}

const removeItemFromCart = async () => {
  if (!removeForm.value.key) {
    error.value = 'Por favor, informe a key do item'
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    const response = await axios.post(`${API_BASE_URL}/wc/store/v1/cart/remove-item`, {
      key: removeForm.value.key
    })
    removeResult.value = response.data
    
    // Atualizar status do carrinho
    await getCartStatus()
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
    const response = await axios.post(`${API_BASE_URL}/wc/store/v1/cart/remove-items`)
    clearResult.value = response.data
    
    // Atualizar status do carrinho
    await getCartStatus()
  } catch (err) {
    error.value = 'Erro ao limpar carrinho: ' + (err.response && err.response.data && err.response.data.message || err.message)
    console.error('Erro ao limpar carrinho:', err)
  } finally {
    loading.value = false
  }
}

const applyCoupon = async () => {
  if (!couponForm.value.code) {
    error.value = 'Por favor, informe o código do cupom'
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    const response = await axios.post(`${API_BASE_URL}/wc/store/v1/cart/apply-coupon`, {
      code: couponForm.value.code
    })
    couponResult.value = response.data
    
    // Atualizar status do carrinho
    await getCartStatus()
  } catch (err) {
    error.value = 'Erro ao aplicar cupom: ' + (err.response && err.response.data && err.response.data.message || err.message)
    console.error('Erro ao aplicar cupom:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.cart-test-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.cart-test-header {
  text-align: center;
  margin-bottom: 40px;
}

.cart-test-header h2 {
  color: #333;
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.cart-test-header p {
  color: #666;
  margin: 0;
}

.test-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.test-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

.test-section h3 {
  color: #333;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
}

.test-actions {
  margin-bottom: 20px;
}

.test-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  color: #333;
  font-weight: 500;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.test-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.test-button:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-1px);
}

.test-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.test-button.danger {
  background: #e53e3e;
}

.test-button.danger:hover:not(:disabled) {
  background: #c53030;
}

.test-result {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.test-result h4 {
  color: #333;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.test-result pre {
  background: #2d3748;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  overflow-x: auto;
  margin: 0;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.status-item {
  background: white;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.status-item strong {
  color: #333;
}

.cart-items {
  margin-top: 20px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.cart-item:last-child {
  border-bottom: none;
}

.error-message {
  background-color: #fee;
  color: #c53030;
  padding: 16px;
  border-radius: 8px;
  margin-top: 24px;
  border: 1px solid #feb2b2;
}

@media (max-width: 768px) {
  .test-sections {
    grid-template-columns: 1fr;
  }
  
  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style> 