# 🛒 Sistema de Carrinho WooCommerce Store API

Este documento explica como usar o sistema de carrinho implementado com a WooCommerce Store API.

## 📋 Endpoints Utilizados

### 1. Obter Status do Carrinho
```
GET /wc/store/v1/cart
```
Retorna o status atual do carrinho com todos os itens, totais e informações.

### 2. Adicionar Item ao Carrinho
```
POST /wc/store/v1/cart/add-item
```
Adiciona um produto ao carrinho.

**Payload:**
```json
{
  "id": 123,
  "quantity": 2
}
```

### 3. Atualizar Quantidade
```
POST /wc/store/v1/cart/update-item
```
Atualiza a quantidade de um item no carrinho.

**Payload:**
```json
{
  "key": "abc123",
  "quantity": 3
}
```

### 4. Remover Item
```
POST /wc/store/v1/cart/remove-item
```
Remove um item específico do carrinho.

**Payload:**
```json
{
  "key": "abc123"
}
```

### 5. Limpar Carrinho
```
POST /wc/store/v1/cart/remove-items
```
Remove todos os itens do carrinho.

### 6. Aplicar Cupom
```
POST /wc/store/v1/cart/apply-coupon
```
Aplica um cupom de desconto ao carrinho.

**Payload:**
```json
{
  "code": "DESCONTO10"
}
```

## 🎯 Componentes Implementados

### 1. ShoppingCart.vue
Componente principal do carrinho que exibe:
- Lista de itens no carrinho
- Imagens dos produtos
- Preços e quantidades
- Resumo com totais
- Botões para finalizar compra e limpar carrinho

**Funcionalidades:**
- ✅ Carregar carrinho da API
- ✅ Atualizar quantidades
- ✅ Remover itens
- ✅ Limpar carrinho completo
- ✅ Exibir totais e descontos
- ✅ Formatação de preços em Euro (€)

### 2. WooCommerceProducts.vue
Componente de produtos atualizado para:
- ✅ Adicionar produtos ao carrinho via API
- ✅ Verificar se o produto é comprável
- ✅ Feedback visual durante operações

### 3. CartTest.vue
Componente de teste para:
- ✅ Testar todas as operações do carrinho
- ✅ Visualizar respostas da API
- ✅ Debug de funcionalidades

## 🔧 Como Usar

### 1. Acessar o Carrinho
- Faça login na aplicação
- Clique em "🛒 Carrinho" no menu de navegação
- O carrinho será carregado automaticamente

### 2. Adicionar Produtos
- Vá para a página de produtos
- Clique em "🛒 Adicionar" em qualquer produto
- O produto será adicionado ao carrinho

### 3. Gerenciar Carrinho
- No carrinho, use os botões +/- para alterar quantidades
- Clique no ícone 🗑️ para remover itens
- Use "Limpar Carrinho" para remover tudo
- Clique em "Finalizar Compra" para ir ao checkout

### 4. Testar Funcionalidades
- Acesse "🧪 Teste Carrinho" no menu
- Teste todas as operações disponíveis
- Visualize as respostas da API

## 📊 Estrutura de Dados

### Resposta do Carrinho
```json
{
  "items": [
    {
      "key": "abc123",
      "id": 123,
      "name": "Nome do Produto",
      "quantity": 2,
      "prices": {
        "price": "29.99",
        "regular_price": "39.99"
      },
      "images": [
        {
          "src": "http://...",
          "alt": "Descrição"
        }
      ]
    }
  ],
  "totals": {
    "total_items": "59.98",
    "total_price": "59.98",
    "total_discount": "0",
    "currency_code": "EUR",
    "currency_symbol": "€"
  },
  "items_count": 2,
  "items_weight": 1.5
}
```

## 🎨 Formatação de Preços

Os preços são formatados automaticamente:
- Moeda: Euro (€)
- Separador decimal: vírgula (,)
- Separador de milhares: espaço ( )
- Exemplo: `€ 29,99`

## 🔐 Autenticação

Todas as operações do carrinho requerem:
- ✅ Login na aplicação
- ✅ Token JWT válido
- ✅ Headers de autorização automáticos

## 🚀 Funcionalidades Avançadas

### Cupons de Desconto
- Aplicar cupons via API
- Visualizar descontos no resumo
- Validação automática de cupons

### Frete
- Cálculo automático de frete (quando configurado)
- Exibição no resumo do carrinho
- Integração com métodos de envio

### Checkout
- Redirecionamento para checkout do WooCommerce
- Manutenção do carrinho durante o processo
- Integração com métodos de pagamento

## 🐛 Troubleshooting

### Erro "Authorization header not found"
- Verifique se está logado
- Recarregue a página
- Faça logout e login novamente

### Produto não adicionado
- Verifique se o produto está disponível
- Confirme se o produto é comprável
- Verifique o console para erros

### Carrinho não carrega
- Verifique a conexão com o WordPress
- Confirme se a Store API está ativa
- Verifique os logs do servidor

## 📝 Notas Importantes

1. **Sessão do Carrinho**: O carrinho é mantido por sessão no WordPress
2. **Autenticação**: Todas as operações requerem login
3. **Moeda**: Configurada para Euro (EUR)
4. **Imagens**: Carregadas automaticamente dos produtos
5. **Quantidades**: Mínimo de 1, sem limite máximo
6. **Validação**: Produtos devem estar publicados e compráveis

## 🔗 Links Úteis

- [WooCommerce Store API Documentation](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- [Cart Endpoints](https://woocommerce.github.io/woocommerce-rest-api-docs/#cart)
- [Product Endpoints](https://woocommerce.github.io/woocommerce-rest-api-docs/#products) 