<template>
  <div class="home-page">
    <div class="hero-section">
      <h1>Bem-vindo à WordPress Store</h1>
      <p>Uma loja online integrada com WordPress e WooCommerce</p>
      <div class="hero-actions">
        <router-link to="/products" class="btn-primary">
          Ver Produtos
        </router-link>
        <router-link to="/posts" class="btn-secondary">
          Ver Posts
        </router-link>
      </div>
    </div>
    
    <div class="features-section">
      <h2>Recursos</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🛍️</div>
          <h3>Produtos WooCommerce</h3>
          <p>Navegue pelos produtos da loja com preços e descrições detalhadas</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📱</div>
          <h3>PWA</h3>
          <p>Instale como aplicativo e use offline</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔐</div>
          <h3>Autenticação JWT</h3>
          <p>Login seguro com tokens JWT</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🛒</div>
          <h3>Carrinho de Compras</h3>
          <p>Gerencie seu carrinho de compras</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('HomePage: Componente montado')
})
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.hero-section {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 40px;
}

.hero-section h1 {
  font-size: 2.5rem;
  margin-bottom: 16px;
  font-weight: 700;
}

.hero-section p {
  font-size: 1.2rem;
  margin-bottom: 32px;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  background: #f8fafc;
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: white;
  color: #667eea;
}

.features-section {
  padding: 40px 0;
}

.features-section h2 {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 40px;
  color: #333;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.feature-card {
  background: white;
  padding: 24px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 1.2rem;
  margin-bottom: 12px;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2rem;
  }
  
  .hero-section p {
    font-size: 1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style> 