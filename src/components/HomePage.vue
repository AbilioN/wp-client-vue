<template>
  <div class="home-container">
    <div class="hero-section">
      <div class="hero-content">
        <h1>Bem-vindo ao WordPress Store</h1>
        <p>Explore nossos produtos e posts. Faça login apenas quando quiser comprar!</p>
        <div class="hero-buttons">
          <router-link to="/products" class="hero-button primary">
            <span>🛍️</span>
            Ver Produtos
          </router-link>
          <router-link to="/posts" class="hero-button secondary">
            <span>📝</span>
            Ler Posts
          </router-link>
        </div>
      </div>
    </div>

    <div class="features-section">
      <div class="container">
        <h2>O que você pode fazer aqui?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🛍️</div>
            <h3>Comprar Produtos</h3>
            <p>Explore nossa loja com produtos incríveis. Adicione ao carrinho e faça suas compras com segurança.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📝</div>
            <h3>Ler Posts</h3>
            <p>Fique por dentro das novidades através dos nossos posts e artigos informativos.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔐</div>
            <h3>Login Seguro</h3>
            <p>Faça login apenas quando precisar comprar. Suas informações estão seguras conosco.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2>Pronto para começar?</h2>
          <p>Explore nossos produtos ou leia nossos posts. O login é necessário apenas para compras.</p>
          <div class="cta-buttons">
            <router-link to="/products" class="cta-button">
              Explorar Produtos
            </router-link>
            <router-link to="/posts" class="cta-button outline">
              Ler Posts
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Componente simples, sem lógica adicional necessária
</script>

<style scoped>
.home-container {
  min-height: 100vh;
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 20px;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-content h1 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.2;
}

.hero-content p {
  font-size: 1.2rem;
  margin-bottom: 40px;
  opacity: 0.9;
}

.hero-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.hero-button.primary {
  background: white;
  color: #667eea;
}

.hero-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.hero-button.secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.hero-button.secondary:hover {
  background: white;
  color: #667eea;
  transform: translateY(-2px);
}

.features-section {
  padding: 80px 20px;
  background: #f8fafc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.features-section h2 {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 60px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
}

.feature-card {
  background: white;
  padding: 40px 30px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

.cta-section {
  padding: 80px 20px;
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  color: white;
}

.cta-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.cta-content h2 {
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 20px;
}

.cta-content p {
  font-size: 1.2rem;
  margin-bottom: 40px;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-button {
  padding: 16px 32px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  background: white;
  color: #667eea;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.cta-button.outline {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.cta-button.outline:hover {
  background: white;
  color: #667eea;
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2rem;
  }
  
  .hero-content p {
    font-size: 1rem;
  }
  
  .features-section h2,
  .cta-content h2 {
    font-size: 2rem;
  }
  
  .hero-buttons,
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-button,
  .cta-button {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
}
</style> 