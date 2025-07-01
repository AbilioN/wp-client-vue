<template>
  <div class="profile-container">
    <div class="profile-card">
      <div class="profile-header">
        <div class="avatar">
          <span>{{ userInitials }}</span>
        </div>
        <h2>{{ authStore.userDisplayName || 'Usuário' }}</h2>
        <p class="user-role">{{ userRole }}</p>
      </div>

      <div class="profile-info">
        <div class="info-item">
          <label>Email:</label>
          <span>{{ authStore.userEmail || 'N/A' }}</span>
        </div>
        <div class="info-item">
          <label>Nome de Exibição:</label>
          <span>{{ authStore.userDisplayName || 'N/A' }}</span>
        </div>
        <div class="info-item">
          <label>Nome de Usuário:</label>
          <span>{{ authStore.userNicename || 'N/A' }}</span>
        </div>
        <div class="info-item">
          <label>Token:</label>
          <span>{{ tokenPreview }}</span>
        </div>
      </div>

      <div class="profile-actions">
        <button @click="refreshUserInfo" class="action-button refresh">
          <span class="icon">🔄</span>
          Atualizar Dados
        </button>
        <button @click="handleLogout" class="action-button logout">
          <span class="icon">🚪</span>
          Sair
        </button>
      </div>

      <div class="token-info">
        <h4>Gerenciar Token</h4>
        <button @click="refreshToken" class="action-button secondary">
          Renovar Token
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const userInitials = computed(() => {
  const name = authStore.userDisplayName || ''
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const userRole = computed(() => {
  return 'Usuário WordPress'
})

const tokenPreview = computed(() => {
  const token = authStore.token
  if (!token) return 'Nenhum token'
  return `${token.substring(0, 20)}...${token.substring(token.length - 10)}`
})

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('pt-BR')
}

const refreshUserInfo = async () => {
  await authStore.getUserInfo()
}

const handleLogout = () => {
  authStore.logout()
}

const refreshToken = async () => {
  const success = await authStore.refreshToken()
  if (success) {
    alert('Token renovado com sucesso!')
  } else {
    alert('Erro ao renovar token. Faça login novamente.')
  }
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.profile-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 500px;
}

.profile-header {
  text-align: center;
  margin-bottom: 32px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 24px;
  font-weight: bold;
  color: white;
}

.profile-header h2 {
  color: #333;
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.user-role {
  color: #667eea;
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.profile-info {
  margin-bottom: 32px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  color: #666;
  font-weight: 500;
  font-size: 14px;
}

.info-item span {
  color: #333;
  font-size: 14px;
}

.profile-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
}

.action-button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.action-button.refresh {
  background-color: #667eea;
  color: white;
}

.action-button.logout {
  background-color: #e53e3e;
  color: white;
}

.action-button.secondary {
  background-color: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.icon {
  font-size: 16px;
}

.token-info {
  border-top: 1px solid #f0f0f0;
  padding-top: 24px;
}

.token-info h4 {
  color: #333;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
}

.token-preview {
  background-color: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #4a5568;
  word-break: break-all;
}
</style> 