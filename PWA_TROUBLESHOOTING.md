# 🔧 Guia de Solução de Problemas - PWA

## Por que a opção de instalar não aparece?

A opção de instalar uma PWA só aparece quando **TODOS** os critérios abaixo são atendidos:

### ✅ Critérios Obrigatórios

1. **HTTPS ou localhost**
   - A aplicação deve estar rodando em HTTPS ou localhost
   - ❌ HTTP em produção não funciona

2. **Manifest válido**
   - Deve ter todos os campos obrigatórios
   - Ícones devem existir e ser acessíveis
   - Deve estar em `/manifest.json`

3. **Service Worker registrado**
   - Deve estar funcionando corretamente
   - Deve estar no escopo correto

4. **Evento beforeinstallprompt**
   - O navegador deve disparar este evento
   - Deve ser capturado corretamente

5. **Não estar já instalada**
   - Se já estiver instalada, não aparece o prompt

6. **Navegador compatível**
   - Chrome, Edge, Firefox, Safari (iOS)
   - ❌ Alguns navegadores móveis não suportam

### 🔍 Como Diagnosticar

1. **Acesse o Debug da PWA**
   - Vá para `/pwa-debug` na aplicação
   - Verifique todos os status

2. **Abra o DevTools**
   - F12 → Application → Manifest
   - F12 → Application → Service Workers
   - F12 → Console → Procure por erros

3. **Verifique no Console**
   ```javascript
   // Verificar se o manifest está carregado
   fetch('/manifest.json').then(r => r.json()).then(console.log)
   
   // Verificar service worker
   navigator.serviceWorker.getRegistration().then(console.log)
   
   // Verificar se pode instalar
   console.log('Deferred prompt:', !!window.deferredPrompt)
   ```

### 🛠️ Soluções Comuns

#### 1. Problema: Manifest não carrega
**Sintomas:** Erro 404 no manifest
**Solução:**
- Verificar se `/public/manifest.json` existe
- Verificar se está sendo servido corretamente
- Verificar se os ícones existem

#### 2. Problema: Service Worker não registra
**Sintomas:** Erro no console
**Solução:**
- Verificar se `/public/sw.js` existe
- Verificar se está sendo registrado no `main.js`
- Limpar cache do navegador

#### 3. Problema: Ícones não carregam
**Sintomas:** Erro 404 nos ícones
**Solução:**
- Verificar se os ícones existem em `/public/icons/`
- Verificar se os caminhos no manifest estão corretos
- Gerar ícones novamente se necessário

#### 4. Problema: Evento beforeinstallprompt não dispara
**Sintomas:** Prompt não aparece
**Solução:**
- Verificar se todos os critérios estão atendidos
- Testar em navegador diferente
- Verificar se não está em modo standalone

### 🧪 Testes Específicos

#### Teste 1: Verificar Manifest
```bash
# No terminal
curl http://localhost:5173/manifest.json
```

#### Teste 2: Verificar Service Worker
```javascript
// No console do navegador
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW registrado:', !!reg)
  if (reg) console.log('SW ativo:', !!reg.active)
})
```

#### Teste 3: Forçar Prompt
```javascript
// No console do navegador
if (window.deferredPrompt) {
  window.deferredPrompt.prompt()
}
```

### 📱 Teste em Diferentes Dispositivos

1. **Desktop Chrome/Edge**
   - Deve funcionar normalmente
   - Ícone de instalação na barra de endereços

2. **Mobile Chrome**
   - Menu de três pontos → "Adicionar à tela inicial"
   - Ou prompt automático

3. **Safari iOS**
   - Compartilhar → "Adicionar à tela inicial"
   - Não tem prompt automático

4. **Firefox**
   - Ícone de instalação na barra de endereços
   - Ou menu → "Instalar aplicação"

### 🔄 Fluxo de Debug Recomendado

1. **Acesse `/pwa-debug`**
2. **Verifique todos os status**
3. **Clique em "Verificar Manifest"**
4. **Clique em "Verificar Service Worker"**
5. **Clique em "Forçar Prompt de Instalação"**
6. **Verifique os logs**
7. **Abra o DevTools e verifique:**
   - Application → Manifest
   - Application → Service Workers
   - Console → Erros

### 🚨 Problemas Comuns

#### "Manifest não encontrado"
- Verificar se o arquivo existe em `/public/manifest.json`
- Verificar se o Vite está servindo arquivos estáticos

#### "Service Worker não registrado"
- Verificar se `/public/sw.js` existe
- Verificar se está sendo registrado no `main.js`
- Limpar cache do navegador

#### "Ícones não carregam"
- Executar o script de geração de ícones
- Verificar se os arquivos existem
- Verificar caminhos no manifest

#### "Prompt não aparece"
- Verificar se está em HTTPS/localhost
- Verificar se não está já instalada
- Testar em navegador diferente
- Verificar se todos os critérios estão atendidos

### 📞 Próximos Passos

Se ainda não funcionar:

1. **Compartilhe os logs** do `/pwa-debug`
2. **Compartilhe os erros** do console
3. **Teste em navegador diferente**
4. **Verifique se está em HTTPS** (se não for localhost)

### 🎯 Checklist Final

- [ ] Aplicação rodando em HTTPS ou localhost
- [ ] Manifest.json acessível em `/manifest.json`
- [ ] Service worker registrado e ativo
- [ ] Ícones existem e são acessíveis
- [ ] Evento beforeinstallprompt sendo capturado
- [ ] Não está já instalada
- [ ] Navegador compatível
- [ ] Sem erros no console 