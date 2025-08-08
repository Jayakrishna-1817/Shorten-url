#!/usr/bin/env node
import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, copyFileSync } from 'fs';

async function buildProject() {
  console.log('🚀 Building with proper file naming...');
  
  try {
    // Build with Vite
    execSync('npx vite build', { 
      stdio: 'inherit',
      timeout: 120000,
      env: {
        ...process.env,
        ROLLUP_NO_NATIVE: '1',
        NODE_ENV: 'production'
      }
    });
    
    // Rename the output file to index.html
    if (existsSync('dist/index.dev.html')) {
      copyFileSync('dist/index.dev.html', 'dist/index.html');
      console.log('✅ Renamed index.dev.html to index.html');
    }
    
    // Verify the output
    if (existsSync('dist/index.html')) {
      const htmlContent = readFileSync('dist/index.html', 'utf8');
      if (htmlContent.includes('/assets/') && !htmlContent.includes('/src/main.jsx')) {
        console.log('✅ Build completed with proper asset references!');
      } else {
        console.error('❌ Built HTML has incorrect references');
      }
    }
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

buildProject();
