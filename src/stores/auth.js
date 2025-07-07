import { defineStore } from 'pinia'
import axios from 'axios'
import { API_BASE_URL, WOOCOMMERCE_CONFIG } from '../config/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('wp_user')) || null,
    token: localStorage.getItem('wp_token') || null,
    userEmail: localStorage.getItem('wp_user_email') || null,
    userNicename: localStorage.getItem('wp_user_nicename') || null,
    userDisplayName: localStorage.getItem('wp_user_display_name') || null,
    isAuthenticated: false,
    loading: false,
    error: null,
    cart: (() => {
      const savedCart = localStorage.getItem('wp_cart')
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart)
          return {
            items: parsed?.items || [],
            totals: parsed?.totals || { 
              total_items: 0, 
              total_price: 0, 
              total_shipping: 0, 
              total_discount: 0 
            },
            items_count: parsed?.items_count || 0
          }
        } catch (e) {
          console.error('Erro ao parsear carrinho salvo:', e)
        }
      }
      return {
        items: [],
        totals: { 
          total_items: 0, 
          total_price: 0, 
          total_shipping: 0, 
          total_discount: 0 
        },
        items_count: 0
      }
    })(),
    cartItemsCount: parseInt(localStorage.getItem('wp_cart_items_count')) || 0,
    nonce: localStorage.getItem('wp_nonce') || null
  }),

  getters: {
    getUser: (state) => state.user,
    getToken: (state) => state.token,
    getUserEmail: (state) => state.userEmail,
    getUserNicename: (state) => state.userNicename,
    getUserDisplayName: (state) => state.userDisplayName,
    isLoggedIn: (state) => state.isAuthenticated && state.token,
    getError: (state) => state.error,
    getWooCommerceConfig: () => WOOCOMMERCE_CONFIG,
    getCart: (state) => state.cart,
    getCartItemsCount: (state) => state.cartItemsCount,
    getNonce: (state) => state.nonce
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
        this.token = token
        this.userEmail = user_email
        this.userNicename = user_nicename
        this.userDisplayName = user_display_name
        this.isAuthenticated = true
        this.user = {
          email: user_email,
          nicename: user_nicename,
          display_name: user_display_name
        }
        localStorage.setItem('wp_token', token)
        localStorage.setItem('wp_user_email', user_email)
        localStorage.setItem('wp_user_nicename', user_nicename)
        localStorage.setItem('wp_user_display_name', user_display_name)
        localStorage.setItem('wp_user', JSON.stringify(this.user))
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        sessionStorage.setItem('wp_token', token)
        this.setupAxiosInterceptors()
        await this.checkCartAfterLogin()
        return { success: true, user: this.user }
      } catch (error) {
        this.error = error.response?.data?.message || error.message
        this.isAuthenticated = false
        this.token = null
        this.user = null
        localStorage.removeItem('wp_token')
        localStorage.removeItem('wp_user_email')
        localStorage.removeItem('wp_user_nicename')
        localStorage.removeItem('wp_user_display_name')
        localStorage.removeItem('wp_user')
        sessionStorage.removeItem('wp_token')
        throw error
      } finally {
        this.loading = false
      }
    },

    initializeAuth() {
      this.setupAxiosInterceptors()
      if (this.token) {
        this.isAuthenticated = true
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        this.validateToken().then(isValid => {
          if (!isValid) {
            this.logout()
          } else {
            this.checkCartAfterLogin()
          }
        })
      }
    },

    forceTokenSetup() {
      const token = this.token || localStorage.getItem('wp_token') || sessionStorage.getItem('wp_token')
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        localStorage.setItem('wp_token', token)
        sessionStorage.setItem('wp_token', token)
        return true
      }
      return false
    },

    async checkCartAfterLogin() {
      try {
        const response = await axios.get(`${API_BASE_URL}/wc/store/v1/cart`)
        this.updateCart(response.data, response.headers)
        return response.data
      } catch (error) {
        // Em caso de erro, inicializar com carrinho vazio
        this.updateCart({
          items: [],
          totals: { 
            total_items: 0, 
            total_price: 0, 
            total_shipping: 0, 
            total_discount: 0 
          },
          items_count: 0
        })
        return null
      }
    },

    updateCart(cartData, responseHeaders = null) {
      // Garantir que o carrinho tenha uma estrutura válida
      this.cart = {
        items: cartData?.items || [],
        totals: cartData?.totals || { 
          total_items: 0, 
          total_price: 0, 
          total_shipping: 0, 
          total_discount: 0 
        },
        items_count: cartData?.items_count || 0
      }
      this.cartItemsCount = this.cart.items_count
      localStorage.setItem('wp_cart', JSON.stringify(this.cart))
      localStorage.setItem('wp_cart_items_count', this.cartItemsCount.toString())
      if (responseHeaders) {
        const nonce = responseHeaders['nonce'] || responseHeaders['Nonce']
        if (nonce) {
          this.saveNonce(nonce)
        }
      }
    },

    saveNonce(nonce) {
      this.nonce = nonce
      localStorage.setItem('wp_nonce', nonce)
    },

    clearNonce() {
      this.nonce = null
      localStorage.removeItem('wp_nonce')
    },

    async requestWithNonce(method, url, data = null) {
      const nonce = this.nonce || localStorage.getItem('wp_nonce')
      const config = {
        method,
        url,
        headers: {}
      }
      if (data) {
        config.data = data
      }
      if (nonce) {
        config.headers['Nonce'] = nonce
      }
      return axios(config)
    },

    setupAxiosInterceptors() {
      axios.interceptors.request.use(
        (config) => {
          if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`
          }
          return config
        },
        (error) => Promise.reject(error)
      )
      axios.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response?.status === 401 || error.response?.status === 403) {
            this.logout()
          }
          return Promise.reject(error)
        }
      )
    },

    async validateToken() {
      if (!this.token) return false
      try {
        const response = await axios.post(`${API_BASE_URL}/jwt-auth/v1/token/validate`, {}, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        return response.data && response.data.code === 'jwt_auth_valid_token'
      } catch (error) {
        return false
      }
    },

    async getUserInfo() {
      if (!this.token) return null
      try {
        const response = await axios.get(`${API_BASE_URL}/wp/v2/users/me`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        this.user = response.data
        localStorage.setItem('wp_user', JSON.stringify(this.user))
        return response.data
      } catch (error) {
        return null
      }
    },

    logout() {
      this.token = null
      this.user = null
      this.userEmail = null
      this.userNicename = null
      this.userDisplayName = null
      this.isAuthenticated = false
      this.cart = {
        items: [],
        totals: { 
          total_items: 0, 
          total_price: 0, 
          total_shipping: 0, 
          total_discount: 0 
        },
        items_count: 0
      }
      this.cartItemsCount = 0
      this.nonce = null
      localStorage.removeItem('wp_token')
      localStorage.removeItem('wp_user_email')
      localStorage.removeItem('wp_user_nicename')
      localStorage.removeItem('wp_user_display_name')
      localStorage.removeItem('wp_user')
      localStorage.removeItem('wp_cart')
      localStorage.removeItem('wp_cart_items_count')
      localStorage.removeItem('wp_nonce')
      sessionStorage.removeItem('wp_token')
      delete axios.defaults.headers.common['Authorization']
    },

    clearCart() {
      this.cart = {
        items: [],
        totals: { 
          total_items: 0, 
          total_price: 0, 
          total_shipping: 0, 
          total_discount: 0 
        },
        items_count: 0
      }
      this.cartItemsCount = 0
      localStorage.removeItem('wp_cart')
      localStorage.removeItem('wp_cart_items_count')
    }
  }
}) 