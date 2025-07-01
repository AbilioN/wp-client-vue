# WordPress E-commerce App

Uma aplicação Vue 3 para e-commerce integrada com WordPress e WooCommerce. Produtos e posts são públicos, login necessário apenas para compras e gerenciamento.

## Funcionalidades

- 🛍️ **Produtos públicos** - Visualize produtos sem login
- 📝 **Posts públicos** - Leia posts do WordPress sem autenticação
- 🔐 **Login opcional** - Necessário apenas para compras e gerenciamento
- 🛒 **Carrinho de compras** - Adicione produtos e finalize compras
- 👤 **Perfil do usuário** - Gerencie sua conta
- ⚙️ **Gerenciamento de produtos** - Crie, edite e delete produtos (requer login)
- 🔄 **Autenticação JWT** com WordPress
- 🔑 **Autenticação WooCommerce** com Consumer Key/Secret
- 🎨 **Interface moderna** e responsiva
- 🛡️ **Rotas protegidas** apenas para funcionalidades de compra e admin

## Pré-requisitos

- WordPress rodando em `http://localhost:8080`
- WooCommerce instalado e configurado
- Plugin JWT Authentication for WP REST API instalado e configurado
- Consumer Key e Consumer Secret do WooCommerce configurados
- Node.js e npm instalados

## Instalação

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd wp-front
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse a aplicação em `http://localhost:5173`

## Configuração do WordPress

Certifique-se de que seu WordPress tenha:

1. **WooCommerce** instalado e ativado
2. **Plugin JWT Authentication** instalado e ativado
3. **CORS configurado** para aceitar requisições da aplicação
4. **Produtos criados** no WooCommerce
5. **Usuário administrador** criado para teste
6. **Consumer Key e Consumer Secret** do WooCommerce configurados

### Configuração CORS (se necessário)

Adicione ao arquivo `wp-config.php`:

```php
define('JWT_AUTH_SECRET_KEY', 'sua-chave-secreta-aqui');
define('JWT_AUTH_CORS_ENABLE', true);
```

### Configuração WooCommerce

As credenciais do WooCommerce já estão configuradas no código:
- Consumer Key: `ck_605c6dee0d0fdb6cc4925865d803944a56018f33`
- Consumer Secret: `cs_6a8f9f1921367bd4166cac4646bd7b951b687f67`

## Uso

### Navegação Pública
- **Página Inicial**: Visão geral da loja
- **Produtos**: Explore produtos sem necessidade de login
- **Posts**: Leia posts do WordPress
- **Busca**: Filtre produtos por nome, descrição ou SKU

### Funcionalidades que Requerem Login
- **Carrinho de Compras**: Adicione produtos e gerencie quantidades
- **Perfil**: Visualize informações da conta
- **Gerenciamento de Produtos**: Crie, edite e delete produtos
- **Checkout**: Finalize compras (funcionalidade básica implementada)

### Login
1. Clique em "Entrar" na navegação
2. Digite suas credenciais do WordPress
3. Acesse funcionalidades de compra e gerenciamento

### Gerenciamento de Produtos
1. Faça login na aplicação
2. Clique em "Gerenciar Produtos" na navegação
3. Use as funcionalidades:
   - **Criar Produto**: Adicione novos produtos
   - **Editar Produto**: Modifique produtos existentes
   - **Deletar Produto**: Remova produtos da loja

## Estrutura do Projeto

```
src/
├── components/
│   ├── HomePage.vue           # Página inicial
│   ├── LoginForm.vue          # Formulário de login
│   ├── UserProfile.vue        # Perfil do usuário
│   ├── WordPressPosts.vue     # Listagem de posts
│   ├── WooCommerceProducts.vue # Listagem de produtos
│   ├── ProductManagement.vue  # Gerenciamento de produtos
│   └── ShoppingCart.vue       # Carrinho de compras
├── stores/
│   └── auth.js               # Store Pinia para autenticação
├── router/
│   └── index.js              # Configuração do Vue Router
├── App.vue                   # Componente principal
└── main.js                   # Ponto de entrada
```

## Tecnologias Utilizadas

- **Vue 3** - Framework JavaScript
- **Pinia** - Gerenciamento de estado
- **Vue Router** - Roteamento
- **Axios** - Requisições HTTP
- **Vite** - Build tool

## API Endpoints Utilizados

### WordPress REST API (Público)
- `GET /wp/v2/posts` - Listar posts

### WooCommerce REST API (Autenticado)
- `GET /wc/v3/products` - Listar produtos
- `POST /wc/v3/products` - Criar produto
- `PUT /wc/v3/products/{id}` - Atualizar produto
- `DELETE /wc/v3/products/{id}` - Deletar produto

### JWT Authentication (Protegido)
- `POST /jwt-auth/v1/token` - Login
- `POST /jwt-auth/v1/token/validate` - Validar token
- `POST /jwt-auth/v1/token/refresh` - Renovar token
- `GET /wp/v2/users/me` - Informações do usuário

## Fluxo de Usuário

1. **Visitante**: Pode navegar por produtos e posts livremente
2. **Interesse em compra**: Clica em "Login para Comprar"
3. **Autenticação**: Faz login com credenciais do WordPress
4. **Compra**: Adiciona produtos ao carrinho e finaliza compra
5. **Gerenciamento**: Acessa painel de gerenciamento de produtos
6. **Perfil**: Gerencia informações da conta

## Desenvolvimento

### Comandos Disponíveis

```bash
# Servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_WP_API_URL=http://localhost:8080/index.php?rest_route=
```

## Funcionalidades Futuras

- [ ] Integração completa com WooCommerce checkout
- [ ] Sistema de avaliações de produtos
- [ ] Wishlist de produtos
- [ ] Histórico de pedidos
- [ ] Notificações em tempo real
- [ ] Sistema de cupons e descontos
- [ ] Upload de imagens de produtos
- [ ] Gerenciamento de categorias
- [ ] Relatórios de vendas

## Troubleshooting

### Erro de CORS
Se encontrar erros de CORS, verifique se o WordPress está configurado para aceitar requisições da origem da aplicação.

### Produtos não aparecem
Certifique-se de que:
- WooCommerce está ativado
- Produtos estão publicados
- API do WooCommerce está acessível
- Consumer Key e Consumer Secret estão corretos

### Token Inválido
Se o token expirar, a aplicação automaticamente redirecionará para a tela de login.

### WordPress não acessível
Certifique-se de que o WordPress está rodando em `http://localhost:8080` e acessível.

### Erro de autenticação WooCommerce
Verifique se as credenciais do WooCommerce estão corretas e se o usuário tem permissões adequadas.

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT.
