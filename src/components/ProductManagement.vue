<template>
  <div class="product-management-container">
    <div class="management-header">
      <h2>Gerenciamento de Produtos</h2>
      <button @click="showCreateForm = true" class="create-button">
        <span>➕</span>
        Criar Produto
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner large"></div>
      <p>Carregando produtos...</p>
    </div>

    <div v-else class="products-table">
      <table>
        <thead>
          <tr>
            <th>Imagem</th>
            <th>Nome</th>
            <th>Preço</th>
            <th>Status</th>
            <th>Estoque</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td class="product-image-cell">
              <img 
                v-if="product.images && product.images.length > 0" 
                :src="product.images[0].src" 
                :alt="product.name"
                class="product-thumbnail"
              />
              <div v-else class="no-image">📦</div>
            </td>
            <td class="product-name">{{ product.name }}</td>
            <td class="product-price">R$ {{ formatPrice(product.price) }}</td>
            <td class="product-status">
              <span :class="product.status">{{ product.status }}</span>
            </td>
            <td class="product-stock">{{ product.stock_quantity || 0 }}</td>
            <td class="product-actions">
              <button @click="editProduct(product)" class="action-btn edit">
                ✏️
              </button>
              <button @click="deleteProduct(product.id)" class="action-btn delete">
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de Criação/Edição -->
    <div v-if="showCreateForm || editingProduct" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingProduct ? 'Editar Produto' : 'Criar Novo Produto' }}</h3>
          <button @click="closeModal" class="close-btn">✕</button>
        </div>
        
        <form @submit.prevent="saveProduct" class="product-form">
          <div class="form-group">
            <label for="name">Nome do Produto *</label>
            <input 
              id="name"
              v-model="productForm.name"
              type="text"
              required
              placeholder="Nome do produto"
            />
          </div>

          <div class="form-group">
            <label for="description">Descrição</label>
            <textarea 
              id="description"
              v-model="productForm.description"
              rows="4"
              placeholder="Descrição do produto"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="price">Preço *</label>
              <input 
                id="price"
                v-model="productForm.price"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
              />
            </div>

            <div class="form-group">
              <label for="stock">Estoque</label>
              <input 
                id="stock"
                v-model="productForm.stock_quantity"
                type="number"
                min="0"
                placeholder="0"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="status">Status</label>
            <select id="status" v-model="productForm.status">
              <option value="publish">Publicado</option>
              <option value="draft">Rascunho</option>
              <option value="private">Privado</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-btn">
              Cancelar
            </button>
            <button type="submit" class="save-btn" :disabled="saving">
              <span v-if="saving" class="loading-spinner"></span>
              {{ saving ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/index.php?rest_route='

const authStore = useAuthStore()
const products = ref([])
const loading = ref(false)
const error = ref(null)
const showCreateForm = ref(false)
const editingProduct = ref(null)
const saving = ref(false)

const productForm = ref({
  name: '',
  description: '',
  price: '',
  stock_quantity: '',
  status: 'publish'
})

const loadProducts = async () => {
  loading.value = true
  error.value = null
  
  try {
    const headers = authStore.getWooCommerceHeaders()
    const response = await axios.get(`${API_BASE_URL}/wc/v3/products?per_page=100`, {
      headers
    })
    products.value = response.data
  } catch (err) {
    error.value = 'Erro ao carregar produtos: ' + (err.response && err.response.data && err.response.data.message || err.message)
    console.error('Erro ao carregar produtos:', err)
  } finally {
    loading.value = false
  }
}

const formatPrice = (price) => {
  if (!price) return '0,00'
  return parseFloat(price).toFixed(2).replace('.', ',')
}

const editProduct = (product) => {
  editingProduct.value = product
  productForm.value = {
    name: product.name,
    description: product.description,
    price: product.price,
    stock_quantity: product.stock_quantity || '',
    status: product.status
  }
}

const deleteProduct = async (productId) => {
  if (!confirm('Tem certeza que deseja deletar este produto?')) return

  try {
    const headers = authStore.getWooCommerceHeaders()
    await axios.delete(`${API_BASE_URL}/wc/v3/products/${productId}`, {
      headers
    })
    
    // Remover produto da lista
    products.value = products.value.filter(p => p.id !== productId)
    alert('Produto deletado com sucesso!')
  } catch (err) {
    alert('Erro ao deletar produto: ' + (err.response && err.response.data && err.response.data.message || err.message))
  }
}

const saveProduct = async () => {
  saving.value = true
  
  try {
    const headers = authStore.getWooCommerceHeaders()
    const productData = {
      name: productForm.value.name,
      description: productForm.value.description,
      price: productForm.value.price,
      stock_quantity: parseInt(productForm.value.stock_quantity) || 0,
      status: productForm.value.status
    }

    let response
    if (editingProduct.value) {
      // Atualizar produto existente
      response = await axios.put(`${API_BASE_URL}/wc/v3/products/${editingProduct.value.id}`, productData, {
        headers
      })
      
      // Atualizar produto na lista
      const index = products.value.findIndex(p => p.id === editingProduct.value.id)
      if (index !== -1) {
        products.value[index] = response.data
      }
    } else {
      // Criar novo produto
      response = await axios.post(`${API_BASE_URL}/wc/v3/products`, productData, {
        headers
      })
      
      // Adicionar produto à lista
      products.value.unshift(response.data)
    }
    
    closeModal()
    alert(editingProduct.value ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!')
  } catch (err) {
    alert('Erro ao salvar produto: ' + (err.response && err.response.data && err.response.data.message || err.message))
  } finally {
    saving.value = false
  }
}

const closeModal = () => {
  showCreateForm.value = false
  editingProduct.value = null
  productForm.value = {
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    status: 'publish'
  }
}

onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.product-management-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.management-header h2 {
  color: #333;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
}

.create-button {
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

.create-button:hover {
  background: #5a67d8;
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

.products-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

th {
  background: #f8fafc;
  font-weight: 600;
  color: #333;
}

.product-image-cell {
  width: 80px;
}

.product-thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.no-image {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 1.5rem;
  color: #cbd5e0;
}

.product-name {
  font-weight: 600;
  color: #333;
}

.product-price {
  font-weight: 600;
  color: #667eea;
}

.product-status {
  text-transform: capitalize;
}

.product-status span {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.product-status span.publish {
  background: #c6f6d5;
  color: #22543d;
}

.product-status span.draft {
  background: #fed7d7;
  color: #742a2a;
}

.product-status span.private {
  background: #e2e8f0;
  color: #2d3748;
}

.product-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  font-size: 16px;
}

.action-btn.edit:hover {
  background: #e6fffa;
}

.action-btn.delete:hover {
  background: #fee;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background: #f7fafc;
}

.product-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.cancel-btn,
.save-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.cancel-btn {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.cancel-btn:hover {
  background: #edf2f7;
}

.save-btn {
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
}

.save-btn:hover:not(:disabled) {
  background: #5a67d8;
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .management-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .products-table {
    overflow-x: auto;
  }
  
  table {
    min-width: 600px;
  }
}
</style> 