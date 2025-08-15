#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔧 Building URL Shortener without Vite...')

// Create dist directory
const distDir = path.join(__dirname, 'dist')
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true })
}
fs.mkdirSync(distDir)

// Copy index.html and replace script src
let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8')
html = html.replace('/src/main.jsx', './main.js')
fs.writeFileSync(path.join(distDir, 'index.html'), html)

// Copy CSS
const css = fs.readFileSync(path.join(__dirname, 'src/ModernApp.css'), 'utf-8')
fs.writeFileSync(path.join(distDir, 'style.css'), css)

// Create a simple bundle
const jsx = `
// Simple React bundle for production
import React from 'https://esm.sh/react@18.3.1'
import ReactDOM from 'https://esm.sh/react-dom@18.3.1/client'

// URL Shortener App
const API_BASE_URL = 'https://url-shortener-backend.onrender.com'

// Your app code here - simplified
const App = () => {
  return React.createElement('div', { style: { padding: '20px', textAlign: 'center' } }, [
    React.createElement('h1', { key: 'title' }, 'URL Shortener'),
    React.createElement('p', { key: 'desc' }, 'Simple URL shortening service'),
    React.createElement('div', { key: 'status' }, 'Backend API: ' + API_BASE_URL)
  ])
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(React.createElement(App))
`

fs.writeFileSync(path.join(distDir, 'main.js'), jsx)

console.log('✅ Build complete! Files created:')
console.log('- dist/index.html')
console.log('- dist/main.js')
console.log('- dist/style.css')
