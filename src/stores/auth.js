import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/index.php?rest_route='

// Credenciais do WooCommerce
const WOOCOMMERCE_CONFIG = {
  consumerKey: 'ck_605c6dee0d0fdb6cc4925865d803944a56018f33',
  consumerSecret: 'cs_6a8f9f1921367bd4166cac4646bd7b951b687f67'
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('wp_user')) || null,
    token: localStorage.getItem('wp_token') || null,
    userEmail: localStorage.getItem('wp_user_email') || null,
    userNicename: localStorage.getItem('wp_user_nicename') || null,
    userDisplayName: localStorage.getItem('wp_user_display_name') || null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  getters: {
    getUser: (state) => state.user,
    getToken: (state) => state.token,
    getUserEmail: (state) => state.userEmail,
    getUserNicename: (state) => state.userNicename,
    getUserDisplayName: (state) => state.userDisplayName,
    isLoggedIn: (state) => state.isAuthenticated && state.token,
    getError: (state) => state.error,
    getWooCommerceConfig: () => WOOCOMMERCE_CONFIG
  },

  actions: {
    async login(username, password) {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.post(`${API_BASE_URL}/jwt-auth/v1/token`, {
          username,
          password
        })

        const { token, user_email, user_nicename, user_display_name } = response.data
        
        // Salvar dados no state
        this.token = token
        this.userEmail = user_email
        this.userNicename = user_nicename
        this.userDisplayName = user_display_name
        this.isAuthenticated = true
        
        // Criar objeto user com os dados disponíveis
        this.user = {
          email: user_email,
          nicename: user_nicename,
          display_name: user_display_name
        }
        
        // Salvar dados no localStorage
        localStorage.setItem('wp_token', token)
        localStorage.setItem('wp_user_email', user_email)
        localStorage.setItem('wp_user_nicename', user_nicename)
        localStorage.setItem('wp_user_display_name', user_display_name)
        localStorage.setItem('wp_user', JSON.stringify(this.user))
        
        // Configurar axios para usar o token em todas as requisições
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        // Configurar também no sessionStorage como backup
        sessionStorage.setItem('wp_token', token)
        
        // Atualizar o interceptor com o novo token
        this.setupAxiosInterceptors()
        
        console.log('🔐 Login bem-sucedido, token configurado:', token.substring(0, 20) + '...')
        
        return { success: true, user: this.user }
      } catch (error) {
        this.error = error.response && error.response.data && error.response.data.message || 'Erro ao fazer login'
        this.isAuthenticated = false
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async validateToken() {
      if (!this.token) {
        this.logout()
        return false
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/jwt-auth/v1/token/validate`)
        
        if (response.data.code === 'jwt_auth_valid_token') {
          this.isAuthenticated = true
          return true
        } else {
          this.logout()
          return false
        }
      } catch (error) {
        console.error('Erro na validação do token:', error.response?.data || error.message)
        this.logout()
        return false
      }
    },

    async getUserInfo() {
      if (!this.token) return null

      try {
        const response = await axios.get(`${API_BASE_URL}/wp/v2/users/me`)
        
        this.user = response.data
        return response.data
      } catch (error) {
        console.error('Erro ao buscar informações do usuário:', error)
        return null
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.userEmail = null
      this.userNicename = null
      this.userDisplayName = null
      this.isAuthenticated = false
      this.error = null
      
      // Remover dados do localStorage
      localStorage.removeItem('wp_token')
      localStorage.removeItem('wp_user_email')
      localStorage.removeItem('wp_user_nicename')
      localStorage.removeItem('wp_user_display_name')
      localStorage.removeItem('wp_user')
      
      // Remover header de autorização do axios
      delete axios.defaults.headers.common['Authorization']
      
      // Limpar também do sessionStorage
      sessionStorage.removeItem('wp_token')
    },

    async refreshToken() {
      if (!this.token) return false

      try {
        const response = await axios.post(`${API_BASE_URL}/jwt-auth/v1/token/refresh`)
        
        const { token } = response.data
        this.token = token
        localStorage.setItem('wp_token', token)
        
        return true
      } catch (error) {
        console.error('Erro ao renovar token:', error.response?.data || error.message)
        this.logout()
        return false
      }
    },

    // Método para criar headers de autenticação do WooCommerce
    getWooCommerceHeaders() {
      const credentials = btoa(`${WOOCOMMERCE_CONFIG.consumerKey}:${WOOCOMMERCE_CONFIG.consumerSecret}`)
      return {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    },

    // Método para inicializar o estado de autenticação
    initializeAuth() {
      console.log('🚀 Inicializando autenticação...')
      console.log('📦 Token no state:', this.token ? 'Presente' : 'Ausente')
      console.log('📦 Token no localStorage:', localStorage.getItem('wp_token') ? 'Presente' : 'Ausente')
      console.log('📦 Token no sessionStorage:', sessionStorage.getItem('wp_token') ? 'Presente' : 'Ausente')
      
      // Configurar interceptors do axios
      this.setupAxiosInterceptors()
      
      if (this.token) {
        this.isAuthenticated = true
        
        // Configurar header de autorização global
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        console.log('✅ Header global configurado com token')
        
        // Validar o token automaticamente
        this.validateToken().then(isValid => {
          if (!isValid) {
            console.log('❌ Token inválido, fazendo logout automático')
          } else {
            console.log('✅ Token válido')
          }
        })
      } else {
        console.log('⚠️ Nenhum token encontrado na inicialização')
      }
    },

    // Método para forçar a configuração do token
    forceTokenSetup() {
      const token = this.token || localStorage.getItem('wp_token') || sessionStorage.getItem('wp_token')
      
      if (token) {
        // Configurar em todas as fontes possíveis
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        localStorage.setItem('wp_token', token)
        sessionStorage.setItem('wp_token', token)
        
        console.log('🔧 Token forçado em todas as configurações:', token.substring(0, 20) + '...')
        return true
      }
      
      console.log('❌ Nenhum token disponível para forçar configuração')
      return false
    },

    // Configurar interceptors do axios
    setupAxiosInterceptors() {
      // Remover interceptors existentes para evitar duplicação
      axios.interceptors.request.clear()
      axios.interceptors.response.clear()
      
      // Interceptor de requisição para incluir token automaticamente
      axios.interceptors.request.use(
        (config) => {
          // Log para debug
          console.log('🔍 Interceptor Request:', config.url)
          
          // Buscar token de múltiplas fontes
          let token = this.token
          if (!token) {
            token = localStorage.getItem('wp_token')
          }
          if (!token) {
            token = sessionStorage.getItem('wp_token')
          }
          
          if (token) {
            // Garantir que o header seja definido
            config.headers = config.headers || {}
            config.headers.Authorization = `Bearer ${token}`
            
            // Também definir no header global como backup
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            
            console.log('✅ Token adicionado ao header:', token.substring(0, 20) + '...')
          } else {
            console.log('❌ Nenhum token encontrado em nenhuma fonte')
          }
          
          return config
        },
        (error) => {
          console.error('❌ Erro no interceptor de requisição:', error)
          return Promise.reject(error)
        }
      )

      // Interceptor de resposta para tratar erros de autenticação
      axios.interceptors.response.use(
        (response) => {
          console.log('✅ Resposta bem-sucedida:', response.config.url)
          return response
        },
        (error) => {
          console.log('❌ Erro na resposta:', error.config?.url, error.response?.status)
          
          if (error.response?.status === 401 || error.response?.status === 403) {
            // Token inválido ou expirado
            console.log('🚨 Erro de autenticação detectado, fazendo logout')
            this.logout()
          }
          return Promise.reject(error)
        }
      )
    }
  }
}) 