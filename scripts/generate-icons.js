#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Tamanhos dos ícones necessários
const iconSizes = [
  16, 32, 72, 96, 128, 144, 152, 192, 384, 512
]

// Criar diretório de ícones se não existir
const iconsDir = path.join(__dirname, '../public/icons')
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// Template SVG para o ícone (você pode substituir por um ícone real)
const iconSVG = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#667eea" rx="64"/>
  <text x="256" y="300" font-family="Arial, sans-serif" font-size="200" font-weight="bold" text-anchor="middle" fill="white">🛍️</text>
  <text x="256" y="400" font-family="Arial, sans-serif" font-size="60" font-weight="bold" text-anchor="middle" fill="white">WP</text>
</svg>
`

// Função para gerar ícone PNG (simulado - você precisará de uma biblioteca real como sharp)
function generateIcon(size) {
  const filename = `icon-${size}x${size}.png`
  const filepath = path.join(iconsDir, filename)
  
  // Por enquanto, vamos criar um arquivo placeholder
  // Em produção, você usaria uma biblioteca como 'sharp' para converter SVG para PNG
  const placeholderContent = `# Placeholder para ícone ${size}x${size}
# Substitua este arquivo por um ícone PNG real de ${size}x${size} pixels`
  
  fs.writeFileSync(filepath, placeholderContent)
  console.log(`✅ Criado: ${filename}`)
}

// Gerar todos os ícones
console.log('🎨 Gerando ícones da PWA...')
iconSizes.forEach(size => {
  generateIcon(size)
})

console.log('\n📝 Próximos passos:')
console.log('1. Substitua os arquivos placeholder por ícones PNG reais')
console.log('2. Use uma ferramenta como https://realfavicongenerator.net/')
console.log('3. Ou instale sharp: npm install sharp')
console.log('4. Atualize o script para gerar PNGs reais do SVG')

// Criar arquivo de instruções
const instructions = `
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
\`\`\`bash
npm install sharp
\`\`\`

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
`

fs.writeFileSync(path.join(iconsDir, 'README.md'), instructions)
console.log('\n📖 Criado: public/icons/README.md com instruções') 