import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Criar ícone simples com texto
async function createIcon(size) {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#667eea"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.3}" 
            fill="white" text-anchor="middle" dy="0.35em">WP</text>
    </svg>
  `
  
  return sharp(Buffer.from(svg))
    .png()
    .toBuffer()
}

// Tamanhos dos ícones
const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512]

console.log('🎨 Gerando ícones PNG reais...')

// Criar diretório se não existir
const iconsDir = path.join(__dirname, '../public/icons')
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// Gerar ícones
async function generateIcons() {
  for (const size of sizes) {
    const filename = `icon-${size}x${size}.png`
    const filepath = path.join(iconsDir, filename)
    
    try {
      const iconBuffer = await createIcon(size)
      fs.writeFileSync(filepath, iconBuffer)
      console.log(`✅ Criado: ${filename} (${iconBuffer.length} bytes)`)
    } catch (error) {
      console.error(`❌ Erro ao criar ${filename}:`, error.message)
    }
  }
  
  console.log('\n🎉 Ícones gerados com sucesso!')
  console.log('📝 Agora a PWA deve funcionar corretamente.')
}

generateIcons() 