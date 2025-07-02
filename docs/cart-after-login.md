# Sistema de Carrinho após Login

## Visão Geral

O sistema foi implementado para verificar automaticamente o carrinho do usuário logo após o login bem-sucedido. Isso garante que o estado do carrinho seja sempre atualizado e sincronizado com o WooCommerce.

## Funcionalidades Implementadas

### 1. Verificação Automática do Carrinho

- **Localização**: `src/stores/auth.js`
- **Método**: `checkCartAfterLogin()`
- **Endpoint**: `GET /wc/store/v1/cart`
- **Trigger**: Após login bem-sucedido

### 2. Armazenamento de Dados do Carrinho

O carrinho é armazenado em múltiplas localizações:

```javascript
// No store Pinia
state: {
  cart: null,
  cartItemsCount: 0
}

// No localStorage
localStorage.setItem('wp_cart', JSON.stringify(cartData))
localStorage.setItem('wp_cart_items_count', cartItemsCount.toString())
```

### 3. Componente de Status do Carrinho

- **Arquivo**: `src/components/CartStatus.vue`
- **Funcionalidade**: Mostra o número de itens no carrinho no header
- **Características**:
  - Badge com contador de itens
  - Link direto para o carrinho
  - Responsivo (texto oculto em mobile)

### 4. Sincronização Automática

O carrinho é atualizado automaticamente em todas as operações:

- **Adicionar produto**: `WooCommerceProducts.vue`
- **Atualizar quantidade**: `ShoppingCart.vue`
- **Remover item**: `ShoppingCart.vue`
- **Limpar carrinho**: `ShoppingCart.vue`

## Fluxo de Funcionamento

### 1. Login
```javascript
// 1. Usuário faz login
const result = await authStore.login(credentials)

// 2. Token é configurado
authStore.setupAxiosInterceptors()

// 3. Carrinho é verificado automaticamente
await authStore.checkCartAfterLogin()
```

### 2. Inicialização da Aplicação
```javascript
// 1. Aplicação carrega
authStore.initializeAuth()

// 2. Se há token válido
if (isValid) {
  // 3. Carrinho é verificado
  authStore.checkCartAfterLogin()
}
```

### 3. Operações no Carrinho
```javascript
// 1. Operação é executada
const response = await axios.post('/wc/store/v1/cart/add-item', data)

// 2. Store é atualizado com a resposta
authStore.updateCart(response.data)

// 3. Interface é atualizada automaticamente
```

## Estrutura de Dados do Carrinho

### Exemplo de Resposta da API
```json
{
  "items": [
    {
      "key": "c74d97b01eae257e44aa9d5bade97baf",
      "id": 16,
      "name": "Meu produto",
      "quantity": 1,
      "prices": {
        "price": "12000000",
        "currency_code": "EUR",
        "currency_symbol": "€"
      },
      "totals": {
        "line_total": "12000000"
      }
    }
  ],
  "totals": {
    "total_items": "12000000",
    "total_price": "12000000",
    "currency_code": "EUR"
  },
  "items_count": 1
}
```

## Métodos do Store

### `checkCartAfterLogin()`
- Verifica o carrinho após login
- Atualiza o store e localStorage
- Retorna os dados do carrinho ou null

### `updateCart(cartData)`
- Atualiza o carrinho no store
- Salva no localStorage
- Calcula o número de itens

### `clearCart()`
- Limpa o carrinho do store
- Remove dados do localStorage

## Componentes Relacionados

### CartStatus.vue
- Mostra status do carrinho no header
- Badge com contador de itens
- Link para página do carrinho

### CartLoginTest.vue
- Componente de teste para verificar funcionamento
- Mostra logs de operações
- Permite forçar verificações

## Configuração de Interceptors

Os interceptors do axios são configurados para incluir automaticamente o token Bearer em todas as requisições:

```javascript
// Interceptor de Request
axios.interceptors.request.use(config => {
  const token = authStore.token || localStorage.getItem('wp_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

## Tratamento de Erros

- **401/403**: Token inválido, logout automático
- **Erro de rede**: Log de erro no console
- **Carrinho vazio**: Estado normal, não é erro

## Testes Disponíveis

### CartLoginTest.vue
- Verificar carrinho após login
- Forçar verificação do carrinho
- Limpar dados do carrinho
- Mostrar dados do carrinho
- Logs detalhados de operações

### Como Usar
1. Acesse `/cart-login-test`
2. Faça login na aplicação
3. Use os botões de teste para verificar funcionamento
4. Monitore os logs para debug

## Benefícios

1. **Sincronização Automática**: Carrinho sempre atualizado
2. **Experiência do Usuário**: Status visível no header
3. **Performance**: Dados em cache no localStorage
4. **Debug**: Ferramentas de teste disponíveis
5. **Consistência**: Estado centralizado no store

## Considerações Técnicas

- O carrinho é verificado apenas quando há token válido
- Dados são persistidos no localStorage para sobreviver a refresh
- Operações usam resposta direta da API em vez de recarregar
- Interceptors garantem autenticação automática
- Componentes reativos atualizam automaticamente 