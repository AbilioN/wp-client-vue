<template>
  <div v-if="!isOnline" class="offline-indicator">
    <div class="offline-content">
      <span class="offline-icon">📡</span>
      <span class="offline-text">Você está offline</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isOnline = ref(navigator.onLine)

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})
</script>

<style scoped>
.offline-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #e53e3e;
  color: white;
  padding: 8px 16px;
  text-align: center;
  z-index: 1001;
  font-size: 14px;
  font-weight: 500;
}

.offline-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.offline-icon {
  font-size: 16px;
}
</style> 