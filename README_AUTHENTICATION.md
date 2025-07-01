# Sistema de Autenticação WordPress com Pinia

## Visão Geral

O sistema de autenticação foi implementado usando Pinia para gerenciar o estado global da aplicação. Ele salva automaticamente o token JWT e os dados do usuário no localStorage para persistência entre sessões.

## Estrutura de Dados do Login

Quando o usuário faz login, a API retorna:

```json
{
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user_email": "netobalby@gmail.com",
    "user_nicename": "user",
    "user_display_name": "user"
}
```

## Store de Autenticação (`src/stores/auth.js`)

### State
```javascript
state: () => ({
  user: JSON.parse(localStorage.getItem('wp_user')) || null,
  token: localStorage.getItem('wp_token') || null,
  userEmail: localStorage.getItem('wp_user_email') || null,
  userNicename: localStorage.getItem('wp_user_nicename') || null,
  userDisplayName: localStorage.getItem('wp_user_display_name') || null,
  isAuthenticated: false,
  loading: false,
  error: null
})
```

### Getters
- `getUser`: Retorna o objeto user
- `getToken`: Retorna o token JWT
- `getUserEmail`: Retorna o email do usuário
- `getUserNicename`: Retorna o nicename do usuário
- `getUserDisplayName`: Retorna o nome de exibição
- `isLoggedIn`: Verifica se o usuário está logado
- `getError`: Retorna erros de autenticação

### Actions

#### `login(username, password)`
Faz login e salva os dados no store e localStorage:
```javascript
const result = await authStore.login('username', 'password')
if (result.success) {
  // Login bem-sucedido
  console.log('Usuário logado:', result.user)
}
```

#### `logout()`
Remove todos os dados de autenticação:
```javascript
authStore.logout()
```

#### `validateToken()`
Valida se o token atual ainda é válido:
```javascript
const isValid = await authStore.validateToken()
```

#### `getUserInfo()`
Busca informações completas do usuário:
```javascript
const userInfo = await authStore.getUserInfo()
```

#### `refreshToken()`
Renova o token JWT:
```javascript
const success = await authStore.refreshToken()
```

#### `initializeAuth()`
Inicializa o estado de autenticação na aplicação:
```javascript
authStore.initializeAuth()
```

## Como Usar em Componentes

### 1. Importar o Store
```javascript
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
```

### 2. Verificar Status de Autenticação
```javascript
// Verificar se está logado
if (authStore.isLoggedIn) {
  // Usuário autenticado
}

// Acessar dados do usuário
console.log('Email:', authStore.userEmail)
console.log('Nome:', authStore.userDisplayName)
console.log('Token:', authStore.token)
```

### 3. Fazer Requisições Autenticadas
O token é automaticamente configurado no axios após o login:

```javascript
import axios from 'axios'

// O token é automaticamente incluído no header Authorization
const response = await axios.get('http://localhost:8080/index.php?rest_route=/wp/v2/posts')
```

### 4. Exemplo Completo de Componente
```vue
<template>
  <div>
    <div v-if="authStore.isLoggedIn">
      <h2>Bem-vindo, {{ authStore.userDisplayName }}!</h2>
      <p>Email: {{ authStore.userEmail }}</p>
      <button @click="authStore.logout()">Sair</button>
    </div>
    <div v-else>
      <p>Você não está logado</p>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
</script>
```

## Rotas Protegidas

O sistema de rotas verifica automaticamente a autenticação:

```javascript
{
  path: '/profile',
  name: 'Profile',
  component: UserProfile,
  meta: { requiresAuth: true } // Requer autenticação
}
```

## Persistência de Dados

Os dados são salvos automaticamente no localStorage:

- `wp_token`: Token JWT
- `wp_user_email`: Email do usuário
- `wp_user_nicename`: Nicename do usuário
- `wp_user_display_name`: Nome de exibição
- `wp_user`: Objeto user completo

## Inicialização Automática

No `main.js`, a autenticação é inicializada automaticamente:

```javascript
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
authStore.initializeAuth()
```

## Exemplo de Requisições Autenticadas

### 1. Buscar Posts
```javascript
const response = await axios.get('http://localhost:8080/index.php?rest_route=/wp/v2/posts')
```

### 2. Buscar Usuário Atual
```javascript
const response = await axios.get('http://localhost:8080/index.php?rest_route=/wp/v2/users/me')
```

### 3. Criar Post
```javascript
const postData = {
  title: 'Novo Post',
  content: 'Conteúdo do post',
  status: 'draft'
}
const response = await axios.post('http://localhost:8080/index.php?rest_route=/wp/v2/posts', postData)
```

### 4. Atualizar Post
```javascript
const updateData = {
  title: 'Título Atualizado',
  content: 'Conteúdo atualizado'
}
const response = await axios.put('http://localhost:8080/index.php?rest_route=/wp/v2/posts/123', updateData)
```

### 5. Deletar Post
```javascript
const response = await axios.delete('http://localhost:8080/index.php?rest_route=/wp/v2/posts/123')
```

## Tratamento de Erros

O sistema inclui tratamento de erros para:

- Token inválido/expirado
- Credenciais incorretas
- Erros de rede
- Requisições não autorizadas

## Componente de Exemplo

Acesse `/auth-examples` para ver um componente que demonstra como fazer requisições autenticadas.

## Segurança

- Tokens são armazenados no localStorage (considere usar httpOnly cookies para produção)
- Tokens são automaticamente incluídos em todas as requisições
- Validação automática de token
- Logout automático quando o token expira

## Fluxo de Autenticação

1. Usuário faz login com username/password
2. API retorna token JWT e dados do usuário
3. Dados são salvos no Pinia store e localStorage
4. Token é configurado no axios para requisições futuras
5. Usuário é redirecionado para área protegida
6. Rotas verificam autenticação automaticamente
7. Token é validado em cada navegação
8. Logout remove todos os dados 