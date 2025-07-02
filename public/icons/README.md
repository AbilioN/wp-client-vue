
# Ícones da PWA

Este diretório contém os ícones necessários para a PWA.

## Tamanhos necessários:
- 16x16 - Favicon
- 32x32 - Favicon
- 72x72 - Android
- 96x96 - Android
- 128x128 - Android
- 144x144 - Android
- 152x152 - iOS
- 192x192 - Android/iOS
- 384x384 - Android
- 512x512 - Android/iOS

## Como gerar ícones reais:

### Opção 1: Ferramenta online
1. Acesse https://realfavicongenerator.net/
2. Faça upload de um ícone de alta resolução (512x512 ou maior)
3. Configure as opções
4. Baixe e extraia os ícones para este diretório

### Opção 2: Sharp (Node.js)
```bash
npm install sharp
```

### Opção 3: GIMP/Photoshop
1. Crie um ícone de 512x512 pixels
2. Exporte nos tamanhos necessários
3. Salve com os nomes corretos

## Estrutura esperada:
/icons/
  icon-16x16.png
  icon-32x32.png
  icon-72x72.png
  icon-96x96.png
  icon-128x128.png
  icon-144x144.png
  icon-152x152.png
  icon-192x192.png
  icon-384x384.png
  icon-512x512.png
