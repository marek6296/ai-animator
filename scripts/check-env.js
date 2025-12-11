#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const envPath = path.join(process.cwd(), '.env')
const envExamplePath = path.join(process.cwd(), '.env.example')

console.log('🔍 Kontrola nastavenia projektu...\n')

// Kontrola .env súboru
if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env súbor neexistuje!')
  if (fs.existsSync(envExamplePath)) {
    console.log('📋 Vytváram .env súbor z .env.example...')
    fs.copyFileSync(envExamplePath, envPath)
    console.log('✅ .env súbor bol vytvorený. Prosím, vyplňte OPENAI_API_KEY!\n')
  } else {
    console.log('❌ .env.example súbor neexistuje!')
    process.exit(1)
  }
} else {
  console.log('✅ .env súbor existuje')
  
  // Kontrola API kľúča
  const envContent = fs.readFileSync(envPath, 'utf8')
  if (envContent.includes('your_openai_api_key_here') || !envContent.includes('OPENAI_API_KEY=')) {
    console.log('⚠️  OPENAI_API_KEY nie je nastavený v .env súbore!')
    console.log('   Prosím, pridajte svoj OpenAI API kľúč do .env súboru.\n')
  } else {
    console.log('✅ OPENAI_API_KEY je nastavený\n')
  }
}

// Kontrola node_modules
const nodeModulesPath = path.join(process.cwd(), 'node_modules')
if (!fs.existsSync(nodeModulesPath)) {
  console.log('⚠️  node_modules neexistuje!')
  console.log('   Spustite: npm install\n')
} else {
  console.log('✅ node_modules existuje\n')
}

console.log('✨ Kontrola dokončená!')


